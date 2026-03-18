import { NextResponse } from "next/server";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to list models: ${res.statusText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ models: data.models || [] });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to Ollama" },
      { status: 503 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { model } = await request.json();

    if (!model) {
      return NextResponse.json({ error: "Model name is required" }, { status: 400 });
    }

    const res = await fetch(`${OLLAMA_BASE_URL}/api/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: model }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to delete model: ${res.statusText}` },
        { status: res.status }
      );
    }

    return NextResponse.json({ success: true, model });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to connect to Ollama" },
      { status: 503 }
    );
  }
}
