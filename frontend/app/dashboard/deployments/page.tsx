"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { PipelineFlow } from "@/components/dashboard/pipeline-flow";
import { DeploymentTimeline } from "@/components/dashboard/deployment-timeline";
import { DeploymentsTable } from "@/components/dashboard/deployments-table";
import { DeploymentLogsPreview } from "@/components/dashboard/deployment-logs-preview";
import { ChartSkeleton, TableSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { useAsyncData } from "@/hooks/use-async-data";
import { deploymentsService } from "@/lib/api/services";
import {
  pipelineStages as mockPipeline,
  deployments as mockDeployments,
  logEntries as mockLogs,
} from "@/lib/mock-data";

export default function DeploymentsPage() {
  const pipeline = useAsyncData(
    () => deploymentsService.getPipeline().then((r) => r.data),
    [],
    mockPipeline
  );

  const deployments = useAsyncData(
    () => deploymentsService.getAll().then((r) => r.data),
    [],
    mockDeployments
  );

  const logs = useAsyncData(
    () => deploymentsService.getRecentLogs().then((r) => r.data),
    [],
    mockLogs
  );

  return (
    <DashboardLayout
      title="Deployments"
      description="CI/CD pipelines and deployment history"
    >
      {!pipeline.data ? (
        <ChartSkeleton tall />
      ) : (
        <PipelineFlow stages={pipeline.data} />
      )}

      {!logs.data ? (
        <ChartSkeleton />
      ) : (
        <DeploymentLogsPreview logs={logs.data} />
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {!deployments.data ? (
          <>
            <ChartSkeleton tall />
            <TableSkeleton />
          </>
        ) : (
          <>
            <DeploymentTimeline deployments={deployments.data} />
            <DeploymentsTable deployments={deployments.data} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
