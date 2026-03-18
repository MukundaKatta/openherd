import { NextRequest, NextResponse } from "next/server";
import { SEED_ARENA_LEADERBOARD } from "@/lib/seed-data";

export async function GET() {
  return NextResponse.json({
    leaderboard: SEED_ARENA_LEADERBOARD,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model_a_id, model_b_id, prompt, response_a, response_b, winner } = body;

    if (!model_a_id || !model_b_id || !winner) {
      return NextResponse.json(
        { error: "model_a_id, model_b_id, and winner are required" },
        { status: 400 }
      );
    }

    const match = {
      id: `match-${Date.now()}`,
      model_a_id,
      model_b_id,
      prompt: prompt || "",
      response_a: response_a || "",
      response_b: response_b || "",
      winner,
      voter_id: "anonymous",
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ match });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
