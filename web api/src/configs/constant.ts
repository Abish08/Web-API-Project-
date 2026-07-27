import dotenv from "dotenv";

dotenv.config();

export const SERVER_PORT: number = Number(process.env.PORT) || 8089;
export const DATABASE_URL: string =
  process.env.MONGODB_URI || process.env.MONGODB_URL || "mongodb://localhost:27017/nutrinepal";
export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

export const requireEnv = () => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required. Add it to your environment or .env file.");
  }
};
