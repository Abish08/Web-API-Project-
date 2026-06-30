import { Request, Response } from "express";
import { UserRepositoryMongo } from "../../repositories/user.repository";
import { UserCollection } from "../../models/user.model";
import bcrypt from "bcryptjs";

const userRepo = new UserRepositoryMongo();

export class AdminUserController {
  
  // 1. Get all users with pagination and search
  async getAllUserPaginated(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const { data, total } = await userRepo.getAllPaginated(page, limit, search);
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data,
        meta: { page, limit, total, totalPages },
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  // 2. Get single user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userRepo.findById(id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(200).json({ success: true, message: "User retrieved successfully", data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  // 3. Create a new user
  async createUser(req: Request, res: Response) {
    try {
      const { firstName, lastName, email, username, password, role } = req.body;

      // Check if email or username already exists
      const existingEmail = await userRepo.findByEmail(email);
      if (existingEmail) return res.status(400).json({ success: false, message: "Email already exists" });

      const existingUsername = await userRepo.findByUsername(username);
      if (existingUsername) return res.status(400).json({ success: false, message: "Username already exists" });

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await userRepo.create({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        role: role || "user", // Default to user if not provided
      });

      return res.status(201).json({ success: true, message: "User created successfully", data: newUser });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  // 4. Update an existing user
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, username, password, role } = req.body;

      const existingUser = await userRepo.findById(id);
      if (!existingUser) return res.status(404).json({ success: false, message: "User not found" });

      // Check email uniqueness if changed
      if (email && email !== existingUser.email) {
        const emailExists = await userRepo.findByEmail(email);
        if (emailExists) return res.status(400).json({ success: false, message: "Email already exists" });
      }

      // Check username uniqueness if changed
      if (username && username !== existingUser.username) {
        const usernameExists = await userRepo.findByUsername(username);
        if (usernameExists) return res.status(400).json({ success: false, message: "Username already exists" });
      }

      // Prepare update data
      const updateData: any = { firstName, lastName, email, username, role };
      
      // Hash new password if provided
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      // Remove undefined fields
      Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

      const updatedUser = await userRepo.updateUser(id, updateData);
      return res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }

  // 5. Delete a user
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deletedUser = await UserCollection.findByIdAndDelete(id);
      
      if (!deletedUser) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      
      return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
  }
}