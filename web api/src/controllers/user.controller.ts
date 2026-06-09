// Request handlers for user-related endpoints
import { UserService } from "../services/user.service";
import { z } from "zod";
import { RegisterUserDTO, AuthenticateUserDTO } from "../dtos/user.dto";
import { ResponseFormatter } from "../utils/apihelper.util";
import { Request, Response } from "express";

// Initialize service instance
const userServiceInstance = new UserService();

/**
 * UserController handles HTTP requests and responses
 * for user registration and login operations
 */
export class UserController {
  
  /**
   * Handles user registration request
   * Validates input, calls service, returns response
   */
  async registerUser(req: Request, res: Response) {
    try {
      // Validate request body against DTO schema
      const validationResult = RegisterUserDTO.safeParse(req.body);
      if (!validationResult.success) {
        return ResponseFormatter.errorResponse(
          res, 
          z.prettifyError(validationResult.error), 
          400
        );
      }

      // Call service to create user
      const newUser = await userServiceInstance.registerNewUser(validationResult.data);
      return ResponseFormatter.successResponse(res, newUser, "User registered successfully");
    } catch (error: any) {
      return ResponseFormatter.errorResponse(
        res,
        error.message || "Registration failed",
        error.status || 500
      );
    }
  }

  /**
   * Handles user login request
   * Validates credentials, generates token
   */
  async loginUser(req: Request, res: Response) {
    try {
      // Validate login credentials
      const validationResult = AuthenticateUserDTO.safeParse(req.body);
      if (!validationResult.success) {
        return ResponseFormatter.errorResponse(
          res, 
          z.prettifyError(validationResult.error), 
          400
        );
      }

      // Authenticate user and get token
      const authResult = await userServiceInstance.authenticateUser(validationResult.data);
      return ResponseFormatter.successResponse(
        res, 
        { user: authResult.user, token: authResult.token }, 
        "Login successful"
      );
    } catch (error: any) {
      return ResponseFormatter.errorResponse(
        res,
        error.message || "Login failed",
        error.status || 500
      );
    }
  }
}