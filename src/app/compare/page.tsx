"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { formatNumber } from "@/lib/utils";
import {
  GitCompare, Star, Download, Heart, BarChart3, Tag
} from "lucide-react";

export default function ComparePage() {
  const { models, benchmarks } = useAppStore();
  const [modelAId, setModelAId] = useState("");
  const [modelBId, setModelBId] = useState("");

  const modelA = models.find((m) => m.id === modelAId);
  const modelB = models.find((m) => m.id === modelBId);

  const benchmarksA = useMemo(() => benchmarks.filter((b) => b.model_id === modelAId), [benchmarks, modelAId]);
  const benchmarksB = useMemo(() => benchmarks.filter((b) => b.model_id === modelBId), [benchmarks, modelBId]);

  const allBenchmarkNames = useMemo(() => {
    const names = new Set<string>();
    benchmarksA.forEach((b) => names.add(b.benchmark_name));
    benchmarksB.forEach((b) => names.add(b.benchmark_name));
    return Array.from(names);
  }, [benchmarksA, benchmarksB]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Model Comparison</h1>
        <p className="text-gray-400 mt-1">Compare two models side by side</p>
      </div>

      {/* Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Model A</label>
          <select
            value={modelAId}
            onChange={(e) => setModelAId(e.target.value)}
            className="w-full rounded-lg border border-blue-500/30 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select model...</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.parameter_size})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1.5">Model B</label>
          <select
            value={modelBId}
            onChange={(e) => setModelBId(e.target.value)}
            className="w-full rounded-lg border border-purple-500/30 bg-gray-800 px-3 py-2.5 text-sm text-gray-200 focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select model...</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>{m.name} ({m.parameter_size})</option>
            ))}
          </select>
        </div>
      </div>

      {modelA && modelB && (
        <>
          {/* Stats Comparison */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Overview</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-blue-400">{modelA.name}</p>
                <p className="text-xs text-gray-500">{modelA.author}</p>
              </div>
              <div className="text-center text-xs text-gray-600">vs</div>
              <div className="text-left">
                <p className="text-sm font-medium text-purple-400">{modelB.name}</p>
                <p className="text-xs text-gray-500">{modelB.author}</p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {[
                { label: "Architecture", a: modelA.architecture, b: modelB.architecture },
                { label: "Parameters", a: modelA.parameter_size, b: modelB.parameter_size },
                { label: "Task Type", a: modelA.task_type, b: modelB.task_type },
                { label: "License", a: modelA.license, b: modelB.license },
              ].map((row) => (
                <div key={row.label} className="grid grid-cols-3 gap-4 items-center py-2 border-b border-gray-800">
                  <div className="text-right text-sm text-gray-200 capitalize">{row.a}</div>
                  <div className="text-center text-xs text-gray-500 font-medium">{row.label}</div>
                  <div className="text-left text-sm text-gray-200 capitalize">{row.b}</div>
                </div>
              ))}

              {[
                { label: "Downloads", a: modelA.downloads, b: modelB.downloads, format: formatNumber },
                { label: "Likes", a: modelA.likes, b: modelB.likes, format: formatNumber },
                { label: "Rating", a: modelA.avg_rating, b: modelB.avg_rating, format: (v: number) => v.toFixed(1) },
                { label: "Reviews", a: modelA.review_count, b: modelB.review_count, format: (v: number) => v.toString() },
              ].map((row) => {
                const aWins = row.a > row.b;
                const bWins = row.b > row.a;
                return (
                  <div key={row.label} className="grid grid-cols-3 gap-4 items-center py-2 border-b border-gray-800">
                    <div className={`text-right text-sm font-medium ${aWins ? "text-green-400" : "text-gray-300"}`}>
                      {row.format(row.a)} {aWins && "  "}
                    </div>
                    <div className="text-center text-xs text-gray-500 font-medium">{row.label}</div>
                    <div className={`text-left text-sm font-medium ${bWins ? "text-green-400" : "text-gray-300"}`}>
                      {row.format(row.b)} {bWins && "  "}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Benchmark Comparison */}
          {allBenchmarkNames.length > 0 && (
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Benchmark Comparison</h2>
              <div className="space-y-4">
                {allBenchmarkNames.map((name) => {
                  const scoreA = benchmarksA.find((b) => b.benchmark_name === name)?.score;
                  const scoreB = benchmarksB.find((b) => b.benchmark_name === name)?.score;
                  const maxScore = Math.max(scoreA || 0, scoreB || 0, 1);

                  return (
                    <div key={name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{name}</span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`font-mono ${scoreA && scoreB && scoreA > scoreB ? "text-green-400" : "text-blue-400"}`}>
                            {scoreA?.toFixed(1) || "-"}
                          </span>
                          <span className="text-gray-600">vs</span>
                          <span className={`font-mono ${scoreB && scoreA && scoreB > scoreA ? "text-green-400" : "text-purple-400"}`}>
                            {scoreB?.toFixed(1) || "-"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 h-3">
                        <div className="flex-1 rounded-l-lg bg-gray-800 overflow-hidden flex justify-end">
                          <div
                            className="h-full bg-blue-500/70 rounded-l-lg transition-all duration-500"
                            style={{ width: `${scoreA ? (scoreA / 100) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="flex-1 rounded-r-lg bg-gray-800 overflow-hidden">
                          <div
                            className="h-full bg-purple-500/70 rounded-r-lg transition-all duration-500"
                            style={{ width: `${scoreB ? (scoreB / 100) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tags Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <h3 className="text-sm font-medium text-blue-400 mb-3">{modelA.name} Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {modelA.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-md text-xs ${
                      modelB.tags.includes(tag)
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <h3 className="text-sm font-medium text-purple-400 mb-3">{modelB.name} Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {modelB.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 rounded-md text-xs ${
                      modelA.tags.includes(tag)
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {(!modelA || !modelB) && (
        <div className="text-center py-16">
          <GitCompare className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">Select two models to compare</h3>
          <p className="text-sm text-gray-600 mt-1">Choose models from the dropdowns above</p>
        </div>
      )}
    </div>
  );
}
