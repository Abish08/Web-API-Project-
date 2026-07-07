import express, { Application, NextFunction, Request, Response } from "express";
import { CustomHttpException } from "./exceptions/http-exception";
import { ResponseFormatter } from "./utils/apihelper.util";
import cors from "cors";
import morgan from "morgan";
import userRouter from "./routes/user.route";
import adminUserRouter from "./routes/admin/user.route"; 
import path from "path";
import healthProfileRoutes from "./routes/healthProfile.route";
import foodRoutes from "./routes/food.route";
import workoutRoutes from "./routes/workout.route";
import foodLogRoutes from "./routes/foodLog.route";


// Create Express application instance
const app: Application = express();

// CORS configuration - FIXED
const corsConfiguration = {
  origin: "*",  // Allow all origins (for development)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware setup
app.use(cors(corsConfiguration));           // Enable CORS
app.use(express.json());                     // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan("combined"));                 // HTTP request logger

// Serve static uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount routes
app.use("/api/v1/health-profile", healthProfileRoutes);
app.use("/api/v1/foods", foodRoutes);
app.use("/api/v1/workouts", workoutRoutes);
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/admin/users", adminUserRouter);
app.use("/api/v1/food-logs", foodLogRoutes);

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