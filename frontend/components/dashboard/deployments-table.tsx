"use client";

import type { Deployment } from "@/lib/types/models";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";

const columns: DataTableColumn<Deployment>[] = [
  {
    key: "project",
    header: "Project",
    cell: (dep) => <span className="font-medium">{dep.projectName}</span>,
  },
  {
    key: "status",
    header: "Status",
    cell: (dep) => <StatusBadge status={dep.status} />,
  },
  {
    key: "commit",
    header: "Commit",
    cell: (dep) => <span className="font-mono text-xs">{dep.commit}</span>,
  },
  {
    key: "branch",
    header: "Branch",
    hideOn: "md",
    cell: (dep) => (
      <span className="font-mono text-xs text-muted-foreground">{dep.branch}</span>
    ),
  },
  {
    key: "env",
    header: "Env",
    hideOn: "lg",
    cell: (dep) => (
      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase">
        {dep.environment}
      </span>
    ),
  },
  {
    key: "duration",
    header: "Duration",
    cell: (dep) => (
      <span className="font-mono text-xs text-muted-foreground">{dep.duration}</span>
    ),
  },
  {
    key: "author",
    header: "Author",
    hideOn: "sm",
    cell: (dep) => <span className="text-muted-foreground">{dep.author}</span>,
  },
];

interface DeploymentsTableProps {
  deployments: Deployment[];
  title?: string;
}

export function DeploymentsTable({
  deployments,
  title = "Recent deployments",
}: DeploymentsTableProps) {
  return (
    <DataTable
      data={deployments}
      columns={columns}
      title={title}
      getRowKey={(dep) => dep.id}
    />
  );
}
