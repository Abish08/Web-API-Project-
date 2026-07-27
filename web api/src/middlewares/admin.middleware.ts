import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth.type";

export const adminMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized: No user info" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
  }

  next();
};
