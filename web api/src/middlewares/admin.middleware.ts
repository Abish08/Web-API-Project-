import { Request, Response, NextFunction } from "express";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: any; 
    }
  }
}

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Check if user is authenticated (req.user should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized: No user info" });
    }

    // 2. Check if user has admin role
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
    }

    // 3. If both checks pass, allow access
    next();
  } catch (error: any) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};