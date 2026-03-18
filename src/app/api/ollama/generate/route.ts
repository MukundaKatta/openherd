import { NextRequest, NextResponse } from "next/server";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt, system, temperature, max_tokens } = body;

    if (!model || !prompt) {
      return NextResponse.json(
        { error: "Model and prompt are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        system: system || undefined,
        stream: false,
        options: {
          temperature: temperature ?? 0.7,
          num_predict: max_tokens ?? 512,
        },
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Generation failed: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      response: data.response,
      model: data.model,
      done: data.done,
      total_duration: data.total_duration,
      eval_count: data.eval_count,
      eval_duration: data.eval_duration,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to Ollama" },
      { status: 503 }
    );
  }
}
