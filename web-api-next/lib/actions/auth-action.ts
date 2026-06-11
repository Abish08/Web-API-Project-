"use server";

import { register, login } from "@/lib/api/auth";
import { LoginFormDataType, RegistrationFormData } from "@/app/(auth)/_components/schema";
import { setTokenCookie, storeUserData } from "@/lib/cookies";

export const handleRegisterUser = async (data: RegistrationFormData) => {
  try {
    const result = await register(data);
    if (result.success) {
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result.message || "Registration failed" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Registration failed" };
  }
};

export const handleLoginUser = async (data: LoginFormDataType) => {
  try {
    const result = await login(data);
    
    // Store token + user data in cookies
    await setTokenCookie(result.data.token);
    await storeUserData(result.data.user);

    if (result.success) {
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result.message || "Login failed" };
  } catch (error: any) {
    return { success: false, message: error?.message || "Login failed" };
  }
};