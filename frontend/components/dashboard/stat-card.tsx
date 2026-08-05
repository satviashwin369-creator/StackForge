"use client";

import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  icon: LucideIcon;
  iconClassName?: string;
  index?: number;
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  icon: Icon,
  iconClassName,
  index = 0,
}: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0;
  const isFailureMetric = title.toLowerCase().includes("failure");
  const trendGood = isFailureMetric ? !isPositive : isPositive;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
    >
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm transition-colors hover:border-primary/30">
        <CardContent className="flex items-start justify-between gap-4 p-4">
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  trendGood ? "text-emerald-400" : "text-red-400"
                )}
              >
                {trendGood ? (
                  <TrendingUp className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                <span>
                  {isPositive ? "+" : ""}
                  {trend}%
                </span>
                {trendLabel && (
                  <span className="text-muted-foreground font-normal">
                    {trendLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10",
              iconClassName
            )}
          >
            <Icon className="size-5 text-primary" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
