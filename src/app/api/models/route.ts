import { NextRequest, NextResponse } from "next/server";
import { SEED_MODELS, SEED_GGUF_VARIANTS } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const architecture = searchParams.get("architecture") || "";
  const taskType = searchParams.get("task_type") || "";
  const license = searchParams.get("license") || "";
  const sortBy = searchParams.get("sort_by") || "downloads";
  const sortOrder = searchParams.get("sort_order") || "desc";
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let models = SEED_MODELS.map((m) => ({
    ...m,
    gguf_variants: SEED_GGUF_VARIANTS.filter((g) => g.model_id === m.id),
  }));

  // Apply filters
  if (search) {
    const q = search.toLowerCase();
    models = models.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.author.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (architecture) {
    models = models.filter((m) => m.architecture === architecture);
  }

  if (taskType) {
    models = models.filter((m) => m.task_type === taskType);
  }

  if (license) {
    models = models.filter((m) =>
      m.license.toLowerCase().includes(license.toLowerCase())
    );
  }

  // Sort
  const dir = sortOrder === "asc" ? 1 : -1;
  models.sort((a, b) => {
    switch (sortBy) {
      case "downloads": return (a.downloads - b.downloads) * dir;
      case "likes": return (a.likes - b.likes) * dir;
      case "rating": return (a.avg_rating - b.avg_rating) * dir;
      case "newest": return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      case "name": return a.name.localeCompare(b.name) * dir;
      default: return 0;
    }
  });

  const total = models.length;
  models = models.slice(offset, offset + limit);

  return NextResponse.json({
    models,
    total,
    limit,
    offset,
  });
}
