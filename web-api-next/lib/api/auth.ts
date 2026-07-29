import apiClient from "./axios-instance";
import { API } from "./endpoints";
import { ApiResponse, getErrorMessage, User } from "./types";

export type RegisterPayload = {
  firstName: string;
  lastName?: string;
  email: string;
  username: string;
  password: string;
  confirmPassword?: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export const register = async (data: RegisterPayload): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.post(API.AUTH.REGISTER, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Registration failed"));
  }
};

export const login = async (data: LoginPayload): Promise<ApiResponse<{ user: User; token: string }>> => {
  try {
    const response = await apiClient.post(API.AUTH.LOGIN, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Login failed"));
  }
};

export const whoami = async (): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.get(API.AUTH.WHOAMI);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Fetch user failed"));
  }
};

export const updateProfile = async (formData: FormData): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.put(API.AUTH.UPDATE_PROFILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Update profile failed"));
  }
};

export const changePassword = async (data: { oldPassword: string; newPassword: string }): Promise<ApiResponse<unknown>> => {
  try {
    const response = await apiClient.put(API.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Change password failed"));
  }
};

export const forgotPassword = async (data: { email: string }): Promise<ApiResponse<unknown>> => {
  try {
    const response = await apiClient.post(API.AUTH.FORGOT_PASSWORD, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to request reset code"));
  }
};

export const verifyOtp = async (data: { email: string; otp: string }): Promise<ApiResponse<unknown>> => {
  try {
    const response = await apiClient.post(API.AUTH.VERIFY_OTP, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to verify OTP"));
  }
};

export const resetPassword = async (data: { email: string; otp: string; newPassword: string }): Promise<ApiResponse<unknown>> => {
  try {
    const response = await apiClient.post(API.AUTH.RESET_PASSWORD, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to reset password"));
  }
};
