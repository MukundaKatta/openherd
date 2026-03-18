"use client";

import { useAppStore } from "@/store/app-store";
import { Search } from "lucide-react";

export default function Header() {
  const { ollamaConnected } = useAppStore();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm px-6">
      <div className="flex-1 flex items-center gap-3">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search models, benchmarks, endpoints..."
            className="w-full rounded-lg border border-gray-700 bg-gray-800/50 py-2 pl-10 pr-4 text-sm text-gray-200 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1.5 text-xs">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              ollamaConnected ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span className={ollamaConnected ? "text-green-400" : "text-red-400"}>
            Ollama {ollamaConnected ? "Connected" : "Offline"}
          </span>
        </div>
      </div>
    </header>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
