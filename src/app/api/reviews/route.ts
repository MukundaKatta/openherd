import { NextRequest, NextResponse } from "next/server";
import { SEED_REVIEWS } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("model_id");

  let reviews = [...SEED_REVIEWS];

  if (modelId) {
    reviews = reviews.filter((r) => r.model_id === modelId);
  }

  return NextResponse.json({ reviews });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model_id, user_name, rating, title, content, use_case, pros, cons } = body;

    if (!model_id || !user_name || !rating || !title || !content) {
      return NextResponse.json(
        { error: "model_id, user_name, rating, title, and content are required" },
        { status: 400 }
      );
    }

    const review = {
      id: `review-${Date.now()}`,
      model_id,
      user_id: `user-${Date.now()}`,
      user_name,
      rating: Math.min(5, Math.max(1, rating)),
      title,
      content,
      use_case: use_case || "",
      pros: pros || [],
      cons: cons || [],
      helpful_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({ review });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
