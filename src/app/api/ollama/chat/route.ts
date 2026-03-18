import { NextRequest, NextResponse } from "next/server";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, messages, temperature, max_tokens } = body;

    if (!model || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Model and messages array are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages,
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
        { error: `Chat failed: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      message: data.message,
      model: data.model,
      done: data.done,
      total_duration: data.total_duration,
      eval_count: data.eval_count,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to Ollama" },
      { status: 503 }
    );
  }
}
