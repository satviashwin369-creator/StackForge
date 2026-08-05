"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  FlaskConical,
  GitBranch,
  Hammer,
  Loader2,
  MinusCircle,
  Rocket,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { PipelineStage } from "@/lib/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  "git-branch": GitBranch,
  hammer: Hammer,
  "flask-conical": FlaskConical,
  "shield-check": ShieldCheck,
  rocket: Rocket,
  "check-circle": CheckCircle2,
};

function StageIcon({ status }: { status: PipelineStage["status"] }) {
  if (status === "success")
    return <CheckCircle2 className="size-5 text-emerald-400" />;
  if (status === "failed")
    return <XCircle className="size-5 text-red-400" />;
  if (status === "running")
    return <Loader2 className="size-5 animate-spin text-primary" />;
  if (status === "skipped")
    return <MinusCircle className="size-5 text-muted-foreground" />;
  return <Circle className="size-5 text-muted-foreground/50" />;
}

interface PipelineFlowProps {
  stages: PipelineStage[];
  title?: string;
}

export function PipelineFlow({
  stages,
  title = "Active pipeline",
}: PipelineFlowProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-0 md:flex-row md:items-start md:justify-between">
          {stages.map((stage, i) => {
            const Icon = iconMap[stage.icon] ?? Circle;
            const isLast = i === stages.length - 1;

            return (
              <motion.div
                key={stage.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-1 flex-col items-center md:min-w-0"
              >
                <div className="flex w-full items-center">
                  {!isLast && (
                    <div
                      className={cn(
                        "hidden h-0.5 flex-1 md:block",
                        stage.status === "success"
                          ? "bg-emerald-500/50"
                          : stage.status === "running"
                            ? "bg-gradient-to-r from-emerald-500/50 to-primary/50"
                            : "bg-border"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "relative z-10 flex size-12 items-center justify-center rounded-xl border",
                      stage.status === "success" &&
                        "border-emerald-500/30 bg-emerald-500/10",
                      stage.status === "running" &&
                        "border-primary/40 bg-primary/10 shadow-[0_0_16px_-4px] shadow-primary/30",
                      stage.status === "failed" &&
                        "border-red-500/30 bg-red-500/10",
                      (stage.status === "pending" || stage.status === "skipped") &&
                        "border-border bg-muted/30"
                    )}
                  >
                    {stage.status === "pending" ? (
                      <Icon className="size-5 text-muted-foreground" />
                    ) : (
                      <StageIcon status={stage.status} />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "hidden h-0.5 flex-1 md:block",
                        stages[i + 1]?.status === "success" ||
                          stages[i + 1]?.status === "running"
                          ? "bg-emerald-500/50"
                          : "bg-border"
                      )}
                    />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className="text-xs font-medium">{stage.name}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {stage.duration}
                  </p>
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "my-2 h-6 w-0.5 md:hidden",
                      stage.status === "success"
                        ? "bg-emerald-500/50"
                        : "bg-border"
                    )}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
