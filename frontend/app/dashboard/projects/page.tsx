"use client";

import { useMemo, useState } from "react";
import { FolderKanban, Search } from "lucide-react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ProjectCard } from "@/components/dashboard/project-card";
import { CreateProjectModal } from "@/components/dashboard/create-project-modal";
import { EmptyState } from "@/components/dashboard/empty-state";
import { ProjectGridSkeleton } from "@/components/dashboard/dashboard-skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAsyncData } from "@/hooks/use-async-data";
import { projectsService } from "@/lib/api/services";
import { ErrorState } from "@/components/dashboard/error-state";

import type { Project } from "@/lib/types/models";

export default function ProjectsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Project["status"] | "all">("all");

  const {
    data: projects,
    loading,
    error,
    refetch,
  } = useAsyncData(
    () => projectsService.getAll().then((r) => r.data),
    []
  );

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      const matchesQuery =
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = filter === "all" || p.status === filter;
      return matchesQuery && matchesStatus;
    });
  }, [projects, query, filter]);

  const statuses: (Project["status"] | "all")[] = [
    "all",
    "running",
    "building",
    "failed",
    "idle",
  ];

  return (
    <DashboardLayout
      title="Projects"
      description={
        projects
          ? `${projects.length} services across production and staging`
          : "Manage your services"
      }
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {statuses.map((s) => (
              <Button
                key={s}
                variant={filter === s ? "default" : "outline"}
                size="xs"
                onClick={() => setFilter(s)}
                className="capitalize"
              >
                {s === "building" ? "deploying" : s}
              </Button>
            ))}
          </div>
          <CreateProjectModal onCreated={refetch} />
        </div>
      </div>

      {!projects && loading && <ProjectGridSkeleton />}

      {error ? (
        <ErrorState
          title="Unable to load projects"
          message={error}
          onRetry={refetch}
        />
      ) : projects && filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Adjust your filters or create a new project to get started."
          actionLabel="Clear filters"
          onAction={() => {
            setQuery("");
            setFilter("all");
          }}
        />
      ) : null}

      {projects && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={i}
              onDeleted={refetch}
            />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
