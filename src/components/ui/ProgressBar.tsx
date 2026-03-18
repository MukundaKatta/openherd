"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "brand";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const colorClasses = {
  blue: "from-blue-600 to-blue-400",
  green: "from-green-600 to-green-400",
  red: "from-red-600 to-red-400",
  yellow: "from-yellow-600 to-yellow-400",
  purple: "from-purple-600 to-purple-400",
  brand: "from-brand-600 to-brand-400",
};

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  color = "brand",
  size = "md",
  showLabel = false,
  className,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("rounded-full bg-gray-800 overflow-hidden", sizeClasses[size])}>
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r transition-all duration-300",
            colorClasses[color]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1">{percent.toFixed(0)}%</p>
      )}
    </div>
  );
}
