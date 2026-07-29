import { FoodLog } from "../models/foodLog.model";
import { WorkoutLog } from "../models/workoutLog.model";
import { HealthProfile } from "../models/healthProfile.model";
import { Food } from "../models/food.model";
import { Workout } from "../models/workout.model";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../configs/constant";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export class AIService {
  async answer(userId: string, question: string, history: ChatTurn[] = []) {
    const apiKey = GEMINI_API_KEY;
    if (!apiKey) throw new Error("Gemini AI is not configured");
    const profile = await HealthProfile.findOne({ userId }).lean();
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(); end.setHours(23, 59, 59, 999);
    const [foodLogs, workoutLogs] = await Promise.all([
      FoodLog.find({ userId, date: { $gte: start, $lte: end } }).populate("foodId").lean(),
      WorkoutLog.find({ userId, date: { $gte: start, $lte: end } }).populate("workoutId").lean(),
    ]);
    const foodSummary = foodLogs.reduce((summary, log) => {
      summary.calories += Number(log.totalCalories) || 0; summary.protein += Number(log.totalProtein) || 0;
      summary.carbs += Number(log.totalCarbs) || 0; summary.fats += Number(log.totalFats) || 0; return summary;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
    const workoutSummary = workoutLogs.reduce((summary, log) => {
      summary.duration += Number(log.duration) || 0; summary.calories += Number(log.caloriesBurned) || 0; return summary;
    }, { duration: 0, calories: 0 });
    const foods = await Food.find({ isActive: true, isApproved: true }).select("name category calories protein carbs fats dietaryTags suitableGoals description").limit(200).lean();
    const workouts = await Workout.find({ isActive: true, isApproved: true }).select("name category duration caloriesBurned difficulty equipment goalTags muscleGroups description").limit(200).lean();
    const prompt = [
      "You are NutriNepal AI, a warm, knowledgeable nutrition and fitness coach.",
      "Answer the latest question directly and conversationally. Give an elaborative answer with a direct conclusion, explanation using real numbers, and practical next steps.",
      "Use Markdown headings and bullets when helpful. Never invent nutrition values, foods, workouts, diagnoses, or measurements. Say exactly when data is unavailable.",
      "Do not diagnose medical conditions. For illness, injury, medication, or eating-disorder questions, recommend a qualified professional.",
      "Return ONLY valid JSON with this exact shape: {\"answer\":\"detailed response\",\"foodIds\":[\"real food _id\"],\"workoutIds\":[\"real workout _id\"]}. Select at most 6 foods and 6 workouts. Use empty arrays when none match. Never invent IDs.",
      `Profile: ${JSON.stringify(profile || "not completed")}`,
      `Today's food summary: ${JSON.stringify(foodSummary)}`,
      `Today's workout summary: ${JSON.stringify(workoutSummary)}`,
      `Today's food logs: ${JSON.stringify(foodLogs)}`,
      `Today's workout logs: ${JSON.stringify(workoutLogs)}`,
      `Available foods: ${JSON.stringify(foods)}`,
      `Available workouts: ${JSON.stringify(workouts)}`,
      `Previous conversation:\n${history.slice(-20).map((turn) => `${turn.role === "user" ? "User" : "Assistant"}: ${turn.content}`).join("\n") || "None"}`,
      `Latest user question: ${question}`,
    ].join("\n\n");
    const model = GEMINI_MODEL;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: "You are NutriNepal AI. Be accurate, relevant, and helpful." }] }, contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 900 } }),
        signal: controller.signal,
      });
      const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>; error?: { message?: string } };
      if (!response.ok) throw new Error(data.error?.message || "Gemini request failed");
      const rawAnswer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
      if (!rawAnswer) throw new Error(data.candidates?.[0]?.finishReason ? `Gemini returned no text: ${data.candidates[0].finishReason}` : "Gemini returned an empty response");
      const cleanedAnswer = rawAnswer.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
      const objectStart = cleanedAnswer.indexOf("{");
      const objectEnd = cleanedAnswer.lastIndexOf("}");
      const jsonText = objectStart >= 0 && objectEnd > objectStart ? cleanedAnswer.slice(objectStart, objectEnd + 1) : cleanedAnswer;
      let parsed: { answer?: string; foodIds?: string[]; workoutIds?: string[] };
      try {
        parsed = JSON.parse(jsonText) as { answer?: string; foodIds?: string[]; workoutIds?: string[] };
      } catch {
        return { answer: rawAnswer, foods: [], workouts: [] };
      }
      if (!parsed.answer || typeof parsed.answer !== "string") return { answer: rawAnswer, foods: [], workouts: [] };
      const foodIds = new Set((parsed.foodIds || []).map(String));
      const workoutIds = new Set((parsed.workoutIds || []).map(String));
      return {
        answer: parsed.answer,
        foods: foods.filter((food) => foodIds.has(String(food._id))),
        workouts: workouts.filter((workout) => workoutIds.has(String(workout._id))),
      };
    } finally { clearTimeout(timeout); }
  }
}
