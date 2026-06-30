import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import {
  registerUser,
  loginUser,
  whoami,
  updateProfile,
  changePassword
} from "../controllers/user.controller";

const userRouter = Router();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Protected routes
userRouter.get("/whoami", authMiddleware, whoami);
userRouter.put("/update", authMiddleware, upload.single("image"), updateProfile);
userRouter.put("/change-password", authMiddleware, changePassword);

export default userRouter;