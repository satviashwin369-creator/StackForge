"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

interface ChartContainerProps {
  height?: number;
  className?: string;
  children: React.ReactNode;
}

const emptySubscribe = () => () => {};

/** Defers chart render until mount so Recharts gets valid dimensions. */
export function ChartContainer({
  height = 228,
  className,
  children,
}: ChartContainerProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

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
