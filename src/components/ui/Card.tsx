"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

export function Card({ children, className, hover = false, padding = "md" }: CardProps) {
  const paddingClasses = {
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-800 bg-gray-900",
        paddingClasses[padding],
        hover && "hover:border-gray-700 hover:bg-gray-900/80 transition-all hover:shadow-lg hover:shadow-brand-500/5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  );
}
