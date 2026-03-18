import { NextRequest, NextResponse } from "next/server";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json();

    if (!model) {
      return NextResponse.json({ error: "Model name is required" }, { status: 400 });
    }

    const res = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: model, stream: false }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Failed to pull model: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({
      success: true,
      status: data.status,
      model,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to Ollama. Is it running?" },
      { status: 503 }
    );
  }
}
