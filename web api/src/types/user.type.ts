// Zod schema for user data validation
import { z } from "zod";

// Complete user schema with all fields
export const UserValidationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.email("Please provide a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["admin", "user"]).default("user")
});

// TypeScript type inferred from Zod schema
export type UserDataType = z.infer<typeof UserValidationSchema>;