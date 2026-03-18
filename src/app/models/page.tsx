"use client";

import { useAppStore } from "@/store/app-store";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import {
  Search, Download, Star, Heart, Filter, ChevronDown, X, SlidersHorizontal
} from "lucide-react";
import { useState } from "react";
import { ModelArchitecture, TaskType } from "@/types";

const architectures: { value: ModelArchitecture | ""; label: string }[] = [
  { value: "", label: "All Architectures" },
  { value: "llama", label: "LLaMA" },
  { value: "mistral", label: "Mistral" },
  { value: "phi", label: "Phi" },
  { value: "gemma", label: "Gemma" },
  { value: "qwen", label: "Qwen" },
  { value: "mixtral", label: "Mixtral" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "falcon", label: "Falcon" },
  { value: "mamba", label: "Mamba" },
  { value: "rwkv", label: "RWKV" },
  { value: "starcoder", label: "StarCoder" },
  { value: "command-r", label: "Command R" },
  { value: "transformer", label: "Transformer" },
  { value: "other", label: "Other" },
];

const taskTypes: { value: TaskType | ""; label: string }[] = [
  { value: "", label: "All Tasks" },
  { value: "chat", label: "Chat" },
  { value: "text-generation", label: "Text Generation" },
  { value: "code-generation", label: "Code Generation" },
  { value: "summarization", label: "Summarization" },
  { value: "translation", label: "Translation" },
  { value: "question-answering", label: "Question Answering" },
  { value: "embedding", label: "Embedding" },
  { value: "multimodal", label: "Multimodal" },
  { value: "other", label: "Other" },
];

const sortOptions = [
  { value: "downloads", label: "Most Downloads" },
  { value: "likes", label: "Most Liked" },
  { value: "rating", label: "Highest Rated" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name" },
];

export default function ModelsPage() {
  const { filters, setFilters, getFilteredModels } = useAppStore();
  const [showFilters, setShowFilters] = useState(false);
  const filteredModels = getFilteredModels();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Model Catalog</h1>
        <p className="text-gray-400 mt-1">Browse and discover open-source AI models</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search models by name, author, or tags..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 py-2.5 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
            showFilters ? "border-brand-500 bg-brand-500/10 text-brand-400" : "border-gray-700 bg-gray-800/50 text-gray-400 hover:bg-gray-800"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        <select
          value={filters.sort_by}
          onChange={(e) => setFilters({ sort_by: e.target.value as typeof filters.sort_by })}
          className="rounded-lg border border-gray-700 bg-gray-800/50 px-3 py-2.5 text-sm text-gray-300 focus:border-brand-500 focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 animate-slide-in">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Architecture</label>
              <select
                value={filters.architecture}
                onChange={(e) => setFilters({ architecture: e.target.value as ModelArchitecture | "" })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 focus:border-brand-500 focus:outline-none"
              >
                {architectures.map((a) => (
                  <option key={a.value} value={a.value}>{a.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Task Type</label>
              <select
                value={filters.task_type}
                onChange={(e) => setFilters({ task_type: e.target.value as TaskType | "" })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 focus:border-brand-500 focus:outline-none"
              >
                {taskTypes.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">License</label>
              <input
                type="text"
                placeholder="e.g. Apache, MIT"
                value={filters.license}
                onChange={(e) => setFilters({ license: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:border-brand-500 focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ search: "", architecture: "", task_type: "", license: "", sort_by: "downloads" })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-gray-300 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="text-sm text-gray-500">
        {filteredModels.length} model{filteredModels.length !== 1 ? "s" : ""} found
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredModels.map((model) => (
          <Link
            key={model.id}
            href={`/models/${model.id}`}
            className="group rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-gray-700 hover:bg-gray-900/80 transition-all hover:shadow-lg hover:shadow-brand-500/5"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold">
                {model.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate group-hover:text-brand-400 transition-colors">
                  {model.name}
                </h3>
                <p className="text-xs text-gray-500">{model.author}</p>
              </div>
              {model.is_featured && (
                <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 line-clamp-2 mb-4">{model.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="px-2 py-0.5 rounded-md bg-gray-800 text-xs text-gray-400">{model.architecture}</span>
              <span className="px-2 py-0.5 rounded-md bg-gray-800 text-xs text-gray-400">{model.parameter_size}</span>
              <span className="px-2 py-0.5 rounded-md bg-gray-800 text-xs text-gray-400">{model.task_type}</span>
              <span className="px-2 py-0.5 rounded-md bg-gray-800 text-xs text-gray-400">{model.license}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Download className="h-3.5 w-3.5" />
                {formatNumber(model.downloads)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {formatNumber(model.likes)}
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-500" />
                {model.avg_rating.toFixed(1)} ({model.review_count})
              </span>
            </div>
          </Link>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400">No models found</h3>
          <p className="text-sm text-gray-600 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
