// MongoDB connection handler
import mongoose from "mongoose";
import { DATABASE_URL } from "../configs/constant";

/**
 * Establishes connection to MongoDB database
 * Logs success or error message to console
 */
export const initializeDatabase = async () => {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};