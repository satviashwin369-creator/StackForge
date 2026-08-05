export type {
  KPIStats,
  Project,
  Deployment,
  PipelineStage,
  LogEntry,
  Server,
  Activity,
  TimeSeriesPoint,
  UserProfile,
  AuthUser,
  ProjectCreateInput,
  DeploymentCreateInput,
} from "@/lib/types/models";

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
}
