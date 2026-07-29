"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
type CoachTurn = { role: "user" | "assistant"; content: string };
type Match = { _id: string; name: string; category?: string; calories?: number; protein?: number; duration?: number; difficulty?: string };
type ChatMessage = CoachTurn & { foods?: Match[]; workouts?: Match[] };

function cleanAssistantAnswer(value: string) {
  const cleaned = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  try {
    const parsed = JSON.parse(cleaned) as { answer?: unknown };
    if (typeof parsed.answer === "string") return parsed.answer;
  } catch {
    // Gemini may return regular Markdown instead of JSON.
  }
  return cleaned;
}

const starters = ["Review my day", "Explain my calorie balance", "What should I improve?"];

export function AICoachDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const requestInFlight = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function askQuestion() {
    if (!question.trim() || requestInFlight.current) return;
    requestInFlight.current = true;
    setLoading(true);
    const askedQuestion = question.trim();
    setMessages((previous) => [...previous, { role: "user", content: askedQuestion }]);
    setQuestion("");
    try {
      const response = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: askedQuestion, history: messages }),
      });
      const result = (await response.json()) as { answer?: string; message?: string; foods?: Match[]; workouts?: Match[] };
      const reply = cleanAssistantAnswer(result.answer?.trim() || result.message?.trim() || "I received no readable answer. Please try asking the question another way.");
      setMessages((previous) => [...previous, { role: "assistant", content: reply, foods: result.foods || [], workouts: result.workouts || [] }]);
    } catch {
      setMessages((previous) => [...previous, { role: "assistant", content: "The coach could not complete that request. Please check the Gemini configuration and try again." }]);
    } finally {
      setLoading(false);
      requestInFlight.current = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void askQuestion();
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void askQuestion();
  }

  if (!open) return null;

  return (
    <>
      <button type="button" aria-label="Close AI coach" onClick={onClose} className="fixed inset-0 z-50 cursor-default bg-slate-950/30" />
      <aside aria-label="NutriNepal AI coach" className="fixed right-0 top-0 z-[51] flex h-full w-full max-w-md flex-col border-l border-green-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-green-100 bg-green-950 px-5 py-4 text-white">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-200">NutriNepal</p>
            <h2 className="text-xl font-black">AI Nutrition Coach</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close AI coach" className="rounded-full p-2 text-green-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200">✕</button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col p-5">
          <p className="text-sm leading-6 text-slate-600">Ask about your real profile, today&apos;s logged meals, workouts, targets, or progress.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {starters.map((starter) => <button key={starter} type="button" onClick={() => { setQuestion(starter); }} className="rounded-full border border-green-200 bg-green-50 px-3 py-2 text-xs font-bold text-green-950 hover:bg-green-100">{starter}</button>)}
          </div>
          <form onSubmit={submit} className="mt-5 shrink-0 border-y border-green-100 bg-white py-5">
            <label htmlFor="ai-coach-question" className="text-sm font-bold text-slate-950">Your question</label>
            <textarea id="ai-coach-question" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={handleKeyDown} rows={3} maxLength={600} placeholder="Ask something about your nutrition or workout..." className="mt-2 w-full resize-none rounded-xl border border-green-200 px-3 py-3 text-sm outline-none focus:border-green-700 focus:ring-4 focus:ring-green-100" />
            <Button type="button" onClick={() => void askQuestion()} disabled={loading || !question.trim()} className="mt-3 w-full">{loading ? "Reviewing your data..." : "Ask AI coach"}</Button>
          </form>
          <div className="mt-6 min-h-44 space-y-3 rounded-2xl border border-green-200 bg-slate-50 p-4" aria-live="polite">
            {messages.length ? messages.map((message, index) => <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : "text-left"}><div className={`inline-block max-w-[92%] rounded-2xl px-4 py-3 text-left text-sm leading-6 ${message.role === "user" ? "bg-green-950 text-white" : "bg-white text-slate-800 shadow-sm ring-1 ring-green-100"}`}><p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] opacity-70">{message.role === "user" ? "You" : "NutriNepal AI"}</p><p className="whitespace-pre-wrap">{message.content}</p></div>{message.role === "assistant" && ((message.foods?.length || 0) > 0 || (message.workouts?.length || 0) > 0) ? <div className="mt-3 grid grid-cols-1 gap-2 text-left">{message.foods?.map((food) => <div key={food._id} className="rounded-xl border border-green-200 bg-white p-3 text-xs shadow-sm"><p className="font-bold text-green-950">{food.name}</p><p className="mt-1 text-slate-600">{food.category || "Meal"} · {food.calories ?? 0} kcal · {food.protein ?? 0}g protein</p></div>)}{message.workouts?.map((workout) => <div key={workout._id} className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-xs shadow-sm"><p className="font-bold text-orange-950">{workout.name}</p><p className="mt-1 text-orange-800">{workout.category || "Workout"} · {workout.duration ?? 0} min · {workout.difficulty || "Difficulty unavailable"}</p></div>)}</div> : null}</div>) : <p className="text-sm leading-6 text-slate-600">Your AI conversation will appear here. The coach uses your saved NutriNepal data and does not replace a doctor or dietitian.</p>}
            {loading ? <div className="flex items-center gap-2 text-sm text-slate-500"><span className="h-2 w-2 animate-pulse rounded-full bg-orange-500" /><span>Thinking...</span></div> : null}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </aside>
    </>
  );
}
