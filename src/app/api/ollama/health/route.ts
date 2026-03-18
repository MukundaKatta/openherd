import { NextResponse } from "next/server";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        connected: true,
        models: data.models || [],
        version: res.headers.get("x-ollama-version") || "unknown",
      });
    }

    return NextResponse.json({ connected: false, error: res.statusText });
  } catch (error) {
    return NextResponse.json({
      connected: false,
      error: "Ollama is not running or not accessible",
    });
  }
}
