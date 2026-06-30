import apiClient from "./axios-instance";
import { API } from "./endpoints";

export const register = async (data: any) => {
  try {
    const response = await apiClient.post(API.AUTH.REGISTER, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Registration failed");
  }
};

export const login = async (data: any) => {
  try {
    const response = await apiClient.post(API.AUTH.LOGIN, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Login failed");
  }
};

export const whoami = async () => {
  try {
    const response = await apiClient.get(API.AUTH.WHOAMI);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Fetch user failed");
  }
};

export const updateProfile = async (formData: FormData) => {
  try {
    const response = await apiClient.put(API.AUTH.UPDATE_PROFILE, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Update profile failed");
  }
};

export const changePassword = async (data: { oldPassword: string; newPassword: string }) => {
  try {
    const response = await apiClient.put(API.AUTH.CHANGE_PASSWORD, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Change password failed");
  }
};