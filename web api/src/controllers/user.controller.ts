import { UserService } from "../services/user.service";
import { z } from "zod";
import { RegisterUserDTO, AuthenticateUserDTO } from "../dtos/user.dto";
import { ResponseFormatter } from "../utils/apihelper.util";
import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";

const userServiceInstance = new UserService();

// Register User
export const registerUser = async (req: Request, res: Response) => {
  try {
    const validationResult = RegisterUserDTO.safeParse(req.body);
    if (!validationResult.success) {
      return ResponseFormatter.errorResponse(
        res,
        z.prettifyError(validationResult.error),
        400
      );
    }

    const newUser = await userServiceInstance.registerNewUser(validationResult.data);
    return ResponseFormatter.successResponse(res, newUser, "Membership created successfully");
  } catch (error: any) {
    return ResponseFormatter.errorResponse(res, error.message, error.status || 500);
  }
};

// Login User
export const loginUser = async (req: Request, res: Response) => {
  try {
    const validationResult = AuthenticateUserDTO.safeParse(req.body);
    if (!validationResult.success) {
      return ResponseFormatter.errorResponse(
        res,
        z.prettifyError(validationResult.error),
        400
      );
    }

    const authResult = await userServiceInstance.authenticateUser(validationResult.data);
    return ResponseFormatter.successResponse(
      res,
      { user: authResult.user, token: authResult.token },
      "Access granted"
    );
  } catch (error: any) {
    return ResponseFormatter.errorResponse(res, error.message, error.status || 500);
  }
};

// Who Am I
export const whoami = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return ResponseFormatter.errorResponse(res, "Not authenticated", 401);
    }

    const user = await userServiceInstance.getUserById(req.user.id);
    
    // Return user without password
    const { password, ...userData } = user.toObject();
    
    return ResponseFormatter.successResponse(res, userData, "User details fetched");
  } catch (error: any) {
    return ResponseFormatter.errorResponse(res, error.message, error.status || 500);
  }
};

// Update Profile
export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return ResponseFormatter.errorResponse(res, "Not authenticated", 401);
    }

    const { firstName, lastName, email, username } = req.body;
    const profileImage = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedUser = await userServiceInstance.updateUserProfile(
      req.user.id,
      { firstName, lastName, email, username },
      profileImage
    );

    const { password, ...userData } = updatedUser!.toObject();

    return ResponseFormatter.successResponse(res, userData, "Profile updated successfully");
  } catch (error: any) {
    return ResponseFormatter.errorResponse(res, error.message, error.status || 500);
  }
};

// Change Password
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return ResponseFormatter.errorResponse(res, "Not authenticated", 401);
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return ResponseFormatter.errorResponse(res, "Old and new passwords required", 400);
    }

    if (newPassword.length < 6) {
      return ResponseFormatter.errorResponse(res, "New password must be at least 6 characters", 400);
    }

    const result = await userServiceInstance.changePassword(
      req.user.id,
      oldPassword,
      newPassword
    );

    return ResponseFormatter.successResponse(res, result, result.message);
  } catch (error: any) {
    return ResponseFormatter.errorResponse(res, error.message, error.status || 500);
  }
};