// API route definitions for user endpoints
import { UserController } from "../controllers/user.controller";
import { Router } from "express";

// Create router instance
const userRouter = Router();

// Initialize controller
const userControllerInstance = new UserController();

// Define authentication routes
userRouter.post("/register", userControllerInstance.registerUser);
userRouter.post("/login", userControllerInstance.loginUser);

export default userRouter;