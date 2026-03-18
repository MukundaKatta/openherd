"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAppStore } from "@/store/app-store";
import { ResourceUsage } from "@/types";
import {
  Activity, Cpu, HardDrive, Thermometer, Wifi, ArrowDown, ArrowUp,
  RefreshCw, Pause, Play
} from "lucide-react";

function MiniChart({ data, color, maxVal }: { data: number[]; color: string; maxVal?: number }) {
  const max = maxVal || Math.max(...data, 1);
  const width = 200;
  const height = 60;
  const points = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#grad-${color})`} />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export default function MonitorPage() {
  const { resourceHistory, currentResources, addResourceSnapshot } = useAppStore();
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateSnapshot = useCallback((): ResourceUsage => {
    const prev = currentResources;
    return {
      timestamp: new Date().toISOString(),
      cpu_percent: Math.max(5, Math.min(100, (prev?.cpu_percent || 35) + (Math.random() - 0.5) * 15)),
      memory_used_mb: Math.max(4000, Math.min(32000, (prev?.memory_used_mb || 12000) + (Math.random() - 0.5) * 1000)),
      memory_total_mb: 32768,
      gpu_percent: Math.max(0, Math.min(100, (prev?.gpu_percent || 60) + (Math.random() - 0.5) * 20)),
      gpu_memory_used_mb: Math.max(0, Math.min(24000, (prev?.gpu_memory_used_mb || 8000) + (Math.random() - 0.5) * 1500)),
      gpu_memory_total_mb: 24576,
      gpu_temperature: Math.max(30, Math.min(95, (prev?.gpu_temperature || 55) + (Math.random() - 0.5) * 5)),
      disk_read_mb_s: Math.max(0, (prev?.disk_read_mb_s || 50) + (Math.random() - 0.5) * 40),
      disk_write_mb_s: Math.max(0, (prev?.disk_write_mb_s || 30) + (Math.random() - 0.5) * 25),
      network_in_mb_s: Math.max(0, (prev?.network_in_mb_s || 10) + (Math.random() - 0.5) * 8),
      network_out_mb_s: Math.max(0, (prev?.network_out_mb_s || 5) + (Math.random() - 0.5) * 4),
    };
  }, [currentResources]);

  useEffect(() => {
    // Initial data
    if (resourceHistory.length === 0) {
      for (let i = 0; i < 30; i++) {
        addResourceSnapshot(generateSnapshot());
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      addResourceSnapshot(generateSnapshot());
    }, 2000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, generateSnapshot, addResourceSnapshot]);

  const cur = currentResources;
  const cpuHistory = resourceHistory.map((r) => r.cpu_percent);
  const memHistory = resourceHistory.map((r) => r.memory_used_mb);
  const gpuHistory = resourceHistory.map((r) => r.gpu_percent);
  const gpuMemHistory = resourceHistory.map((r) => r.gpu_memory_used_mb);
  const gpuTempHistory = resourceHistory.map((r) => r.gpu_temperature);
  const diskReadHistory = resourceHistory.map((r) => r.disk_read_mb_s);
  const diskWriteHistory = resourceHistory.map((r) => r.disk_write_mb_s);
  const netInHistory = resourceHistory.map((r) => r.network_in_mb_s);
  const netOutHistory = resourceHistory.map((r) => r.network_out_mb_s);

  const getUsageColor = (percent: number) => {
    if (percent >= 90) return "text-red-400";
    if (percent >= 70) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Resource Monitor</h1>
          <p className="text-gray-400 mt-1">Real-time GPU, CPU, and memory usage of running models</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaused(!paused)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
              paused
                ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                : "border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            }`}
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            {paused ? "Resume" : "Pause"}
          </button>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">CPU Usage</span>
          </div>
          <p className={`text-2xl font-bold ${getUsageColor(cur?.cpu_percent || 0)}`}>
            {(cur?.cpu_percent || 0).toFixed(1)}%
          </p>
          <div className="mt-2">
            <MiniChart data={cpuHistory} color="#3b82f6" maxVal={100} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-400">RAM Usage</span>
          </div>
          <p className={`text-2xl font-bold ${getUsageColor(((cur?.memory_used_mb || 0) / (cur?.memory_total_mb || 1)) * 100)}`}>
            {((cur?.memory_used_mb || 0) / 1024).toFixed(1)} GB
          </p>
          <p className="text-xs text-gray-600">/ {((cur?.memory_total_mb || 0) / 1024).toFixed(0)} GB</p>
          <div className="mt-2">
            <MiniChart data={memHistory} color="#a855f7" maxVal={cur?.memory_total_mb || 32768} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-green-400" />
            <span className="text-sm text-gray-400">GPU Usage</span>
          </div>
          <p className={`text-2xl font-bold ${getUsageColor(cur?.gpu_percent || 0)}`}>
            {(cur?.gpu_percent || 0).toFixed(1)}%
          </p>
          <div className="mt-2">
            <MiniChart data={gpuHistory} color="#22c55e" maxVal={100} />
          </div>
        </div>

        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Thermometer className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-gray-400">GPU Temp</span>
          </div>
          <p className={`text-2xl font-bold ${
            (cur?.gpu_temperature || 0) >= 80 ? "text-red-400" :
            (cur?.gpu_temperature || 0) >= 65 ? "text-yellow-400" :
            "text-green-400"
          }`}>
            {(cur?.gpu_temperature || 0).toFixed(0)}°C
          </p>
          <div className="mt-2">
            <MiniChart data={gpuTempHistory} color="#f97316" maxVal={100} />
          </div>
        </div>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GPU Memory */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-gray-300">GPU Memory</span>
            </div>
            <span className="text-sm text-gray-400">
              {((cur?.gpu_memory_used_mb || 0) / 1024).toFixed(1)} / {((cur?.gpu_memory_total_mb || 0) / 1024).toFixed(0)} GB
            </span>
          </div>
          <div className="h-3 rounded-full bg-gray-800 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
              style={{ width: `${((cur?.gpu_memory_used_mb || 0) / (cur?.gpu_memory_total_mb || 1)) * 100}%` }}
            />
          </div>
          <MiniChart data={gpuMemHistory} color="#06b6d4" maxVal={cur?.gpu_memory_total_mb || 24576} />
        </div>

        {/* Disk I/O */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-gray-300">Disk I/O</span>
          </div>
          <div className="flex items-center gap-4 mb-2 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <ArrowDown className="h-3 w-3" />
              Read: {(cur?.disk_read_mb_s || 0).toFixed(1)} MB/s
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <ArrowUp className="h-3 w-3" />
              Write: {(cur?.disk_write_mb_s || 0).toFixed(1)} MB/s
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <MiniChart data={diskReadHistory} color="#10b981" />
            </div>
            <div className="flex-1">
              <MiniChart data={diskWriteHistory} color="#f59e0b" />
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wifi className="h-4 w-4 text-indigo-400" />
            <span className="text-sm font-medium text-gray-300">Network</span>
          </div>
          <div className="flex items-center gap-4 mb-2 text-xs">
            <span className="flex items-center gap-1 text-indigo-400">
              <ArrowDown className="h-3 w-3" />
              In: {(cur?.network_in_mb_s || 0).toFixed(1)} MB/s
            </span>
            <span className="flex items-center gap-1 text-pink-400">
              <ArrowUp className="h-3 w-3" />
              Out: {(cur?.network_out_mb_s || 0).toFixed(1)} MB/s
            </span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <MiniChart data={netInHistory} color="#6366f1" />
            </div>
            <div className="flex-1">
              <MiniChart data={netOutHistory} color="#ec4899" />
            </div>
          </div>
        </div>

        {/* System Summary */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-rose-400" />
            <span className="text-sm font-medium text-gray-300">System Summary</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">CPU</span>
                <span className={getUsageColor(cur?.cpu_percent || 0)}>{(cur?.cpu_percent || 0).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${cur?.cpu_percent || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">RAM</span>
                <span className="text-purple-400">{((cur?.memory_used_mb || 0) / (cur?.memory_total_mb || 1) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-purple-500 transition-all duration-500" style={{ width: `${(cur?.memory_used_mb || 0) / (cur?.memory_total_mb || 1) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">GPU Compute</span>
                <span className={getUsageColor(cur?.gpu_percent || 0)}>{(cur?.gpu_percent || 0).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-green-500 transition-all duration-500" style={{ width: `${cur?.gpu_percent || 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500">GPU Memory</span>
                <span className="text-cyan-400">{((cur?.gpu_memory_used_mb || 0) / (cur?.gpu_memory_total_mb || 1) * 100).toFixed(1)}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${(cur?.gpu_memory_used_mb || 0) / (cur?.gpu_memory_total_mb || 1) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
