"use client";



import { motion } from "framer-motion";

import { ExternalLink, GitBranch, MoreHorizontal, Trash2 } from "lucide-react";

import Link from "next/link";

import { useState } from "react";

import type { Project } from "@/lib/types/models";

import { projectsService } from "@/lib/api/services";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { buttonVariants } from "@/components/ui/button";

import {

  DropdownMenu,

  DropdownMenuContent,

  DropdownMenuGroup,

  DropdownMenuItem,

  DropdownMenuSeparator,

  DropdownMenuTrigger,

} from "@/components/ui/dropdown-menu";

import { StatusBadge } from "@/components/dashboard/status-badge";

import { cn } from "@/lib/utils";



function badgeStatus(

  status: Project["status"]

): "running" | "failed" | "deploying" | "idle" {

  if (status === "building") return "deploying";

  return status;

}



interface ProjectCardProps {

  project: Project;

  index?: number;

  onDeleted?: () => void;

}



export function ProjectCard({

  project,

  index = 0,

  onDeleted,

}: ProjectCardProps) {

  const detailHref = `/dashboard/projects/${project.id}`;

  const [deleting, setDeleting] = useState(false);



  async function handleDelete() {

    if (!confirm(`Delete project "${project.name}"?`)) return;

    setDeleting(true);

    try {

      await projectsService.delete(project.id);

      onDeleted?.();

    } finally {

      setDeleting(false);

    }

  }



  return (

    <motion.div

      initial={{ opacity: 0, y: 16 }}

      animate={{ opacity: 1, y: 0 }}

      transition={{ duration: 0.35, delay: index * 0.05 }}

    >

      <Card className="group border-border/60 bg-card/80 transition-all hover:border-primary/30 hover:shadow-[0_0_24px_-8px] hover:shadow-primary/10">

        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-0">

          <Link href={detailHref} className="min-w-0 flex-1">

            <div className="flex items-center gap-2">

              <h3 className="truncate font-semibold transition-colors group-hover:text-primary">

                {project.name}

              </h3>

              <StatusBadge status={badgeStatus(project.status)} />

            </div>

            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">

              {project.description}

            </p>

          </Link>

          <DropdownMenu>

            <DropdownMenuTrigger

              className={cn(

                buttonVariants({ variant: "ghost", size: "icon-sm" }),

                "opacity-0 transition-opacity group-hover:opacity-100"

              )}

              aria-label="Project actions"

            >

              <MoreHorizontal className="size-4" />

            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">

              <DropdownMenuGroup>

                <DropdownMenuItem render={<Link href={detailHref} />}>

                  View details

                </DropdownMenuItem>

                <DropdownMenuItem

                  render={<Link href="/dashboard/deployments" />}

                >

                  View deployments

                </DropdownMenuItem>

                <DropdownMenuItem render={<Link href="/dashboard/logs" />}>

                  View logs

                </DropdownMenuItem>

              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem

                variant="destructive"

                disabled={deleting}

                onClick={() => void handleDelete()}

              >

                <Trash2 className="size-4" />

                {deleting ? "Deleting…" : "Delete project"}

              </DropdownMenuItem>

            </DropdownMenuContent>

          </DropdownMenu>

        </CardHeader>

        <CardContent className="space-y-4 pt-4">

          <div className="flex flex-wrap gap-1.5">

            {project.techStack.slice(0, 4).map((tech) => (

              <span

                key={tech}

                className="rounded-md bg-muted/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"

              >

                {tech}

              </span>

            ))}

          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">

            <span className="flex items-center gap-1 truncate font-mono">

              <GitBranch className="size-3 shrink-0" />

              {project.branch}

            </span>

            <span>{project.lastDeployed}</span>

          </div>

          <div className="space-y-1.5">

            <div className="flex justify-between text-xs">

              <span className="text-muted-foreground">Health score</span>

              <span

                className={cn(

                  "font-medium tabular-nums",

                  project.healthScore >= 90

                    ? "text-emerald-400"

                    : project.healthScore >= 70

                      ? "text-amber-400"

                      : "text-red-400"

                )}

              >

                {project.healthScore}%

              </span>

            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted">

              <motion.div

                initial={{ width: 0 }}

                animate={{ width: `${project.healthScore}%` }}

                transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}

                className={cn(

                  "h-full rounded-full",

                  project.healthScore >= 90

                    ? "bg-emerald-500"

                    : project.healthScore >= 70

                      ? "bg-amber-500"

                      : "bg-red-500"

                )}

              />

            </div>

          </div>

          <Link

            href={detailHref}

            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"

          >

            Open project

            <ExternalLink className="size-3" />

          </Link>

        </CardContent>

      </Card>

    </motion.div>

  );

}


