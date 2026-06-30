import express, { Application, NextFunction, Request, Response } from "express";
import { CustomHttpException } from "./exceptions/http-exception";
import { ResponseFormatter } from "./utils/apihelper.util";
import cors from "cors";
import morgan from "morgan";
import userRouter from "./routes/user.route";
import adminUserRouter from "./routes/admin/user.route"; // <-- ADDED
import path from "path";

// Create Express application instance
const app: Application = express();

// CORS configuration - allow all origins
const corsConfiguration = {
  origin: ["*"],
  successStatus: 200
};

// Middleware setup
app.use(cors(corsConfiguration));           // Enable CORS
app.use(express.json());                     // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("combined"));                 // HTTP request logger
// Serve static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount authentication routes
app.use("/api/v1/auth", userRouter);

// Mount admin user management routes <-- ADDED
app.use("/api/v1/admin/users", adminUserRouter);

// Handle 404 - Route not found
app.use((req: Request, res: Response) => {
  return res.status(404).json({ message: "Endpoint not found" });
});

// Global error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error occurred:", err);
  
  if (err instanceof CustomHttpException) {
    return ResponseFormatter.errorResponse(res, err.message, err.statusCode);
  }
  
  return ResponseFormatter.errorResponse(res, "Internal Server Error", 500);
});

export default app;