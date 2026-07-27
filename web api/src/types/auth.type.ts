import { Request } from "express";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: "admin" | "user";
};

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
