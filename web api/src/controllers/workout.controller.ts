import { Request, Response } from "express";
import { WorkoutService } from "../services/workout.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const workoutService = new WorkoutService();

export class WorkoutController {
  async createWorkout(req: Request, res: Response) {
    try {
      const workoutData = req.body;
      if ((req as AuthRequest).user) {
        workoutData.createdBy = (req as AuthRequest).user!.id;
      }
      const workout = await workoutService.createWorkout(workoutData);
      res.status(201).json({ success: true, data: workout });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

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

  async getWorkoutById(req: Request, res: Response) {
    try {
      const id: string = req.params.id as string;
      const workout = await workoutService.getWorkoutById(id);
      res.status(200).json({ success: true, data: workout });
    } catch (error: any) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateWorkout(req: Request, res: Response) {
    try {
      const id: string = req.params.id as string;
      const updateData = req.body;
      const workout = await workoutService.updateWorkout(id, updateData);
      res.status(200).json({ success: true, data: workout });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteWorkout(req: Request, res: Response) {
    try {
      const id: string = req.params.id as string;
      await workoutService.deleteWorkout(id);
      res.status(200).json({ success: true, message: "Workout deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getWorkoutsByCategory(req: Request, res: Response) {
    try {
      const category: string = req.params.category as string;
      const workouts = await workoutService.getWorkoutsByCategory(category);
      res.status(200).json({ success: true, data: workouts });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

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

  async getTotalWorkoutsCount(req: Request, res: Response) {
    try {
      const count = await workoutService.getTotalWorkoutsCount();
      res.status(200).json({ success: true, data: { total: count } });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}