"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Box, Search, Rocket, BarChart3, FileDown, Wrench, Swords,
  Star, Globe, Activity, GitMerge, Home
} from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/models", label: "Model Catalog", icon: Search },
  { href: "/deploy", label: "Deploy", icon: Rocket },
  { href: "/benchmarks", label: "Benchmarks", icon: BarChart3 },
  { href: "/gguf", label: "GGUF Browser", icon: FileDown },
  { href: "/finetune", label: "Fine-Tuning", icon: Wrench },
  { href: "/arena", label: "Arena", icon: Swords },
  { href: "/reviews", label: "Reviews", icon: Star },
  { href: "/endpoints", label: "API Endpoints", icon: Globe },
  { href: "/monitor", label: "Resources", icon: Activity },
  { href: "/merge", label: "Model Merge", icon: GitMerge },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-800 bg-gray-900 flex flex-col">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <Box className="h-8 w-8 text-brand-500" />
        <div>
          <h1 className="text-xl font-bold text-white">OpenHerd</h1>
          <p className="text-xs text-gray-500">Model Registry & Deploy</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 scrollbar-thin">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-600/20 text-brand-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              )}
            >
              <Icon className="h-4.5 w-4.5 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-800 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}
