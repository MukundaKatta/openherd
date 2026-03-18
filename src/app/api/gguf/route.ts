import { NextRequest, NextResponse } from "next/server";
import { SEED_GGUF_VARIANTS, SEED_MODELS } from "@/lib/seed-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("model_id");
  const quantization = searchParams.get("quantization");

  let variants = [...SEED_GGUF_VARIANTS];

  if (modelId) {
    variants = variants.filter((v) => v.model_id === modelId);
  }

  if (quantization) {
    variants = variants.filter((v) => v.quantization === quantization);
  }

  const enrichedVariants = variants.map((v) => {
    const model = SEED_MODELS.find((m) => m.id === v.model_id);
    return {
      ...v,
      model_name: model?.name || "Unknown",
      model_author: model?.author || "Unknown",
      model_parameter_size: model?.parameter_size || "",
    };
  });

  return NextResponse.json({ variants: enrichedVariants });
}
