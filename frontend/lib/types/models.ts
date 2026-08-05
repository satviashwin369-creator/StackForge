/** Domain models shared across UI and API layer */

export interface KPIStats {
  activeDeployments: number;
  uptimePercent: number;
  failedBuilds: number;
  runningServices: number;
  activeDeploymentsTrend: number;
  uptimeTrend: number;
  failedBuildsTrend: number;
  runningServicesTrend: number;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: "running" | "failed" | "building" | "idle";
  framework: string;
  lastDeployed: string;
  healthScore: number;
  repo: string;
  branch: string;
  techStack: string[];
}

export interface Deployment {
  id: string;
  projectName: string;
  status:
    | "success"
    | "failed"
    | "building"
    | "deploying"
    | "queued"
    | "cancelled";
  commit: string;
  commitMessage: string;
  branch: string;
  duration: string;
  timestamp: string;
  author: string;
  environment: "production" | "staging" | "development";
  project_id?: string;
}

export interface PipelineStage {
  name: string;
  status: "success" | "failed" | "running" | "pending" | "skipped";
  duration: string;
  icon: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "error" | "warn" | "info" | "debug";
  message: string;
  service: string;
}

export interface Server {
  id: string;
  name: string;
  region: string;
  status: "healthy" | "warning" | "critical" | "offline";
  cpu: number;
  ram: number;
  disk: number;
  uptime: string;
  uptimePercent: number;
  ip: string;
  os: string;
}

export interface Activity {
  id: string;
  type: "deployment" | "alert" | "config" | "user" | "system";
  message: string;
  timestamp: string;
  user: string;
}

export interface TimeSeriesPoint {
  time: string;
  value: number;
  value2?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  timezone?: string;
  company?: string;
  jobTitle?: string;
  bio?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  framework?: string;
  repo?: string;
  branch?: string;
  status?: string;
}

export interface DeploymentCreateInput {
  project_id: string;
  commit?: string;
  commit_message?: string;
  branch?: string;
  environment?: string;
}
