import apiClient from "../axios-instance";
import { API } from "../endpoints";

export const getAllUsers = async (params: { page?: number; limit?: number; search?: string }) => {
  try {
    const response = await apiClient.get(API.ADMIN.USERS.GET_ALL, { params });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch users");
  }
};

export const getUserById = async (id: string) => {
  try {
    const response = await apiClient.get(API.ADMIN.USERS.GET_BY_ID(id));
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch user");
  }
};

export const createUser = async (data: any) => {
  try {
    const response = await apiClient.post(API.ADMIN.USERS.CREATE, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to create user");
  }
};

export const updateUser = async (id: string, data: any) => {
  try {
    const response = await apiClient.put(API.ADMIN.USERS.UPDATE(id), data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to update user");
  }
};

export const deleteUser = async (id: string) => {
  try {
    const response = await apiClient.delete(API.ADMIN.USERS.DELETE(id));
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to delete user");
  }
};