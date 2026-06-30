import { UserCollection, IUserDocument } from "../models/user.model";
import bcrypt from "bcryptjs";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByUsername(username: string): Promise<IUserDocument | null>;
  create(userData: Partial<IUserDocument>): Promise<IUserDocument>;
  findById(id: string): Promise<IUserDocument | null>;
  updateUser(id: string, updateData: Partial<IUserDocument>): Promise<IUserDocument | null>;
  updatePassword(id: string, newPassword: string): Promise<IUserDocument | null>;
}

export class UserRepositoryMongo implements IUserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return await UserCollection.findOne({ _id: id });
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await UserCollection.findOne({ email });
  }

  // THIS IS THE MISSING FUNCTION
  async findByUsername(username: string): Promise<IUserDocument | null> {
    return await UserCollection.findOne({ username });
  }

  async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    return await UserCollection.create(userData);
  }

  async updateUser(id: string, updateData: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return await UserCollection.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
  }

  async updatePassword(id: string, newPassword: string): Promise<IUserDocument | null> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await UserCollection.findByIdAndUpdate(
      id,
      { $set: { password: hashedPassword } },
      { new: true }
    );
  }
}