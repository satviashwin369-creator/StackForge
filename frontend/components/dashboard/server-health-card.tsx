"use client";

import { motion } from "framer-motion";
import { Cpu, HardDrive, MemoryStick, MapPin } from "lucide-react";
import type { Server } from "@/lib/types/models";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { cn } from "@/lib/utils";

function MetricBar({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  const color =
    value >= 90 ? "bg-red-500" : value >= 75 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Icon className="size-3" />
          {label}
        </span>
        <span className="tabular-nums font-medium">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6 }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}

interface ServerHealthCardProps {
  server: Server;
  index?: number;
}

export function ServerHealthCard({ server, index = 0 }: ServerHealthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={cn(
          "border-border/60 bg-card/80 transition-colors hover:border-primary/20",
          server.status === "critical" &&
            "border-red-500/30 shadow-[0_0_20px_-8px] shadow-red-500/20"
        )}
      >
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div>
            <h3 className="font-semibold font-mono text-sm">{server.name}</h3>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="size-3" />
              {server.region}
            </p>
          </div>
          <StatusBadge status={server.status} />
        </CardHeader>
        <CardContent className="space-y-4">
          <MetricBar label="CPU" value={server.cpu} icon={Cpu} />
          <MetricBar label="RAM" value={server.ram} icon={MemoryStick} />
          <MetricBar label="Disk" value={server.disk} icon={HardDrive} />
          <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
            <div>
              <p className="text-muted-foreground">Uptime</p>
              <p className="font-mono font-medium">{server.uptime}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">SLA</p>
              <p className="font-medium tabular-nums text-emerald-400">
                {server.uptimePercent}%
              </p>
            </div>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>{server.ip}</span>
            <span>{server.os}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
