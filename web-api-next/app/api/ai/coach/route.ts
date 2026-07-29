import { NextResponse } from "next/server";
import { getTokenCookie } from "@/lib/cookies";
import { apiUrl } from "@/lib/api/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { question?: unknown; history?: unknown };
    if (typeof body.question !== "string") {
      return NextResponse.json({ success: false, message: "Ask the coach a question first." }, { status: 400 });
    }

    const token = await getTokenCookie();
    if (!token) return NextResponse.json({ success: false, message: "Please sign in to use the nutrition coach." }, { status: 401 });
    const response = await fetch(apiUrl("/api/v1/ai/chat"), { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ message: body.question, history: body.history }), cache: "no-store" });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ success: false, message: "The AI coach is temporarily unavailable. Please try again." }, { status: 500 });
  }
}
