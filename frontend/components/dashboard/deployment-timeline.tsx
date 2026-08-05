"use client";

import { motion } from "framer-motion";
import { GitCommit } from "lucide-react";
import type { Deployment } from "@/lib/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { cn } from "@/lib/utils";

interface DeploymentTimelineProps {
  deployments: Deployment[];
}

export function DeploymentTimeline({ deployments }: DeploymentTimelineProps) {
  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Deployment history</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
          {deployments.map((dep, i) => (
            <motion.div
              key={dep.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="relative flex gap-4 pb-6 last:pb-0"
            >
              <div
                className={cn(
                  "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 bg-card",
                  dep.status === "success" && "border-emerald-500",
                  dep.status === "failed" && "border-red-500",
                  dep.status === "building" && "border-primary",
                  (dep.status === "queued" || dep.status === "cancelled") &&
                    "border-muted-foreground"
                )}
              >
                <GitCommit className="size-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{dep.projectName}</span>
                  <StatusBadge status={dep.status} />
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                    {dep.environment}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                  {dep.commitMessage}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                  <span>{dep.commit}</span>
                  <span>{dep.branch}</span>
                  <span>{dep.duration}</span>
                  <span>
                    {dep.author} · {dep.timestamp}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
