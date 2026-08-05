import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ProjectStatus = "running" | "failed" | "building" | "deploying" | "idle";
type DeploymentStatus =
  | "success"
  | "failed"
  | "building"
  | "deploying"
  | "queued"
  | "cancelled";
type ServerStatus = "healthy" | "warning" | "critical" | "offline";
type PipelineStatus = "success" | "failed" | "running" | "pending" | "skipped";

type Status = ProjectStatus | DeploymentStatus | ServerStatus | PipelineStatus;

const statusConfig: Record<
  Status,
  { label: string; className: string; dotClassName: string }
> = {
  running: {
    label: "Running",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClassName: "bg-emerald-400",
  },
  success: {
    label: "Success",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClassName: "bg-emerald-400",
  },
  healthy: {
    label: "Healthy",
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    dotClassName: "bg-emerald-400",
  },
  building: {
    label: "Building",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    dotClassName: "bg-blue-400 animate-pulse",
  },
  deploying: {
    label: "Deploying",
    className: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    dotClassName: "bg-violet-400 animate-pulse",
  },
  queued: {
    label: "Queued",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    dotClassName: "bg-zinc-400",
  },
  pending: {
    label: "Pending",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    dotClassName: "bg-zinc-400",
  },
  idle: {
    label: "Idle",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    dotClassName: "bg-zinc-500",
  },
  skipped: {
    label: "Skipped",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    dotClassName: "bg-zinc-500",
  },
  warning: {
    label: "Warning",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    dotClassName: "bg-amber-400",
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
    dotClassName: "bg-red-400",
  },
  critical: {
    label: "Critical",
    className: "bg-red-500/10 text-red-400 border-red-500/20",
    dotClassName: "bg-red-400 animate-pulse",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    dotClassName: "bg-zinc-500",
  },
  offline: {
    label: "Offline",
    className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
    dotClassName: "bg-zinc-600",
  },
};

interface StatusBadgeProps {
  status: Status;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  showDot = true,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        "gap-1.5 border font-medium capitalize",
        config.className,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("size-1.5 shrink-0 rounded-full", config.dotClassName)}
        />
      )}
      {config.label}
    </Badge>
  );
}
