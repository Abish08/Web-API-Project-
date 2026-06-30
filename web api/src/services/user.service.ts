import { UserRepositoryMongo } from "../repositories/user.repository";
import { RegisterUserDTO, AuthenticateUserDTO } from "../dtos/user.dto";
import { CustomHttpException } from "../exceptions/http-exception";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs/constant";

const userRepoInstance = new UserRepositoryMongo();

export class UserService {
  async registerNewUser(userData: RegisterUserDTO) {
    const existingUser = await userRepoInstance.findByEmail(userData.email);
    if (existingUser) {
      throw new CustomHttpException(400, "Email already registered");
    }

    const existingUsername = await userRepoInstance.findByUsername(userData.username);
    if (existingUsername) {
      throw new CustomHttpException(400, "Username already taken");
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    userData.password = hashedPassword;

    return await userRepoInstance.create(userData);
  }

  async authenticateUser(loginData: AuthenticateUserDTO) {
    const user = await userRepoInstance.findByEmail(loginData.email);
    if (!user) {
      throw new CustomHttpException(400, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new CustomHttpException(400, "Invalid credentials");
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    return { user, token };
  }

  // NEW: Get user by ID (for Whoami)
  async getUserById(userId: string) {
    const user = await userRepoInstance.findById(userId);
    if (!user) {
      throw new CustomHttpException(404, "User not found");
    }
    return user;
  }

  // NEW: Update user profile
  async updateUserProfile(userId: string, updateData: any, profileImage?: string) {
    const user = await userRepoInstance.findById(userId);
    if (!user) {
      throw new CustomHttpException(404, "User not found");
    }

    // Check if email is being changed and already exists
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await userRepoInstance.findByEmail(updateData.email);
      if (existingUser) {
        throw new CustomHttpException(400, "Email already in use");
      }
    }

    // Check if username is being changed and already exists
    if (updateData.username && updateData.username !== user.username) {
      const existingUsername = await userRepoInstance.findByUsername(updateData.username);
      if (existingUsername) {
        throw new CustomHttpException(400, "Username already taken");
      }
    }

    if (profileImage) {
      updateData.profileImage = profileImage;
    }

    const updatedUser = await userRepoInstance.updateUser(userId, updateData);
    return updatedUser;
  }

  // NEW: Change password
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const user = await userRepoInstance.findById(userId);
    if (!user) {
      throw new CustomHttpException(404, "User not found");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new CustomHttpException(400, "Current password is incorrect");
    }

    await userRepoInstance.updatePassword(userId, newPassword);
    return { message: "Password changed successfully" };
  }
}