"use client";

import { useState } from "react";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deploymentsService } from "@/lib/api/services";
import type { Project } from "@/lib/types/models";

interface DeployProjectButtonProps {
  project: Project;
  onDeployed?: () => void;
}

export function DeployProjectButton({
  project,
  onDeployed,
}: DeployProjectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeploy() {
    setLoading(true);
    setError(null);
    try {
      await deploymentsService.trigger({
        project_id: project.id,
        branch: project.branch,
        commit_message: `Deploy ${project.name}`,
        environment: "production",
      });
      onDeployed?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deploy failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button size="sm" onClick={() => void handleDeploy()} disabled={loading}>
        <Rocket className="size-4" />
        {loading ? "Deploying…" : "Deploy now"}
      </Button>
      {error && (
        <p className="max-w-xs text-right text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
