// Database operations for User collection
import { UserCollection, IUserDocument } from "../models/user.model";

/**
 * Repository interface defining all database operations
 * for user management
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByUsername(username: string): Promise<IUserDocument | null>;
  create(userData: Partial<IUserDocument>): Promise<IUserDocument>;
  findById(id: string): Promise<IUserDocument | null>;
  findAll(): Promise<IUserDocument[]>;
  updateById(id: string, userData: Partial<IUserDocument>): Promise<IUserDocument | null>;
  deleteById(id: string): Promise<boolean>;
}

/**
 * MongoDB implementation of UserRepository
 * Handles all database queries for users
 */
export class UserRepositoryMongo implements IUserRepository {
  
  async findById(id: string): Promise<IUserDocument | null> {
    const user = await UserCollection.findOne({ _id: id });
    return user;
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    const user = await UserCollection.findOne({ email });
    return user;
  }

  async findByUsername(username: string): Promise<IUserDocument | null> {
    const user = await UserCollection.findOne({ username });
    return user;
  }

  async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    const newUser = await UserCollection.create(userData);
    return newUser;
  }

  async findAll(): Promise<IUserDocument[]> {
    const users = await UserCollection.find();
    return users;
  }

  async updateById(id: string, userData: Partial<IUserDocument>): Promise<IUserDocument | null> {
    const updated = await UserCollection.findByIdAndUpdate(id, userData, { new: true });
    return updated;
  }

  async deleteById(id: string): Promise<boolean> {
    const deleted = await UserCollection.findByIdAndDelete(id);
    return !!deleted;
  }
}