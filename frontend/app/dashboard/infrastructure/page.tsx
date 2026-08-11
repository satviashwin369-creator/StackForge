"use client";

import { motion } from "framer-motion";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ServerHealthCard } from "@/components/dashboard/server-health-card";
import {
  CpuUsageChart,
  MemoryUsageChart,
  DiskUsageChart,
} from "@/components/dashboard/charts";
import { ChartSkeleton, ProjectGridSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAsyncData } from "@/hooks/use-async-data";
import { infrastructureService } from "@/lib/api/services";
import { ErrorState } from "@/components/dashboard/error-state";


export default function InfrastructurePage() {
  const servers = useAsyncData(
    () => infrastructureService.getServers().then((r) => r.data),
    []
  );
  const cpu = useAsyncData(
    () => infrastructureService.getCpuSeries().then((r) => r.data),
    []
  );
  const memory = useAsyncData(
    () => infrastructureService.getMemorySeries().then((r) => r.data),
    []
  );
  
  const disk = useAsyncData(
    () => infrastructureService.getDiskSeries().then((r) => r.data),
    []
  );
  const healthyCount =
    servers.data?.filter((s) => s.status === "healthy").length ?? 0;
  const alertCount =
    servers.data?.filter(
      (s) => s.status === "warning" || s.status === "critical"
    ).length ?? 0;

  return (
    <DashboardLayout
      title="Infrastructure"
      description="Server health, resource utilization, and uptime monitoring"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total servers", value: servers.data?.length ?? "—" },
          { label: "Healthy", value: healthyCount },
          { label: "Alerts", value: alertCount },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="border-border/60 bg-card/80">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold tabular-nums">{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {cpu.error ? (
          <ErrorState
            title="Unable to load CPU data"
            message={cpu.error}
            onRetry={cpu.refetch}
            className="h-full"
          />
        ) : !cpu.data ? (
          <ChartSkeleton tall />
        ) : (
          <CpuUsageChart data={cpu.data} title="Cluster CPU (24h)" />
        )}
        {memory.error ? (
          <ErrorState
            title="Unable to load memory data"
            message={memory.error}
            onRetry={memory.refetch}
            className="h-full"
          />
        ) : !memory.data ? (
          <ChartSkeleton tall />
        ) : (
          <MemoryUsageChart data={memory.data} />
        )}
        {disk.error ? (
          <ErrorState
            title="Unable to load disk data"
            message={disk.error}
            onRetry={disk.refetch}
            className="h-full"
          />
        ) : !disk.data ? (
          <ChartSkeleton tall />
        ) : (
          <DiskUsageChart data={disk.data} />
        )}
      </div>

      <div>
        <h2 className="mb-4 text-sm font-medium text-muted-foreground">
          Server health
        </h2>
        {!servers.data ? (
          <ProjectGridSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {servers.data.map((server, i) => (
              <ServerHealthCard key={server.id} server={server} index={i} />
            ))}
          </div>
        )}
        {servers.error ? (
          <ErrorState
            title="Unable to load server health"
            message={servers.error}
            onRetry={servers.refetch}
          />
        ) : !servers.data ? (
          <ProjectGridSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {servers.data.map((server, i) => (
              <ServerHealthCard key={server.id} server={server} index={i} />
            ))}
          </div>
        )}
      </div>

      {servers.data && (
        <Card className="border-border/60 bg-card/80">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Uptime SLA (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {servers.data.map((server) => (
                <div key={server.id} className="flex items-center gap-4">
                  <span className="w-36 shrink-0 font-mono text-xs">
                    {server.name}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${server.uptimePercent}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs tabular-nums text-emerald-400">
                    {server.uptimePercent}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
