import { NextRequest, NextResponse } from "next/server";
import { SEED_BENCHMARKS } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("model_id");
  const suite = searchParams.get("suite");

  let results = [...SEED_BENCHMARKS];

  if (modelId) {
    results = results.filter((b) => b.model_id === modelId);
  }

  if (suite && suite !== "all") {
    results = results.filter((b) => b.benchmark_suite === suite);
  }

  return NextResponse.json({ benchmarks: results });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model_id, benchmark_suite, benchmark_name } = body;

    if (!model_id || !benchmark_suite) {
      return NextResponse.json(
        { error: "model_id and benchmark_suite are required" },
        { status: 400 }
      );
    }

    // Simulate benchmark run
    const score = Math.random() * 40 + 60; // 60-100
    const result = {
      id: `b-${Date.now()}`,
      model_id,
      benchmark_name: benchmark_name || benchmark_suite.toUpperCase(),
      benchmark_suite,
      score: parseFloat(score.toFixed(1)),
      max_score: 100,
      metadata: {},
      run_at: new Date().toISOString(),
      duration_seconds: Math.floor(Math.random() * 3600) + 600,
    };

    return NextResponse.json({ benchmark: result });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
