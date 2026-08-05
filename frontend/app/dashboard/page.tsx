"use client";

import { Activity, AlertTriangle, Rocket, Server } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { CpuUsageChart, DeploymentSuccessChart } from "@/components/dashboard/charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DeploymentsTable } from "@/components/dashboard/deployments-table";
import { ChartSkeleton, TableSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { useAsyncData } from "@/hooks/use-async-data";
import { dashboardService, deploymentsService } from "@/lib/api/services";
import {
  kpiStats,
  cpuTimeSeriesData,
  deploymentSuccessData,
  activities as mockActivities,
  deployments as mockDeployments,
} from "@/lib/mock-data";

export default function DashboardOverviewPage() {
  // Each call uses mock data as an immediate fallback — no blank flicker,
  // no error screen when backend is offline. Live data replaces it silently.
  const kpis = useAsyncData(
    () => dashboardService.getKpis().then((r) => r.data),
    [],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kpiStats as any
  );
  const cpu = useAsyncData(
    () => dashboardService.getCpuSeries().then((r) => r.data),
    [],
    cpuTimeSeriesData
  );
  const deployChart = useAsyncData(
    () => dashboardService.getDeploymentSuccessSeries().then((r) => r.data),
    [],
    deploymentSuccessData
  );
  const activities = useAsyncData(
    () => dashboardService.getActivities().then((r) => r.data),
    [],
    mockActivities
  );
  const deployments = useAsyncData(
    () => deploymentsService.getAll().then((r) => r.data),
    [],
    mockDeployments
  );

  return (
    <DashboardLayout
      title="Overview"
      description="Real-time metrics across your DevOps infrastructure"
    >
      {/* KPI stat cards — always visible (mock data shown instantly) */}
      {kpis.data && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Active deployments"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={String((kpis.data as any).activeDeployments ?? (kpis.data as any).totalDeployments ?? "—")}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            trend={(kpis.data as any).activeDeploymentsTrend ?? (kpis.data as any).totalDeploymentsTrend ?? 0}
            trendLabel="vs last hour"
            icon={Rocket}
            index={0}
          />
          <StatCard
            title="System uptime"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={`${(kpis.data as any).uptimePercent}%`}
            subtitle="Last 30 days"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            trend={(kpis.data as any).uptimeTrend ?? 0}
            trendLabel="vs last month"
            icon={Activity}
            index={1}
          />
          <StatCard
            title="Failed builds"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={String((kpis.data as any).failedBuilds ?? (kpis.data as any).failureRate ?? "—")}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            trend={(kpis.data as any).failedBuildsTrend ?? (kpis.data as any).failureRateTrend ?? 0}
            trendLabel="vs yesterday"
            icon={AlertTriangle}
            index={2}
          />
          <StatCard
            title="Running services"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            value={String((kpis.data as any).runningServices ?? (kpis.data as any).activeProjects ?? "—")}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            trend={(kpis.data as any).runningServicesTrend ?? (kpis.data as any).activeProjectsTrend ?? 0}
            trendLabel="healthy"
            icon={Server}
            index={3}
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {!cpu.data ? (
          <ChartSkeleton tall />
        ) : (
          <CpuUsageChart data={cpu.data} title="System usage (CPU)" />
        )}
        {!deployChart.data ? (
          <ChartSkeleton tall />
        ) : (
          <DeploymentSuccessChart data={deployChart.data} />
        )}
      </div>

      {/* Deployments table + activity feed */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {!deployments.data ? (
            <TableSkeleton />
          ) : (
            <DeploymentsTable deployments={deployments.data.slice(0, 6)} />
          )}
        </div>
        {activities.data ? (
          <ActivityFeed activities={activities.data} limit={6} />
        ) : (
          <ChartSkeleton />
        )}
      </div>
    </DashboardLayout>
  );
}
