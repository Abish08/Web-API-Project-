import express, { Application, NextFunction, Request, Response } from "express";
import { CustomHttpException } from "./exceptions/http-exception";
import { ResponseFormatter } from "./utils/apihelper.util";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.route";
import adminUserRouter from "./routes/admin/user.route";
import path from "path";
import healthProfileRoutes from "./routes/healthProfile.route";
import foodRoutes from "./routes/food.route";
import workoutRoutes from "./routes/workout.route";
import foodLogRoutes from "./routes/foodLog.route";
import workoutLogRoutes from "./routes/workoutLog.route";
import progressRouter from "./routes/progress.route";
import uploadRouter from "./routes/upload.route";
import { CLIENT_URL } from "./configs/constant";
import recommendationRouter from "./routes/recommendation.route";
import adminStatsRouter from "./routes/admin/stats.route";

const app: Application = express();

const corsConfiguration = {
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsConfiguration));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("combined"));

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/v1/health-profile", healthProfileRoutes);
app.use("/api/v1/foods", foodRoutes);
app.use("/api/v1/workouts", workoutRoutes);
app.use("/api/v1/auth", userRouter);
app.use("/api/v1/admin/users", adminUserRouter);
app.use("/api/v1/admin/stats", adminStatsRouter);
app.use("/api/v1/food-logs", foodLogRoutes);
app.use("/api/v1/workout-logs", workoutLogRoutes);
app.use("/api/v1/progress", progressRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/recommendations", recommendationRouter);

app.use((req: Request, res: Response) => {
  return res.status(404).json({ success: false, message: "Endpoint not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof CustomHttpException) {
    return ResponseFormatter.errorResponse(res, err.message, err.statusCode);
  }

  console.error("Error occurred:", err);
  return ResponseFormatter.errorResponse(res, "Internal Server Error", 500);
});

export default app;
