import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export function formatParameterSize(count: number): string {
  if (count >= 1_000_000_000_000) return `${(count / 1_000_000_000_000).toFixed(1)}T`;
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(0)}M`;
  return count.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function getQuantizationQuality(quant: string): { quality: number; label: string; color: string } {
  const map: Record<string, { quality: number; label: string; color: string }> = {
    F32: { quality: 100, label: "Lossless", color: "#22c55e" },
    F16: { quality: 98, label: "Near Lossless", color: "#22c55e" },
    Q8_0: { quality: 95, label: "Excellent", color: "#84cc16" },
    Q6_K: { quality: 90, label: "Very Good", color: "#84cc16" },
    Q5_K_M: { quality: 85, label: "Good", color: "#eab308" },
    Q5_K_S: { quality: 83, label: "Good", color: "#eab308" },
    Q5_0: { quality: 80, label: "Good", color: "#eab308" },
    Q4_K_M: { quality: 75, label: "Acceptable", color: "#f97316" },
    Q4_K_S: { quality: 72, label: "Acceptable", color: "#f97316" },
    Q4_0: { quality: 70, label: "Acceptable", color: "#f97316" },
    Q3_K_L: { quality: 60, label: "Noticeable Loss", color: "#ef4444" },
    Q3_K_M: { quality: 55, label: "Noticeable Loss", color: "#ef4444" },
    Q3_K_S: { quality: 50, label: "Significant Loss", color: "#ef4444" },
    Q2_K: { quality: 40, label: "Heavy Loss", color: "#dc2626" },
  };
  return map[quant] || { quality: 50, label: "Unknown", color: "#6b7280" };
}

export function generateApiKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "oh-";
  for (let i = 0; i < 48; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function calculateElo(
  ratingA: number,
  ratingB: number,
  result: "a" | "b" | "tie"
): { newRatingA: number; newRatingB: number } {
  const K = 32;
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 / (1 + Math.pow(10, (ratingA - ratingB) / 400));

  let scoreA: number;
  let scoreB: number;

  if (result === "a") {
    scoreA = 1;
    scoreB = 0;
  } else if (result === "b") {
    scoreA = 0;
    scoreB = 1;
  } else {
    scoreA = 0.5;
    scoreB = 0.5;
  }

  return {
    newRatingA: Math.round(ratingA + K * (scoreA - expectedA)),
    newRatingB: Math.round(ratingB + K * (scoreB - expectedB)),
  };
}
