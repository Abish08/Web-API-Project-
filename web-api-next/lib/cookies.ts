"use server";

import { cookies } from "next/headers";
import { User } from "./api/types";

// Set authentication token cookie
export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Get authentication token from cookie
export async function getTokenCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value || null;
}

// Store user data in cookie
export async function storeUserData(userData: User) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "user_data",
    value: JSON.stringify(userData),
    httpOnly: false, // Can be read by client components if needed
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

// Get cached user data from cookie
export async function getUserData(): Promise<User | null> {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data")?.value;
  return userDataCookie ? (JSON.parse(userDataCookie) as User) : null;
}

// Clear all authentication cookies
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_data");
}

// Alias for compatibility (so both names work)
export const getAuthToken = getTokenCookie;
