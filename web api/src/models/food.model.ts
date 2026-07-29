import mongoose, { Schema, Document } from "mongoose";

export interface IFood extends Document {
  name: string;
  category: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  description?: string;
  dietaryTags?: string[];
  allergens?: string[];
  suitableGoals?: string[];
  healthTags?: string[];
  isActive: boolean;
  
  // Recipe fields
  recipe?: {
    ingredients: string[];
    instructions: string[];
    prepTime: number; // in minutes
    cookTime: number; // in minutes
    servings: number;
    difficulty: "Easy" | "Medium" | "Hard";
  };
  
  //  Images
  images?: Array<{
    url: string;
    publicId: string;
  }>;
  thumbnail?: {
    url: string;
    publicId: string;
  };
  
  isApproved: boolean;
  createdBy?: mongoose.Types.ObjectId;
}

const foodSchema = new Schema<IFood>(
  {
    name: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      required: true,
      enum: ["Breakfast", "Lunch", "Dinner", "Snacks", "Beverages", "Fruits", "Vegetables", "Grains", "Protein", "Dairy"]
    },
    servingSize: { type: Number, required: true, min: 0 },
    calories: { type: Number, required: true, min: 0 },
    protein: { type: Number, required: true, min: 0 },
    carbs: { type: Number, required: true, min: 0 },
    fats: { type: Number, required: true, min: 0 },
    fiber: { type: Number, default: 0, min: 0 },
    sugar: { type: Number, default: 0, min: 0 },
    sodium: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true },
    dietaryTags: [{ type: String, trim: true }],
    allergens: [{ type: String, trim: true }],
    suitableGoals: [{ type: String, enum: ["lose", "maintain", "gain"] }],
    healthTags: [{ type: String, trim: true }],
    
    //  Recipe fields
    recipe: {
      ingredients: [{ type: String }],
      instructions: [{ type: String }],
      prepTime: { type: Number, default: 0 },
      cookTime: { type: Number, default: 0 },
      servings: { type: Number, default: 1 },
      difficulty: { 
        type: String, 
        enum: ["Easy", "Medium", "Hard"],
        default: "Medium"
      },
    },
    
    // Images
    images: [{
      url: String,
      publicId: String,
    }],
    thumbnail: {
      url: String,
      publicId: String,
    },
    
    isApproved: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

foodSchema.index({ name: "text", category: 1 });

export const Food = mongoose.model<IFood>("Food", foodSchema);
