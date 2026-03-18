import { NextResponse } from "next/server";

export async function GET() {
  // Generate simulated resource usage
  const usage = {
    timestamp: new Date().toISOString(),
    cpu_percent: Math.random() * 60 + 10,
    memory_used_mb: Math.random() * 16000 + 8000,
    memory_total_mb: 32768,
    gpu_percent: Math.random() * 80 + 10,
    gpu_memory_used_mb: Math.random() * 12000 + 4000,
    gpu_memory_total_mb: 24576,
    gpu_temperature: Math.random() * 30 + 45,
    disk_read_mb_s: Math.random() * 100,
    disk_write_mb_s: Math.random() * 60,
    network_in_mb_s: Math.random() * 20,
    network_out_mb_s: Math.random() * 10,
  };

  return NextResponse.json({ usage });
}
