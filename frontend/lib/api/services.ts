/**
 * StackForge API services — all calls hit the FastAPI backend.
 */
import { api, apiClient } from "@/lib/api-client";
import type {
  Activity,
  AuthUser,
  Deployment,
  DeploymentCreateInput,
  KPIStats,
  LogEntry,
  PipelineStage,
  Project,
  ProjectCreateInput,
  Server,
  TimeSeriesPoint,
  UserProfile,
} from "@/lib/types/models";

interface InfraStatusPayload {
  servers: Server[];
  total_servers: number;
  healthy: number;
}

interface InfraMetricsPayload {
  cpu: TimeSeriesPoint[];
  memory: TimeSeriesPoint[];
  disk: TimeSeriesPoint[];
}

interface TokenResponse {
  access_token: string;
  token_type: string;
}

function mapAuthUser(u: AuthUser): UserProfile {
  const initials = (u.full_name ?? u.email)
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return {
    id: u.id,
    name: u.full_name ?? u.email.split("@")[0],
    email: u.email,
    role: "Owner",
    avatar: initials,
    timezone: "Europe/Luxembourg",
    company: "StackForge EU",
    jobTitle: "Platform Engineer",
    bio: "",
  };
}

export const authService = {
  register: (body: { email: string; password: string; full_name?: string }) =>
    apiClient<TokenResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  login: (body: { email: string; password: string }) =>
    apiClient<TokenResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
      auth: false,
    }),

  me: async (): Promise<UserProfile> => {
    const res = await api.get<AuthUser>("/auth/me");
    return mapAuthUser(res.data);
  },
};

export const dashboardService = {
  getKpis: () => api.get<KPIStats>("/dashboard/kpis"),
  getActivities: (limit = 10) =>
    api.get<Activity[]>(`/dashboard/activities?limit=${limit}`),
  getCpuSeries: () => api.get<TimeSeriesPoint[]>("/dashboard/metrics/cpu"),
  getDeploymentSuccessSeries: () =>
    api.get<TimeSeriesPoint[]>("/dashboard/metrics/deployment-success"),
};

export const projectsService = {
  getAll: () => api.get<Project[]>("/projects"),
  getById: (id: string) => api.get<Project>(`/projects/${id}`),
  create: (body: ProjectCreateInput) => api.post<Project>("/projects", body),
  delete: (id: string) => api.delete<{ message: string }>(`/projects/${id}`),
};

export const deploymentsService = {
  getAll: () => api.get<Deployment[]>("/deployments"),
  getById: (id: string) => api.get<Deployment>(`/deployments/${id}`),
  getPipeline: () => api.get<PipelineStage[]>("/deployments/pipeline"),
  trigger: (body: DeploymentCreateInput) =>
    api.post<Deployment>("/deployments", body),
  getByProject: async (_projectId: string, projectName: string) => {
    const res = await api.get<Deployment[]>("/deployments");
    return {
      data: res.data.filter((d) => d.projectName === projectName),
    };
  },
  getRecentLogs: () => api.get<LogEntry[]>("/logs/recent"),
};

export const logsService = {
  getForDeployment: (deploymentId: string) =>
    api.get<LogEntry[]>(`/logs/deployment/${deploymentId}`),
  getRecent: (limit = 50) => api.get<LogEntry[]>(`/logs/recent?limit=${limit}`),
  getServices: async (): Promise<string[]> => {
    const res = await api.get<LogEntry[]>("/logs/recent?limit=100");
    const names = new Set(res.data.map((l) => l.service));
    return ["all", ...Array.from(names).sort()];
  },
};

export const infrastructureService = {
  getServers: async () => {
    const res = await api.get<InfraStatusPayload>("/infra/status");
    return { data: res.data.servers };
  },
  getStatus: async () => {
    const res = await api.get<InfraStatusPayload>("/infra/status");
    return { data: res.data.servers };
  },
  getMetrics: () => api.get<InfraMetricsPayload>("/infra/metrics"),
  getMemorySeries: async () => {
    const res = await api.get<InfraMetricsPayload>("/infra/metrics");
    return { data: res.data.memory };
  },
  getDiskSeries: async () => {
    const res = await api.get<InfraMetricsPayload>("/infra/metrics");
    return { data: res.data.disk };
  },
  getCpuSeries: async () => {
    const res = await api.get<InfraMetricsPayload>("/infra/metrics");
    return { data: res.data.cpu };
  },
};

export type { Project };
