import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      model_id, job_name, method, config, dataset_filename, dataset_size
    } = body;

    if (!model_id || !job_name || !method) {
      return NextResponse.json(
        { error: "model_id, job_name, and method are required" },
        { status: 400 }
      );
    }

    const job = {
      id: `ft-${Date.now()}`,
      model_id,
      job_name,
      status: "pending",
      method,
      config: config || {
        learning_rate: 2e-4,
        num_epochs: 3,
        batch_size: 4,
        max_seq_length: 2048,
        lora_r: 16,
        lora_alpha: 32,
        lora_dropout: 0.05,
        target_modules: ["q_proj", "v_proj"],
        warmup_steps: 100,
        weight_decay: 0.01,
        gradient_accumulation_steps: 4,
        quantization_bits: method === "qlora" ? 4 : null,
      },
      dataset_filename: dataset_filename || "dataset.json",
      dataset_size: dataset_size || 0,
      progress: 0,
      current_epoch: 0,
      current_loss: 0,
      training_logs: [],
      output_model_path: null,
      created_at: new Date().toISOString(),
      started_at: null,
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
