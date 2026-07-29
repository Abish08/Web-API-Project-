// Zod validation schemas for authentication forms
import { z } from "zod";

// Registration form validation schema
export const RegistrationFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  firstName: z.string("First name is required")
    .min(2, "First name must be at least 2 characters"),
  lastName: z.string("Last name is required")
    .min(2, "Last name must be at least 2 characters"),
  username: z.string("Username is required")
    .min(3, "Username must be at least 3 characters"),
  password: z.string("Password is required")
    .min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string("Please confirm your password")
    .min(6, "Confirm password must be at least 6 characters")
}).refine((formData) => formData.password === formData.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

// TypeScript type for registration form data
export type RegistrationFormData = z.infer<typeof RegistrationFormSchema>;

// Login form validation schema
export const LoginFormSchema = z.object({
  email: z.email("Please enter a valid email address"),
  password: z.string("Password is required")
    .min(6, "Password must be at least 6 characters")
});

// TypeScript type for login form data
export type LoginFormDataType = z.infer<typeof LoginFormSchema>;