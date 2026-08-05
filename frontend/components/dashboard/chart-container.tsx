"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  height?: number;
  className?: string;
  children: React.ReactNode;
}

/** Defers chart render until mount so Recharts gets valid dimensions. */
export function ChartContainer({
  height = 228,
  className,
  children,
}: ChartContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn("w-full min-w-0 rounded-md bg-muted/20", className)}
        style={{ height }}
        aria-hidden
      />
    );
  }

  return (
    <div className={cn("w-full min-w-0", className)} style={{ height }}>
      {children}
    </div>
  );
}
