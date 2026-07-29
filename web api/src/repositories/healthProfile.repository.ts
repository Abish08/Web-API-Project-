import { HealthProfile, IHealthProfile } from "../models/healthProfile.model";
import mongoose from "mongoose";

export class HealthProfileRepository {
  async createOrUpdate(
    data: Partial<IHealthProfile> & { userId: string | mongoose.Types.ObjectId }
  ): Promise<IHealthProfile> {
    return await HealthProfile.findOneAndUpdate(
      { userId: data.userId },
      data,
      { new: true, upsert: true }
    );
  }

  async getByUserId(userId: string): Promise<IHealthProfile | null> {
    return await HealthProfile.findOne({ userId });
  }
}