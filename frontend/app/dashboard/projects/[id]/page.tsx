"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, GitBranch } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DeploymentTimeline } from "@/components/dashboard/deployment-timeline";
import { DeploymentLogsPreview } from "@/components/dashboard/deployment-logs-preview";
import { PipelineFlow } from "@/components/dashboard/pipeline-flow";
import { DeployProjectButton } from "@/components/dashboard/deploy-project-button";
import { ErrorState } from "@/components/dashboard/error-state";
import { ChartSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  projectsService,
  deploymentsService,
} from "@/lib/api/services";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

function projectBadgeStatus(
  status: string
): "running" | "failed" | "deploying" | "idle" {
  if (status === "building") return "deploying";
  return status as "running" | "failed" | "idle";
}

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: project,
    loading,
    error,
    refetch,
  } = useAsyncData(async () => {
    const res = await projectsService.getById(id);
    return res.data;
  }, [id]);

  const { data: pipeline, refetch: refetchPipeline } = useAsyncData(() =>
    deploymentsService.getPipeline().then((r) => r.data)
  );

  const {
    data: projectDeployments,
    refetch: refetchDeployments,
  } = useAsyncData(async () => {
    if (!project) return [];
    const res = await deploymentsService.getByProject(project.id, project.name);
    return res.data;
  }, [project?.id, project?.name]);

  const { data: previewLogs } = useAsyncData(async () => {
    const res = await deploymentsService.getRecentLogs();
    return res.data;
  }, []);

  if (error) {
    return (
      <DashboardLayout title="Project" description="Project not found">
        <ErrorState message={error} onRetry={refetch} />
        <Link
          href="/dashboard/projects"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
        >
          <ArrowLeft className="size-4" />
          Back to projects
        </Link>
      </DashboardLayout>
    );
  }

  if (loading || !project) {
    return (
      <DashboardLayout title="Loading..." description="Fetching project">
        <ChartSkeleton tall />
        <ChartSkeleton tall />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={project.name}
      description={project.description}
    >
      <Link
        href="/dashboard/projects"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "mb-2 -mt-2 w-fit gap-1.5"
        )}
      >
        <ArrowLeft className="size-4" />
        All projects
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={projectBadgeStatus(project.status)} />
            <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
              {project.framework}
            </span>
          </div>
          <p className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <GitBranch className="size-3" />
            {project.repo} · {project.branch}
          </p>
        </div>
        <DeployProjectButton
          project={project}
          onDeployed={() => {
            void refetchDeployments();
            void refetchPipeline();
            void refetch();
          }}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border/60 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  Health score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tabular-nums">
                  {project.healthScore}%
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  Last deployed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm font-medium">{project.lastDeployed}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">
                  Stack
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-1">
                {project.techStack.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px]"
                  >
                    {t}
                  </span>
                ))}
              </CardContent>
            </Card>
          </div>
          {pipeline && (
            <PipelineFlow
              stages={pipeline}
              title={`${project.name} pipeline`}
            />
          )}
        </TabsContent>

        <TabsContent value="deployments" className="space-y-4">
          <DeploymentTimeline deployments={projectDeployments ?? []} />
        </TabsContent>

        <TabsContent value="logs">
          {previewLogs && (
            <DeploymentLogsPreview
              logs={previewLogs}
              projectName={project.name}
            />
          )}
        </TabsContent>
      </Tabs>

      <a
        href={
          project.repo.startsWith("http")
            ? project.repo
            : `https://${project.repo}`
        }
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
      >
        Open repository
        <ExternalLink className="size-3" />
      </a>
    </DashboardLayout>
  );
}
