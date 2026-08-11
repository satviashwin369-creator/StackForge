"use client";

import { Activity, AlertTriangle, Rocket, Server } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { CpuUsageChart, DeploymentSuccessChart } from "@/components/dashboard/charts";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { DeploymentsTable } from "@/components/dashboard/deployments-table";
import { ChartSkeleton, TableSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { ErrorState } from "@/components/dashboard/error-state";
import { useAsyncData } from "@/hooks/use-async-data";
import { dashboardService, deploymentsService } from "@/lib/api/services";


export default function DashboardOverviewPage() {
  // Each call uses mock data as an immediate fallback — no blank flicker,
  // no error screen when backend is offline. Live data replaces it silently.
  const kpis = useAsyncData(
    () => dashboardService.getKpis().then((r) => r.data),
    []
  );
  const cpu = useAsyncData(
    () => dashboardService.getCpuSeries().then((r) => r.data),
    []
  );
  const deployChart = useAsyncData(
    () => dashboardService.getDeploymentSuccessSeries().then((r) => r.data),
    []
  );
  const activities = useAsyncData(
    () => dashboardService.getActivities().then((r) => r.data),
    []
  );
  const deployments = useAsyncData(
    () => deploymentsService.getAll().then((r) => r.data),
    []
  );

  return (
    <DashboardLayout
      title="Overview"
      description="Real-time metrics across your DevOps infrastructure"
    >
      {/* KPI stat cards — always visible (mock data shown instantly) */}
      {kpis.error ? (
       <div className="col-span-full">
         <ErrorState
           title="Unable to load dashboard statistics"
           message={kpis.error}
           onRetry={kpis.refetch}
         />
       </div>
      ) : kpis.data ? (
        <>
          <StatCard
            title="Active deployments"
            value={String(
              (kpis.data as any).activeDeployments ??
                (kpis.data as any).totalDeployments ??
                "—"
            )}
            trend={
              (kpis.data as any).activeDeploymentsTrend ??
              (kpis.data as any).totalDeploymentsTrend ??
              0
            }
            trendLabel="vs last hour"
            icon={Rocket}
            index={0}
          />

          <StatCard
            title="System uptime"
            value={`${(kpis.data as any).uptimePercent}%`}
            subtitle="Last 30 days"
            trend={(kpis.data as any).uptimeTrend ?? 0}
            trendLabel="vs last month"
            icon={Activity}
            index={1}
          />

          <StatCard
            title="Failed builds"
            value={String(
              (kpis.data as any).failedBuilds ??
              (kpis.data as any).failureRate ??
              "—"
           )}
            trend={
             (kpis.data as any).failedBuildsTrend ??
             (kpis.data as any).failureRateTrend ??
             0
            }
            trendLabel="vs yesterday"
            icon={AlertTriangle}
            index={2}
          />

          <StatCard
            title="Running services"
            value={String(
              (kpis.data as any).runningServices ??
              (kpis.data as any).activeProjects ??
              "—"
            )}
            trend={
            (kpis.data as any).runningServicesTrend ??
            (kpis.data as any).activeProjectsTrend ??
            0
            }
            trendLabel="healthy"
            icon={Server}
            index={3}
          />
        </>
      ) : null}

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
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
          <CpuUsageChart data={cpu.data} title="System usage (CPU)" />
        )}
        {deployChart.error ? (
          <ErrorState
            title="Unable to load deployment statistics"
            message={deployChart.error}
            onRetry={deployChart.refetch}
            className="h-full"
          />
        ) : !deployChart.data ? (
          <ChartSkeleton tall />
        ) : (
          <DeploymentSuccessChart data={deployChart.data} />
        )}
        
      </div>

      {/* Deployments table + activity feed */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {deployments.error ? (
            <ErrorState
              title="Unable to load deployments"
              message={deployments.error}
              onRetry={deployments.refetch}
              className="h-full"
            />
          ) : !deployments.data ? (
            <TableSkeleton />
          ) : (
            <DeploymentsTable deployments={deployments.data.slice(0, 6)} />
     )}
        </div>

        {activities.error ? (
          <ErrorState
            title="Unable to load activity"
            message={activities.error}
            onRetry={activities.refetch}
            className="h-full"
          />
        ) : activities.data ? (
          <ActivityFeed activities={activities.data} limit={6} />
        ) : (
          <ChartSkeleton />
        )}
        
      </div>
    </DashboardLayout>
  );
}
