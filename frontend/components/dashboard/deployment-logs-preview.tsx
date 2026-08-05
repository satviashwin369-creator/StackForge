"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";
import type { LogEntry } from "@/lib/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface DeploymentLogsPreviewProps {
  logs: LogEntry[];
  projectName?: string;
}

export function DeploymentLogsPreview({
  logs,
  projectName,
}: DeploymentLogsPreviewProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  return (
    <Card className="border-border/60 overflow-hidden bg-[oklch(0.11_0.005_260)]">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/60 bg-card/50 py-3">
        <CardTitle className="flex items-center gap-2 font-mono text-sm">
          <Terminal className="size-4 text-primary" />
          Pipeline logs
          {projectName && (
            <span className="text-muted-foreground">— {projectName}</span>
          )}
        </CardTitle>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="auto-scroll-preview"
              checked={autoScroll}
              onCheckedChange={(v) => setAutoScroll(Boolean(v))}
            />
            <Label htmlFor="auto-scroll-preview" className="text-xs">
              Auto-scroll
            </Label>
          </div>
          <Link
            href="/dashboard/logs"
            className={buttonVariants({ variant: "outline", size: "xs" })}
          >
            Full viewer
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[280px] overflow-y-auto p-4 font-mono text-xs leading-relaxed">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-2 border-b border-border/10 py-1 hover:bg-white/[0.02]"
            >
              <span className="shrink-0 text-muted-foreground/60">
                {new Date(log.timestamp).toISOString().slice(11, 19)}
              </span>
              <span
                className={cn(
                  "w-10 shrink-0 uppercase",
                  log.level === "error" && "log-error",
                  log.level === "warn" && "log-warn",
                  log.level === "info" && "log-info"
                )}
              >
                {log.level}
              </span>
              <span className="min-w-0 flex-1 truncate">{log.message}</span>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </CardContent>
    </Card>
  );
}
