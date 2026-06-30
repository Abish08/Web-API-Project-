import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/constant";
import { ResponseFormatter } from "../utils/apihelper.util";
import { UserRepositoryMongo } from "../repositories/user.repository";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string; // <-- Added role
  };
}

const userRepo = new UserRepositoryMongo();

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return ResponseFormatter.errorResponse(res, "No token provided", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

    // Fetch user from database to get their role
    const user = await userRepo.findById(decoded.id);
    
    if (!user) {
      return ResponseFormatter.errorResponse(res, "User not found", 404);
    }

    // Attach complete user info including role
    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role, // <-- Now includes role!
    };

    next();
  } catch (error) {
    return ResponseFormatter.errorResponse(res, "Invalid or expired token", 401);
  }
};