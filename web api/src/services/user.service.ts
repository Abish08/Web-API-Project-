import { UserRepositoryMongo } from "../repositories/user.repository";
import { RegisterUserDTO, AuthenticateUserDTO } from "../dtos/user.dto";
import { CustomHttpException } from "../exceptions/http-exception";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../configs/constant";
import crypto from "crypto";

const userRepoInstance = new UserRepositoryMongo();

export class UserService {
  private createToken(user: { _id: unknown; email: string; role: string }) {
    return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET!, {
      expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
    });
  }

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
    const user = await userRepoInstance.findByEmail(loginData.email.trim().toLowerCase());
    if (!user) {
      throw new CustomHttpException(400, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new CustomHttpException(400, "Invalid credentials");
    }

    // ✅ FIXED: Include role in the token payload
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role  // ✅ This line was missing!
      },
      JWT_SECRET!,
      { expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"] }
    );

    return { user, token };
  }

  async authenticateGoogle(profile: { id: string; email: string; firstName?: string; lastName?: string; picture?: string }) {
    const email = profile.email.trim().toLowerCase();
    let user = await userRepoInstance.findByGoogleId(profile.id);
    if (!user) user = await userRepoInstance.findByEmail(email);

    if (!user) {
      const base = (email.split("@")[0] || "nutrinepal-user").replace(/[^a-z0-9_]/gi, "").toLowerCase().slice(0, 24) || "nutrinepal-user";
      let username = base;
      while (await userRepoInstance.findByUsername(username)) username = `${base.slice(0, 18)}${crypto.randomInt(1000, 9999)}`;
      user = await userRepoInstance.create({
        firstName: profile.firstName || "Google",
        lastName: profile.lastName || "User",
        email,
        username,
        password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
        googleId: profile.id,
        role: "user",
        ...(profile.picture ? { profilePicture: { url: profile.picture, publicId: "google" } } : {}),
      });
    } else if (!user.googleId) {
      user = (await userRepoInstance.updateUser(String(user._id), { googleId: profile.id })) || user;
    }
    return { user, token: this.createToken(user) };
  }

  // Get user by ID (for Whoami)
  async getUserById(userId: string) {
    const user = await userRepoInstance.findByIdWithPassword(userId);
    if (!user) {
      throw new CustomHttpException(404, "User not found");
    }
    return user;
  }

  // Update user profile
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

  // Change password
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
