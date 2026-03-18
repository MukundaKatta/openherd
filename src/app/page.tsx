"use client";

import Link from "next/link";
import { useAppStore } from "@/store/app-store";
import { formatNumber } from "@/lib/utils";
import {
  Search, Rocket, BarChart3, FileDown, Wrench, Swords,
  Star, Globe, Activity, GitMerge, TrendingUp, Download, Heart, Box
} from "lucide-react";

const features = [
  { href: "/models", label: "Model Catalog", desc: "Browse and search models", icon: Search, color: "from-blue-600 to-blue-800" },
  { href: "/deploy", label: "Deploy Models", desc: "One-click Ollama deployment", icon: Rocket, color: "from-green-600 to-green-800" },
  { href: "/benchmarks", label: "Benchmarks", desc: "Compare model performance", icon: BarChart3, color: "from-purple-600 to-purple-800" },
  { href: "/gguf", label: "GGUF Browser", desc: "Quantized model downloads", icon: FileDown, color: "from-orange-600 to-orange-800" },
  { href: "/finetune", label: "Fine-Tuning", desc: "LoRA/QLoRA training jobs", icon: Wrench, color: "from-rose-600 to-rose-800" },
  { href: "/arena", label: "Model Arena", desc: "Blind A/B model comparison", icon: Swords, color: "from-amber-600 to-amber-800" },
  { href: "/reviews", label: "Reviews", desc: "Community ratings", icon: Star, color: "from-yellow-600 to-yellow-800" },
  { href: "/endpoints", label: "API Endpoints", desc: "OpenAI-compatible APIs", icon: Globe, color: "from-cyan-600 to-cyan-800" },
  { href: "/monitor", label: "Resource Monitor", desc: "GPU/CPU/RAM usage", icon: Activity, color: "from-emerald-600 to-emerald-800" },
  { href: "/merge", label: "Model Merge", desc: "Combine models", icon: GitMerge, color: "from-indigo-600 to-indigo-800" },
];

export default function HomePage() {
  const { models, benchmarks, arenaLeaderboard } = useAppStore();

  const totalDownloads = models.reduce((acc, m) => acc + m.downloads, 0);
  const totalLikes = models.reduce((acc, m) => acc + m.likes, 0);
  const featuredModels = models.filter((m) => m.is_featured).slice(0, 4);
  const topArena = arenaLeaderboard.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-950 via-gray-900 to-gray-950 border border-gray-800 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <Box className="h-10 w-10 text-brand-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              OpenHerd
            </h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mb-6">
            Your open-source model registry and deployment platform. Browse, deploy, benchmark,
            fine-tune, and compare AI models — all from one place.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm">
              <Box className="h-4 w-4 text-brand-400" />
              <span className="text-gray-300">{models.length} Models</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Download className="h-4 w-4 text-green-400" />
              <span className="text-gray-300">{formatNumber(totalDownloads)} Downloads</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Heart className="h-4 w-4 text-red-400" />
              <span className="text-gray-300">{formatNumber(totalLikes)} Likes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-purple-400" />
              <span className="text-gray-300">{benchmarks.length} Benchmarks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Platform Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.href}
                href={f.href}
                className="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900 p-4 hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-brand-500/5"
              >
                <div className={`inline-flex rounded-lg bg-gradient-to-br ${f.color} p-2.5 mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{f.label}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Featured Models & Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Models */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Featured Models</h2>
            <Link href="/models" className="text-sm text-brand-400 hover:text-brand-300">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {featuredModels.map((model) => (
              <Link
                key={model.id}
                href={`/models/${model.id}`}
                className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3 hover:bg-gray-800 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center text-white font-bold text-sm">
                  {model.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{model.name}</h3>
                  <p className="text-xs text-gray-500">{model.author} · {model.parameter_size} · {model.architecture}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {formatNumber(model.downloads)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500" />
                    {model.avg_rating.toFixed(1)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Arena Leaderboard Preview */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Arena Leaderboard</h2>
            <Link href="/arena" className="text-sm text-brand-400 hover:text-brand-300">
              View full
            </Link>
          </div>
          <div className="space-y-2">
            {topArena.map((entry, idx) => (
              <div
                key={entry.model_id}
                className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-800/50 p-3"
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  idx === 0 ? "bg-yellow-500/20 text-yellow-400" :
                  idx === 1 ? "bg-gray-400/20 text-gray-300" :
                  idx === 2 ? "bg-orange-500/20 text-orange-400" :
                  "bg-gray-700 text-gray-400"
                }`}>
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{entry.model_name}</h3>
                  <p className="text-xs text-gray-500">
                    {entry.total_matches} matches · {entry.win_rate.toFixed(1)}% win rate
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-mono">
                  <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                  <span className="text-green-400 font-semibold">{entry.elo_rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
