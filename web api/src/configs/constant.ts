// Load environment variables from .env file
import dotenv from "dotenv";
dotenv.config();

// Server configuration constants
export const SERVER_PORT: number = Number(process.env.PORT) || 8089;

// Database connection string
export const DATABASE_URL: string =
  process.env.MONGODB_URL || "mongodb://localhost:27017/sprint2-db";

// JWT secret key for token generation
export const JWT_SECRET: string =
  process.env.SECRET_KEY || "defaultsecretkey2026";