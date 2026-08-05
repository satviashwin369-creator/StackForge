"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Download, Pause, Play, ArrowDown } from "lucide-react";
import type { LogEntry } from "@/lib/types/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/dashboard/empty-state";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";

type LogLevel = LogEntry["level"] | "all";

const levelFilters: { value: LogLevel; label: string; className?: string }[] = [
  { value: "all", label: "All" },
  { value: "error", label: "Error", className: "log-error" },
  { value: "warn", label: "Warn", className: "log-warn" },
  { value: "info", label: "Info", className: "log-info" },
  { value: "debug", label: "Debug", className: "log-debug" },
];

interface LogViewerProps {
  logs: LogEntry[];
  services?: readonly string[];
  compact?: boolean;
}

export function LogViewer({ logs, services = ["all"], compact }: LogViewerProps) {
  const [level, setLevel] = useState<LogLevel>("all");
  const [service, setService] = useState("all");
  const [query, setQuery] = useState("");
  const [paused, setPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (level !== "all" && log.level !== level) return false;
      if (service !== "all" && log.service !== service) return false;
      if (query && !log.message.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });
  }, [logs, level, service, query]);

  useEffect(() => {
    if (autoScroll && !paused) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [filtered, autoScroll, paused]);

  const height = compact ? "max-h-[320px]" : "h-[480px]";

  return (
    <Card className="border-border/60 overflow-hidden bg-[oklch(0.11_0.005_260)]">
      <CardHeader className="space-y-4 border-b border-border/60 bg-card/50">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2 font-mono text-sm">
            <span className="text-emerald-400">❯</span>
            stackforge logs — live stream
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-border/60 px-2 py-1">
              <Switch
                id="auto-scroll-logs"
                checked={autoScroll}
                onCheckedChange={(v) => setAutoScroll(Boolean(v))}
              />
              <Label htmlFor="auto-scroll-logs" className="flex items-center gap-1 text-xs">
                <ArrowDown className="size-3" />
                Auto-scroll
              </Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPaused(!paused)}
            >
              {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
              {paused ? "Resume" : "Pause"}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="size-3.5" />
              Export
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 font-mono text-xs"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {levelFilters.map((f) => (
              <Button
                key={f.value}
                variant={level === f.value ? "default" : "outline"}
                size="xs"
                onClick={() => setLevel(f.value)}
                className={cn("font-mono text-xs", level === f.value && f.className)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {services.map((s) => (
            <Button
              key={s}
              variant={service === s ? "secondary" : "ghost"}
              size="xs"
              onClick={() => setService(s)}
              className="font-mono text-xs capitalize"
            >
              {s}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={scrollRef}
          className={cn("overflow-y-auto", height)}
        >
          <div className="space-y-0 p-4 font-mono text-xs leading-relaxed">
            {paused && (
              <div className="mb-2 rounded border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-amber-400">
                Stream paused — {filtered.length} entries visible
              </div>
            )}
            {filtered.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No logs found"
                description="Try adjusting filters or search query."
                className="border-none bg-transparent py-8"
              />
            ) : (
              filtered.map((log) => (
                <div
                  key={log.id}
                  className="group flex gap-3 border-b border-border/20 py-1.5 transition-colors hover:bg-white/[0.02]"
                >
                  <span className="shrink-0 text-muted-foreground/70">
                    {new Date(log.timestamp).toISOString().slice(11, 23)}
                  </span>
                  <span
                    className={cn(
                      "w-12 shrink-0 uppercase",
                      log.level === "error" && "log-error",
                      log.level === "warn" && "log-warn",
                      log.level === "info" && "log-info",
                      log.level === "debug" && "log-debug"
                    )}
                  >
                    {log.level}
                  </span>
                  <span className="w-36 shrink-0 text-primary/80">
                    [{log.service}]
                  </span>
                  <span
                    className={cn(
                      "min-w-0 flex-1 break-all",
                      log.level === "error" && "log-error",
                      log.level === "warn" && "log-warn"
                    )}
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
