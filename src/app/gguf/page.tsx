"use client";

import { useState, useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { formatBytes, getQuantizationQuality } from "@/lib/utils";
import { QuantizationType } from "@/types";
import {
  FileDown, Search, Download, HardDrive, Zap, BarChart3,
  ArrowUpDown, Info
} from "lucide-react";

const QUANT_ORDER: QuantizationType[] = [
  "Q2_K", "Q3_K_S", "Q3_K_M", "Q3_K_L", "Q4_0", "Q4_K_S", "Q4_K_M",
  "Q5_0", "Q5_K_S", "Q5_K_M", "Q6_K", "Q8_0", "F16", "F32"
];

export default function GGUFPage() {
  const { models, ggufVariants } = useAppStore();
  const [search, setSearch] = useState("");
  const [selectedQuant, setSelectedQuant] = useState<QuantizationType | "all">("all");
  const [sortBy, setSortBy] = useState<"size" | "quality" | "model">("model");

  const modelsWithGGUF = useMemo(() => {
    return models
      .map((m) => ({
        ...m,
        variants: ggufVariants.filter((v) => v.model_id === m.id),
      }))
      .filter((m) => m.variants.length > 0);
  }, [models, ggufVariants]);

  const filteredModels = useMemo(() => {
    let result = modelsWithGGUF;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.author.toLowerCase().includes(q)
      );
    }

    if (selectedQuant !== "all") {
      result = result.filter((m) =>
        m.variants.some((v) => v.quantization === selectedQuant)
      );
    }

    return result;
  }, [modelsWithGGUF, search, selectedQuant]);

  const allVariantsFlat = useMemo(() => {
    let variants = filteredModels.flatMap((m) =>
      m.variants
        .filter((v) => selectedQuant === "all" || v.quantization === selectedQuant)
        .map((v) => ({
          ...v,
          modelName: m.name,
          modelAuthor: m.author,
          modelParamSize: m.parameter_size,
        }))
    );

    if (sortBy === "size") variants.sort((a, b) => a.file_size_bytes - b.file_size_bytes);
    else if (sortBy === "quality") variants.sort((a, b) => b.quality_score - a.quality_score);

    return variants;
  }, [filteredModels, selectedQuant, sortBy]);

  // Quality vs Size visualization data
  const chartData = useMemo(() => {
    return QUANT_ORDER.map((q) => {
      const quality = getQuantizationQuality(q);
      const variants = ggufVariants.filter((v) => v.quantization === q);
      const avgSize = variants.length > 0
        ? variants.reduce((acc, v) => acc + v.file_size_bytes, 0) / variants.length
        : 0;
      return {
        quantization: q,
        quality: quality.quality,
        label: quality.label,
        color: quality.color,
        avgSize,
        count: variants.length,
      };
    }).filter((d) => d.count > 0);
  }, [ggufVariants]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">GGUF Model Browser</h1>
        <p className="text-gray-400 mt-1">Browse and download quantized models with size/quality tradeoff visualization</p>
      </div>

      {/* Quality vs Size Visualization */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h2 className="text-lg font-semibold text-white">Quality vs Size Tradeoff</h2>
        </div>
        <div className="flex items-end gap-2 h-48">
          {chartData.map((d) => {
            const height = (d.quality / 100) * 100;
            return (
              <div
                key={d.quantization}
                className="flex-1 flex flex-col items-center gap-1"
              >
                <span className="text-xs font-mono text-gray-400">{d.quality}%</span>
                <div className="w-full relative" style={{ height: `${height}%` }}>
                  <div
                    className="absolute inset-0 rounded-t-lg transition-all hover:opacity-100 opacity-80 cursor-pointer"
                    style={{ backgroundColor: d.color }}
                    title={`${d.quantization}: ${d.label} quality, ${d.count} models`}
                  />
                </div>
                <span className="text-xs font-mono text-gray-500 rotate-45 origin-left mt-1 whitespace-nowrap">
                  {d.quantization}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between mt-6 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-500" /> Heavy Loss
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500" /> Acceptable
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500" /> Good
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" /> Excellent
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Info className="h-3 w-3" />
            Bar height represents quality retention
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <select
          value={selectedQuant}
          onChange={(e) => setSelectedQuant(e.target.value as QuantizationType | "all")}
          className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2.5 text-sm text-gray-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="all">All Quantizations</option>
          {QUANT_ORDER.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2.5 text-sm text-gray-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="model">Sort by Model</option>
          <option value="size">Sort by Size</option>
          <option value="quality">Sort by Quality</option>
        </select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-gray-500">
        {allVariantsFlat.length} GGUF file{allVariantsFlat.length !== 1 ? "s" : ""} across {filteredModels.length} model{filteredModels.length !== 1 ? "s" : ""}
      </p>

      {/* GGUF Table */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-800 bg-gray-900/50">
                <th className="px-4 py-3 font-medium">Model</th>
                <th className="px-4 py-3 font-medium">Quantization</th>
                <th className="px-4 py-3 font-medium">File Size</th>
                <th className="px-4 py-3 font-medium">Quality</th>
                <th className="px-4 py-3 font-medium">Filename</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {allVariantsFlat.map((v) => {
                const quality = getQuantizationQuality(v.quantization);
                return (
                  <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{v.modelName}</p>
                      <p className="text-xs text-gray-500">{v.modelAuthor} · {v.modelParamSize}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-gray-200 px-2 py-0.5 rounded bg-gray-800">
                        {v.quantization}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="h-3.5 w-3.5 text-gray-500" />
                        <span className="text-gray-300">{formatBytes(v.file_size_bytes)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-gray-800 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${quality.quality}%`, backgroundColor: quality.color }}
                          />
                        </div>
                        <span className="text-xs font-medium" style={{ color: quality.color }}>
                          {quality.quality}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-gray-400 truncate block max-w-[200px]">
                        {v.filename}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 transition-colors">
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {allVariantsFlat.length === 0 && (
        <div className="text-center py-16">
          <FileDown className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No GGUF files found</h3>
          <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
