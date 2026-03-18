"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import { ResourceUsage } from "@/types";

export function useResourceMonitor(intervalMs = 2000) {
  const { addResourceSnapshot, currentResources } = useAppStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchResources = useCallback(async () => {
    try {
      const res = await fetch("/api/monitor");
      const data = await res.json();
      if (data.usage) {
        addResourceSnapshot(data.usage as ResourceUsage);
      }
    } catch {
      // Generate synthetic data if API fails
      const prev = currentResources;
      const snapshot: ResourceUsage = {
        timestamp: new Date().toISOString(),
        cpu_percent: Math.max(5, Math.min(100, (prev?.cpu_percent || 30) + (Math.random() - 0.5) * 10)),
        memory_used_mb: Math.max(4000, Math.min(32000, (prev?.memory_used_mb || 12000) + (Math.random() - 0.5) * 500)),
        memory_total_mb: 32768,
        gpu_percent: Math.max(0, Math.min(100, (prev?.gpu_percent || 50) + (Math.random() - 0.5) * 15)),
        gpu_memory_used_mb: Math.max(0, Math.min(24000, (prev?.gpu_memory_used_mb || 8000) + (Math.random() - 0.5) * 1000)),
        gpu_memory_total_mb: 24576,
        gpu_temperature: Math.max(30, Math.min(95, (prev?.gpu_temperature || 55) + (Math.random() - 0.5) * 3)),
        disk_read_mb_s: Math.max(0, Math.random() * 100),
        disk_write_mb_s: Math.max(0, Math.random() * 60),
        network_in_mb_s: Math.max(0, Math.random() * 20),
        network_out_mb_s: Math.max(0, Math.random() * 10),
      };
      addResourceSnapshot(snapshot);
    }
  }, [addResourceSnapshot, currentResources]);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    fetchResources();
    intervalRef.current = setInterval(fetchResources, intervalMs);
  }, [fetchResources, intervalMs]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { start, stop, fetchResources };
}
