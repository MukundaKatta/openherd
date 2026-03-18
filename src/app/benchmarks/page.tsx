"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { BenchmarkSuite } from "@/types";
import { BarChart3, Trophy, ArrowUpDown, Filter } from "lucide-react";

const BENCHMARK_SUITES: { value: BenchmarkSuite | "all"; label: string; desc: string }[] = [
  { value: "all", label: "All Benchmarks", desc: "Combined view" },
  { value: "mmlu", label: "MMLU", desc: "Massive Multitask Language Understanding" },
  { value: "hellaswag", label: "HellaSwag", desc: "Common sense reasoning" },
  { value: "humaneval", label: "HumanEval", desc: "Code generation" },
  { value: "gsm8k", label: "GSM8K", desc: "Grade school math" },
  { value: "arc", label: "ARC", desc: "AI2 Reasoning Challenge" },
  { value: "truthfulqa", label: "TruthfulQA", desc: "Truthfulness evaluation" },
  { value: "winogrande", label: "WinoGrande", desc: "Coreference resolution" },
  { value: "mt-bench", label: "MT-Bench", desc: "Multi-turn conversation" },
];

const COLORS = [
  "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#f97316",
  "#84cc16", "#a855f7",
];

export default function BenchmarksPage() {
  const { models, benchmarks } = useAppStore();
  const [selectedSuite, setSelectedSuite] = useState<BenchmarkSuite | "all">("all");
  const [sortBy, setSortBy] = useState<"score" | "name">("score");

  const filteredBenchmarks = useMemo(() => {
    if (selectedSuite === "all") return benchmarks;
    return benchmarks.filter((b) => b.benchmark_suite === selectedSuite);
  }, [benchmarks, selectedSuite]);

  // Build leaderboard: for each model, avg score across selected benchmarks
  const leaderboard = useMemo(() => {
    const modelScores = new Map<string, { total: number; count: number; scores: Record<string, number> }>();

    filteredBenchmarks.forEach((b) => {
      const existing = modelScores.get(b.model_id) || { total: 0, count: 0, scores: {} };
      existing.total += b.score;
      existing.count += 1;
      existing.scores[b.benchmark_name] = b.score;
      modelScores.set(b.model_id, existing);
    });

    const entries = Array.from(modelScores.entries()).map(([modelId, data]) => {
      const model = models.find((m) => m.id === modelId);
      return {
        modelId,
        modelName: model?.name || "Unknown",
        author: model?.author || "Unknown",
        paramSize: model?.parameter_size || "",
        avgScore: data.total / data.count,
        benchmarkCount: data.count,
        scores: data.scores,
      };
    });

    if (sortBy === "score") {
      entries.sort((a, b) => b.avgScore - a.avgScore);
    } else {
      entries.sort((a, b) => a.modelName.localeCompare(b.modelName));
    }

    return entries;
  }, [filteredBenchmarks, models, sortBy]);

  // Get unique benchmark names for the selected suite
  const benchmarkNames = useMemo(() => {
    const names = new Set<string>();
    filteredBenchmarks.forEach((b) => names.add(b.benchmark_name));
    return Array.from(names);
  }, [filteredBenchmarks]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Benchmark Dashboard</h1>
        <p className="text-gray-400 mt-1">Compare model performance across standard evaluation suites</p>
      </div>

      {/* Suite Selector */}
      <div className="flex flex-wrap gap-2">
        {BENCHMARK_SUITES.map((suite) => (
          <button
            key={suite.value}
            onClick={() => setSelectedSuite(suite.value)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedSuite === suite.value
                ? "bg-brand-600/20 text-brand-400 border border-brand-500/30"
                : "bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700"
            }`}
          >
            <span className="font-medium">{suite.label}</span>
          </button>
        ))}
      </div>

      {/* Visual Chart */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-lg font-semibold text-white mb-6">Score Comparison</h2>
        <div className="space-y-4">
          {leaderboard.map((entry, idx) => (
            <div key={entry.modelId} className="flex items-center gap-4">
              <div className="w-8 text-center">
                <span className={`text-sm font-bold ${
                  idx === 0 ? "text-yellow-400" :
                  idx === 1 ? "text-gray-300" :
                  idx === 2 ? "text-orange-400" :
                  "text-gray-500"
                }`}>
                  #{idx + 1}
                </span>
              </div>
              <div className="w-48 min-w-0">
                <p className="text-sm font-medium text-white truncate">{entry.modelName}</p>
                <p className="text-xs text-gray-500">{entry.author} · {entry.paramSize}</p>
              </div>
              <div className="flex-1">
                <div className="relative h-8 rounded-lg bg-gray-800 overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500"
                    style={{
                      width: `${entry.avgScore}%`,
                      backgroundColor: COLORS[idx % COLORS.length],
                      opacity: 0.8,
                    }}
                  />
                  <div className="absolute inset-0 flex items-center px-3">
                    <span className="text-xs font-mono font-bold text-white drop-shadow">
                      {entry.avgScore.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Detailed Scores</h2>
          <button
            onClick={() => setSortBy(sortBy === "score" ? "name" : "score")}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
          >
            <ArrowUpDown className="h-4 w-4" />
            Sort by {sortBy === "score" ? "name" : "score"}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800">
                <th className="pb-3 font-medium pr-4">Rank</th>
                <th className="pb-3 font-medium pr-4">Model</th>
                {benchmarkNames.map((name) => (
                  <th key={name} className="pb-3 font-medium pr-4 text-center">{name}</th>
                ))}
                <th className="pb-3 font-medium text-center">Average</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, idx) => (
                <tr key={entry.modelId} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-3 pr-4">
                    <span className={`text-sm font-bold ${
                      idx === 0 ? "text-yellow-400" :
                      idx === 1 ? "text-gray-300" :
                      idx === 2 ? "text-orange-400" :
                      "text-gray-500"
                    }`}>
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium text-white">{entry.modelName}</p>
                    <p className="text-xs text-gray-500">{entry.paramSize}</p>
                  </td>
                  {benchmarkNames.map((name) => (
                    <td key={name} className="py-3 pr-4 text-center">
                      {entry.scores[name] !== undefined ? (
                        <span className={`font-mono text-sm ${
                          entry.scores[name] >= 80 ? "text-green-400" :
                          entry.scores[name] >= 60 ? "text-yellow-400" :
                          "text-red-400"
                        }`}>
                          {entry.scores[name].toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                  ))}
                  <td className="py-3 text-center">
                    <span className="font-mono font-bold text-brand-400">
                      {entry.avgScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-16">
          <BarChart3 className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No benchmark data</h3>
          <p className="text-sm text-gray-600 mt-1">Run benchmarks on your models to see results here</p>
        </div>
      )}
    </div>
  );
}
