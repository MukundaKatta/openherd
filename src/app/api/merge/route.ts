import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { job_name, source_models, merge_strategy, output_model_name, config } = body;

    if (!job_name || !source_models || source_models.length < 2 || !merge_strategy) {
      return NextResponse.json(
        { error: "job_name, source_models (2+), and merge_strategy are required" },
        { status: 400 }
      );
    }

    const job = {
      id: `merge-${Date.now()}`,
      job_name,
      source_models,
      merge_strategy,
      status: "pending",
      progress: 0,
      output_model_name: output_model_name || "merged-model",
      output_model_path: null,
      config: config || {
        strategy: merge_strategy,
        base_model_id: null,
        interpolation_weight: 0.5,
        density: 0.5,
        normalize: true,
        custom_params: {},
      },
      created_at: new Date().toISOString(),
      completed_at: null,
      error_message: null,
    };

    return NextResponse.json({ job });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ jobs: [] });
}
