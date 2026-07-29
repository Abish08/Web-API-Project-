import { Request, Response } from "express";
import crypto from "crypto";
import { CLIENT_URL, GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "../configs/constant";
import { UserService } from "../services/user.service";

const userService = new UserService();
const baseCookie = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

export const startGoogleAuth = (_req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return res.status(500).send("Google sign-in is not configured");
  const state = crypto.randomBytes(24).toString("hex");
  res.cookie("google_oauth_state", state, { ...baseCookie, maxAge: 600000 });
  const params = new URLSearchParams({ client_id: GOOGLE_CLIENT_ID, redirect_uri: GOOGLE_CALLBACK_URL, response_type: "code", scope: "openid email profile", state, prompt: "select_account" });
  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
};

export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code, state, error } = req.query;
    const savedState = req.cookies.google_oauth_state;
    res.clearCookie("google_oauth_state", baseCookie);
    if (error || typeof code !== "string" || typeof state !== "string" || !savedState || state !== savedState) return res.redirect(`${CLIENT_URL}/login?error=google_cancelled`);
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) throw new Error("Google sign-in is not configured");

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET, redirect_uri: GOOGLE_CALLBACK_URL, grant_type: "authorization_code" }) });
    if (!tokenResponse.ok) throw new Error("Google token exchange failed");
    const tokens = await tokenResponse.json() as { access_token?: string };
    if (!tokens.access_token) throw new Error("Google did not return an access token");
    const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
    if (!profileResponse.ok) throw new Error("Google profile lookup failed");
    const profile = await profileResponse.json() as { sub: string; email?: string; email_verified?: boolean; given_name?: string; family_name?: string; picture?: string };
    if (!profile.email || profile.email_verified === false) throw new Error("Google email is not verified");
    const { user, token } = await userService.authenticateGoogle({ id: profile.sub, email: profile.email, firstName: profile.given_name, lastName: profile.family_name, picture: profile.picture });
    res.cookie("auth_token", token, { ...baseCookie, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("user_data", JSON.stringify(user), { ...baseCookie, httpOnly: false, maxAge: 7 * 24 * 60 * 60 * 1000 });
    return res.redirect(`${CLIENT_URL}/dashboard`);
  } catch (err) {
    console.error("Google sign-in failed:", err);
    return res.redirect(`${CLIENT_URL}/login?error=google_failed`);
  }
};
