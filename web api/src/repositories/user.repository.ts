import { UserCollection, IUserDocument } from "../models/user.model";
import bcrypt from "bcryptjs";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUserDocument | null>;
  findByGoogleId(googleId: string): Promise<IUserDocument | null>;
  findByUsername(username: string): Promise<IUserDocument | null>;
  create(userData: Partial<IUserDocument>): Promise<IUserDocument>;
  findById(id: string): Promise<IUserDocument | null>;
  findByIdWithPassword(id: string): Promise<IUserDocument | null>;
  updateUser(id: string, updateData: Partial<IUserDocument>): Promise<IUserDocument | null>;
  updatePassword(id: string, newPassword: string): Promise<IUserDocument | null>;
  //  pagination method to interface
  getAllPaginated(
    page: number,
    limit: number,
    search?: string
  ): Promise<{ data: IUserDocument[]; total: number }>;
}

export class UserRepositoryMongo implements IUserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return await UserCollection.findOne({ _id: id });
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return await UserCollection.findOne({ email }).select("+password");
  }

  async findByGoogleId(googleId: string): Promise<IUserDocument | null> {
    return await UserCollection.findOne({ googleId });
  }

  async findByUsername(username: string): Promise<IUserDocument | null> {
    return await UserCollection.findOne({ username });
  }

  async findByIdWithPassword(id: string): Promise<IUserDocument | null> {
    return await UserCollection.findOne({ _id: id }).select("+password");
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

  //  Pagination and Search Method
  async getAllPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ data: IUserDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    // Build search query
    const query: any = {};
    if (search && search.trim() !== "") {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Fetch data and total count in parallel
    const [data, total] = await Promise.all([
      UserCollection.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      UserCollection.countDocuments(query)
    ]);

    return { data, total };
  }
}
