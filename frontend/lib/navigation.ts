import {
  LayoutDashboard,
  FolderKanban,
  Rocket,
  Terminal,
  Server,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const dashboardNav: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { title: "Deployments", href: "/dashboard/deployments", icon: Rocket, badge: "3" },
  { title: "Logs", href: "/dashboard/logs", icon: Terminal },
  { title: "Infrastructure", href: "/dashboard/infrastructure", icon: Server },
  { title: "Settings", href: "/dashboard/settings", icon: Settings },
];
