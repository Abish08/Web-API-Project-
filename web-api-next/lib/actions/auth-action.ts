"use server";

import { login, register, whoami, updateProfile, changePassword } from "@/lib/api/auth";
import { setTokenCookie, storeUserData, clearAuthCookies } from "@/lib/cookies";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// LOGIN
export const handleLoginUser = async (data: { email: string; password: string }) => {
  try {
    const response = await login(data);
    if (response.success) {
      await setTokenCookie(response.data.token);
      await storeUserData(response.data.user);

      // --- SMART REDIRECT LOGIC ---
      const userRole = response.data.user.role;
      
      if (userRole === "admin") {
        redirect("/admin");
      } else {
        redirect("/dashboard");
      }
      // ----------------------------

      return {
        success: true,
        message: response.message || "Login successful",
        data: response.data,
      };
    }
    return { success: false, message: response.message || "Login failed" };
  } catch (error: any) {
    return { success: false, message: error.message || "Login action failed" };
  }
};

// REGISTER
export const handleRegisterUser = async (data: any) => {
  try {
    const response = await register(data);
    if (response.success) {
      return {
        success: true,
        message: response.message || "Registration successful",
        data: response.data,
      };
    }
    return { success: false, message: response.message || "Registration failed" };
  } catch (error: any) {
    return { success: false, message: error.message || "Registration action failed" };
  }
};

// WHOAMI (Get current user)
export const handleWhoami = async () => {
  try {
    const response = await whoami();
    if (response.success) {
      return { success: true, data: response.data };
    }
    return { success: false, message: response.message || "Whoami failed" };
  } catch (error: any) {
    return { success: false, message: error.message || "Whoami action failed" };
  }
};

// UPDATE PROFILE
export const handleUpdateProfile = async (formData: FormData) => {
  try {
    const response = await updateProfile(formData);
    if (response.success) {
      await storeUserData(response.data);
      revalidatePath("/profile");
      return {
        success: true,
        message: "Profile updated successfully",
        data: response.data,
      };
    }
    return { success: false, message: response.message || "Update profile failed" };
  } catch (error: any) {
    return { success: false, message: error.message || "Update profile action failed" };
  }
};

// CHANGE PASSWORD
export const handleChangePassword = async (data: { oldPassword: string; newPassword: string }) => {
  try {
    const response = await changePassword(data);
    if (response.success) {
      return {
        success: true,
        message: response.message || "Password changed successfully",
      };
    }
    return { success: false, message: response.message || "Change password failed" };
  } catch (error: any) {
    return { success: false, message: error.message || "Change password action failed" };
  }
};

// LOGOUT
export const handleLogout = async () => {
  await clearAuthCookies();
  redirect("/login");
};