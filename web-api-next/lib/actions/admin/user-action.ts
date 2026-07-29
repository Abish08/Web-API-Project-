"use server";

import { revalidatePath } from "next/cache";
import { getAllUsers, createUser, deleteUser, getUserById, updateUser, UserPayload } from "@/lib/api/admin/user";
import { getErrorMessage } from "@/lib/api/types";

export const handleCreateUser = async (data: UserPayload) => {
  try {
    const result = await createUser(data);
    if (result.success) {
      revalidatePath("/admin/users");
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result.message || "User creation failed" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "User creation failed") };
  }
};

export const handleGetAllUsers = async ({ page, limit, search }: { page?: number; limit?: number; search?: string }) => {
  try {
    const currentPage = page && page > 0 ? page : 1;
    const currentLimit = limit && limit > 0 ? limit : 10;
    const currentSearch = search || "";
    
    const result = await getAllUsers({ page: currentPage, limit: currentLimit, search: currentSearch });
    
    if (result.success) {
      return { 
        success: true, 
        message: result.message, 
        data: result.data, 
        pagination: result.meta 
      };
    }
    return { success: false, message: result.message || "Failed to fetch users" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to fetch users") };
  }
};

export const handleGetUserById = async (id: string) => {
  try {
    const result = await getUserById(id);
    if (result.success) {
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result.message || "Failed to fetch user" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to fetch user") };
  }
};

export const handleUpdateUser = async (id: string, data: UserPayload | FormData) => {
  try {
    const result = await updateUser(id, data);
    if (result.success) {
      revalidatePath("/admin/users");
      return { success: true, message: result.message, data: result.data };
    }
    return { success: false, message: result.message || "Failed to update user" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to update user") };
  }
};

export const handleDeleteUser = async (id: string) => {
  try {
    const result = await deleteUser(id);
    if (result.success) {
      revalidatePath("/admin/users");
      return { success: true, message: result.message };
    }
    return { success: false, message: result.message || "Failed to delete user" };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error, "Failed to delete user") };
  }
};
