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
import { PasswordRecoveryController } from "../controllers/passwordRecovery.controller";
import { asyncHandler } from "../utils/asyncHandler.util";

const userRouter = Router();
const passwordRecoveryController = new PasswordRecoveryController();

// Public routes
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/forgot-password", asyncHandler((req, res) => passwordRecoveryController.forgotPassword(req, res)));
userRouter.post("/verify-otp", asyncHandler((req, res) => passwordRecoveryController.verifyOtp(req, res)));
userRouter.post("/reset-password", asyncHandler((req, res) => passwordRecoveryController.resetPassword(req, res)));

// Protected routes
userRouter.get("/whoami", authMiddleware, whoami);
userRouter.put("/update", authMiddleware, upload.single("image"), updateProfile);
userRouter.put("/change-password", authMiddleware, changePassword);

export default userRouter;
