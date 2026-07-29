import apiClient from "../axios-instance";
import { API } from "../endpoints";
import { ApiResponse, getErrorMessage, User } from "../types";

export type UserPayload = Partial<Pick<User, "firstName" | "lastName" | "email" | "username" | "role">> & {
  password?: string;
};

export const getAllUsers = async (params: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<User[]>> => {
  try {
    const response = await apiClient.get(API.ADMIN.USERS.GET_ALL, { params });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch users"));
  }
};

export const getUserById = async (id: string): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.get(API.ADMIN.USERS.GET_BY_ID(id));
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to fetch user"));
  }
};

export const createUser = async (data: UserPayload): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.post(API.ADMIN.USERS.CREATE, data);
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to create user"));
  }
};

export const updateUser = async (id: string, data: UserPayload | FormData): Promise<ApiResponse<User>> => {
  try {
    const response = await apiClient.put(API.ADMIN.USERS.UPDATE(id), data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to update user"));
  }
};

export const deleteUser = async (id: string): Promise<ApiResponse<unknown>> => {
  try {
    const response = await apiClient.delete(API.ADMIN.USERS.DELETE(id));
    return response.data;
  } catch (error: unknown) {
    throw new Error(getErrorMessage(error, "Failed to delete user"));
  }
};
