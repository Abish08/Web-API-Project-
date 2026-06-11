"use server";

import { cookies } from "next/headers";

// Set authentication token cookie
export async function setTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "auth_token",
    value: token,
  });
}

// Get authentication token from cookie
export async function getTokenCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("auth_token")?.value;
}

// Store user data in cookie
export async function storeUserData(userData: any) {
  const cookieStore = await cookies();
  cookieStore.set({
    name: "user_data",
    value: JSON.stringify(userData),
  });
}

// Get cached user data from cookie
export async function getUserData() {
  const cookieStore = await cookies();
  const userDataCookie = cookieStore.get("user_data")?.value;
  return userDataCookie ? JSON.parse(userDataCookie) : null;
}

// Clear all authentication cookies
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");
  cookieStore.delete("user_data");
}