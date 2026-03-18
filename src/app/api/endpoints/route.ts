import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model_id, model_name, port, format, max_tokens, temperature } = body;

    if (!model_id || !model_name) {
      return NextResponse.json(
        { error: "model_id and model_name are required" },
        { status: 400 }
      );
    }

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let apiKey = "oh-";
    for (let i = 0; i < 48; i++) {
      apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const endpoint = {
      id: `ep-${Date.now()}`,
      model_id,
      model_name,
      endpoint_url: `http://localhost:${port || 8080}/v1`,
      port: port || 8080,
      status: "active",
      format: format || "openai",
      api_key: apiKey,
      max_tokens: max_tokens || 2048,
      temperature: temperature || 0.7,
      request_count: 0,
      created_at: new Date().toISOString(),
      last_request_at: null,
    };

    return NextResponse.json({ endpoint });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ endpoints: [] });
}
