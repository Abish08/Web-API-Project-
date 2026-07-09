import { Request, Response } from "express";
import { WorkoutService } from "../services/workout.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const workoutService = new WorkoutService();

export class WorkoutController {
  // Create workout with images and video URL
  async createWorkoutWithMedia(req: Request, res: Response) {
    try {
      const workoutData: any = req.body;
      
      // Add createdBy if user is authenticated
      if ((req as AuthRequest).user) {
        workoutData.createdBy = (req as AuthRequest).user!.id;
      }

      // Initialize media array
      workoutData.media = [];

      // Handle uploaded image files
      if (req.files && Array.isArray(req.files)) {
        const images = (req.files as Express.Multer.File[]).map(file => ({
          type: 'image',
          url: `/uploads/${file.filename}`,
          publicId: file.filename,
        }));
        workoutData.media.push(...images);
      }

      // Handle video URL if provided
      if (req.body.videoUrl) {
        workoutData.media.push({
          type: 'video',
          url: req.body.videoUrl,
          publicId: 'external',
        });
      }

      const workout = await workoutService.createWorkout(workoutData);
      res.status(201).json({ success: true, data: workout });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all workouts
  async getAllWorkouts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const category = req.query.category as string;

      const result = await workoutService.getAllWorkouts(page, limit, search, category);

      res.status(200).json({
        success: true,
        data: result.workouts,
        pagination: {
          total: result.total,
          page,
          pages: Math.ceil(result.total / limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get workout by ID
  async getWorkoutById(req: Request, res: Response) {
    try {
      const id: string = req.params.id as string;
      const workout = await workoutService.getWorkoutById(id);
      res.status(200).json({ success: true, data: workout });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // Update workout with images and video URL
  async updateWorkout(req: Request, res: Response) {
    try {
      const id: string = req.params.id as string;
      const updateData: any = req.body;

      // Initialize media array if files or video URL provided
      if ((req.files && Array.isArray(req.files) && req.files.length > 0) || req.body.videoUrl) {
        updateData.media = [];

        // Handle uploaded image files
        if (req.files && Array.isArray(req.files)) {
          const images = (req.files as Express.Multer.File[]).map(file => ({
            type: 'image',
            url: `/uploads/${file.filename}`,
            publicId: file.filename,
          }));
          updateData.media.push(...images);
        }

        // Handle video URL if provided
        if (req.body.videoUrl) {
          updateData.media.push({
            type: 'video',
            url: req.body.videoUrl,
            publicId: 'external',
          });
        }
      }

      const workout = await workoutService.updateWorkout(id, updateData);
      res.status(200).json({ success: true, data: workout });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Delete workout
  async deleteWorkout(req: Request, res: Response) {
    try {
      const id: string = req.params.id as string;
      await workoutService.deleteWorkout(id);
      res.status(200).json({ success: true, message: "Workout deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get workouts by category
  async getWorkoutsByCategory(req: Request, res: Response) {
    try {
      const category: string = req.params.category as string;
      const workouts = await workoutService.getWorkoutsByCategory(category);
      res.status(200).json({ success: true, data: workouts });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Search workouts
  async searchWorkouts(req: Request, res: Response) {
    try {
      const query: string = req.query.query as string;
      if (!query) {
        return res.status(400).json({ success: false, message: "Search query is required" });
      }
      const workouts = await workoutService.searchWorkouts(query);
      res.status(200).json({ success: true, data: workouts });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get total workouts count
  async getTotalWorkoutsCount(req: Request, res: Response) {
    try {
      const count = await workoutService.getTotalWorkoutsCount();
      res.status(200).json({ success: true, data: { total: count } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}