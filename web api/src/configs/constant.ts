import dotenv from "dotenv";

dotenv.config();

export const SERVER_PORT: number = Number(process.env.PORT) || 8089;
export const DATABASE_URL: string =
  process.env.MONGODB_URI || process.env.MONGODB_URL || "mongodb://localhost:27017/nutrinepal";
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:8089/api/v1/auth/google/callback";

export const requireEnv = () => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required. Add it to your environment or .env file.");
  }
};
