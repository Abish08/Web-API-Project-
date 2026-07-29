// Data Transfer Objects for user operations
import { z } from "zod";
import { UserValidationSchema } from "../types/user.type";

// DTO for user registration - picks only client-sent fields
export const RegisterUserDTO = UserValidationSchema.pick({
  firstName: true,
  lastName: true,
  email: true,
  username: true,
  password: true
});

export type RegisterUserDTO = z.infer<typeof RegisterUserDTO>;

// DTO for user login - only email and password needed
export const AuthenticateUserDTO = UserValidationSchema.pick({
  email: true,
  password: true
});

export type AuthenticateUserDTO = z.infer<typeof AuthenticateUserDTO>;