import { Request, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middlewares/auth.middleware";
import { AIService, ChatTurn } from "../services/ai.service";

const bodySchema = z.object({ message: z.string().trim().min(1).max(600), history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).max(20).optional().default([]) });
const aiService = new AIService();

export class AIController {
  async chat(req: Request, res: Response) {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, message: "A valid message is required." });
    try {
      const result = await aiService.answer((req as AuthRequest).user!.id, parsed.data.message, parsed.data.history as ChatTurn[]);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      console.error("Gemini AI error:", error instanceof Error ? error.message : error);
      const message = error instanceof Error && error.name === "AbortError" ? "The AI coach timed out. Please try again." : "Unable to generate an AI response.";
      return res.status(502).json({ success: false, message });
    }
  }
}
