// ============================================================
// StackForge — Mock Data Layer
// All TypeScript interfaces + realistic mock data for the UI
// ============================================================

// ── Interfaces ──────────────────────────────────────────────

export interface KPIStats {
  activeDeployments: number;
  uptimePercent: number;
  failedBuilds: number;
  runningServices: number;
  activeDeploymentsTrend: number;
  uptimeTrend: number;
  failedBuildsTrend: number;
  runningServicesTrend: number;
  /** @deprecated use activeDeployments — kept for API compat */
  totalDeployments?: number;
  failureRate?: number;
  activeProjects?: number;
  totalDeploymentsTrend?: number;
  failureRateTrend?: number;
  activeProjectsTrend?: number;
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
  status: "success" | "failed" | "building" | "queued" | "cancelled";
  commit: string;
  commitMessage: string;
  branch: string;
  duration: string;
  timestamp: string;
  author: string;
  environment: "production" | "staging" | "development";
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
  avatar?: string;
}

export interface TimeSeriesPoint {
  time: string;
  value: number;
  value2?: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "developer" | "viewer";
  avatar: string;
  lastActive: string;
}

// ── KPI Data ────────────────────────────────────────────────

export const kpiStats: KPIStats = {
  activeDeployments: 47,
  uptimePercent: 99.97,
  failedBuilds: 3,
  runningServices: 18,
  activeDeploymentsTrend: 8.2,
  uptimeTrend: 0.02,
  failedBuildsTrend: -12,
  runningServicesTrend: 2,
};

// ── Projects ────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: "proj-001",
    name: "payment-gateway",
    description: "Core payment processing microservice handling Stripe & PayPal integrations",
    status: "running",
    framework: "Node.js",
    lastDeployed: "2 min ago",
    healthScore: 98,
    repo: "github.com/stackforge/payment-gateway",
    branch: "main",
    techStack: ["Node.js", "Express", "PostgreSQL", "Redis"],
  },
  {
    id: "proj-002",
    name: "user-auth-service",
    description: "OAuth2/OIDC authentication service with MFA support",
    status: "running",
    framework: "Go",
    lastDeployed: "15 min ago",
    healthScore: 100,
    repo: "github.com/stackforge/auth-service",
    branch: "main",
    techStack: ["Go", "gRPC", "MongoDB", "JWT"],
  },
  {
    id: "proj-003",
    name: "dashboard-frontend",
    description: "Main customer-facing dashboard built with Next.js and TypeScript",
    status: "building",
    framework: "Next.js",
    lastDeployed: "Building...",
    healthScore: 94,
    repo: "github.com/stackforge/dashboard",
    branch: "feat/redesign",
    techStack: ["Next.js", "TypeScript", "Tailwind", "Zustand"],
  },
  {
    id: "proj-004",
    name: "notification-engine",
    description: "Real-time push notification system with email & SMS fallback",
    status: "failed",
    framework: "Python",
    lastDeployed: "1 hour ago",
    healthScore: 45,
    repo: "github.com/stackforge/notifications",
    branch: "main",
    techStack: ["Python", "FastAPI", "RabbitMQ", "Celery"],
  },
  {
    id: "proj-005",
    name: "data-pipeline",
    description: "ETL pipeline for analytics data processing and warehousing",
    status: "running",
    framework: "Python",
    lastDeployed: "3 hours ago",
    healthScore: 92,
    repo: "github.com/stackforge/data-pipeline",
    branch: "main",
    techStack: ["Python", "Apache Spark", "Airflow", "BigQuery"],
  },
  {
    id: "proj-006",
    name: "cdn-edge-worker",
    description: "Edge computing workers for content caching and dynamic routing",
    status: "idle",
    framework: "Rust",
    lastDeployed: "2 days ago",
    healthScore: 88,
    repo: "github.com/stackforge/edge-workers",
    branch: "main",
    techStack: ["Rust", "Wasm", "Cloudflare Workers"],
  },
  {
    id: "proj-007",
    name: "ml-inference-api",
    description: "ML model serving API for real-time fraud detection predictions",
    status: "running",
    framework: "Python",
    lastDeployed: "30 min ago",
    healthScore: 96,
    repo: "github.com/stackforge/ml-inference",
    branch: "main",
    techStack: ["Python", "FastAPI", "TensorFlow", "Docker"],
  },
  {
    id: "proj-008",
    name: "api-gateway",
    description: "Central API gateway with rate limiting, auth, and request routing",
    status: "running",
    framework: "Go",
    lastDeployed: "45 min ago",
    healthScore: 99,
    repo: "github.com/stackforge/api-gateway",
    branch: "main",
    techStack: ["Go", "Envoy", "Redis", "Prometheus"],
  },
];

// ── Deployments ─────────────────────────────────────────────

export const deployments: Deployment[] = [
  {
    id: "dep-001",
    projectName: "payment-gateway",
    status: "success",
    commit: "a3f8b2c",
    commitMessage: "fix: resolve race condition in payment reconciliation",
    branch: "main",
    duration: "2m 34s",
    timestamp: "2 min ago",
    author: "Sarah Chen",
    environment: "production",
  },
  {
    id: "dep-002",
    projectName: "dashboard-frontend",
    status: "building",
    commit: "e7d1f4a",
    commitMessage: "feat: add real-time metrics dashboard with WebSocket",
    branch: "feat/redesign",
    duration: "1m 12s",
    timestamp: "5 min ago",
    author: "Alex Müller",
    environment: "staging",
  },
  {
    id: "dep-003",
    projectName: "notification-engine",
    status: "failed",
    commit: "b2c9e1d",
    commitMessage: "refactor: migrate to async message queue handler",
    branch: "main",
    duration: "3m 45s",
    timestamp: "1 hour ago",
    author: "James Park",
    environment: "production",
  },
  {
    id: "dep-004",
    projectName: "user-auth-service",
    status: "success",
    commit: "f5a2d8e",
    commitMessage: "feat: implement TOTP-based two-factor authentication",
    branch: "main",
    duration: "1m 58s",
    timestamp: "2 hours ago",
    author: "Maria García",
    environment: "production",
  },
  {
    id: "dep-005",
    projectName: "data-pipeline",
    status: "success",
    commit: "c8b3a7f",
    commitMessage: "perf: optimize Spark job partitioning for 3x throughput",
    branch: "main",
    duration: "4m 12s",
    timestamp: "3 hours ago",
    author: "David Kim",
    environment: "production",
  },
  {
    id: "dep-006",
    projectName: "api-gateway",
    status: "success",
    commit: "d4e6f9a",
    commitMessage: "feat: add circuit breaker pattern for downstream services",
    branch: "main",
    duration: "1m 45s",
    timestamp: "5 hours ago",
    author: "Sarah Chen",
    environment: "production",
  },
  {
    id: "dep-007",
    projectName: "ml-inference-api",
    status: "success",
    commit: "g2h8i3j",
    commitMessage: "chore: update TensorFlow to v2.15 with XLA optimizations",
    branch: "main",
    duration: "5m 30s",
    timestamp: "6 hours ago",
    author: "Priya Sharma",
    environment: "staging",
  },
  {
    id: "dep-008",
    projectName: "payment-gateway",
    status: "cancelled",
    commit: "k5l1m7n",
    commitMessage: "test: add integration tests for webhook handlers",
    branch: "feat/webhooks",
    duration: "0m 45s",
    timestamp: "8 hours ago",
    author: "Alex Müller",
    environment: "development",
  },
];

// ── Pipeline Stages ─────────────────────────────────────────

export const pipelineStages: PipelineStage[] = [
  { name: "Source", status: "success", duration: "0m 05s", icon: "git-branch" },
  { name: "Build", status: "success", duration: "1m 23s", icon: "hammer" },
  { name: "Test", status: "success", duration: "0m 48s", icon: "flask-conical" },
  { name: "Security Scan", status: "success", duration: "0m 32s", icon: "shield-check" },
  { name: "Deploy", status: "running", duration: "0m 15s", icon: "rocket" },
  { name: "Verify", status: "pending", duration: "—", icon: "check-circle" },
];

// ── Log Entries ─────────────────────────────────────────────

export const logEntries: LogEntry[] = [
  { id: "log-001", timestamp: "2026-05-30T09:45:12.342Z", level: "info", message: "[payment-gateway] Server started on port 3000", service: "payment-gateway" },
  { id: "log-002", timestamp: "2026-05-30T09:45:13.102Z", level: "info", message: "[payment-gateway] Connected to PostgreSQL cluster (eu-west-1)", service: "payment-gateway" },
  { id: "log-003", timestamp: "2026-05-30T09:45:13.445Z", level: "info", message: "[payment-gateway] Redis cache connected (sentinel mode)", service: "payment-gateway" },
  { id: "log-004", timestamp: "2026-05-30T09:45:14.201Z", level: "debug", message: "[auth-service] JWT token validation middleware initialized", service: "auth-service" },
  { id: "log-005", timestamp: "2026-05-30T09:45:15.678Z", level: "info", message: "[api-gateway] Rate limiter configured: 1000 req/min per client", service: "api-gateway" },
  { id: "log-006", timestamp: "2026-05-30T09:45:18.901Z", level: "warn", message: "[notification-engine] Message queue consumer lag detected: 245 messages", service: "notification-engine" },
  { id: "log-007", timestamp: "2026-05-30T09:45:20.123Z", level: "error", message: "[notification-engine] Failed to connect to SMTP relay: Connection timeout after 30s", service: "notification-engine" },
  { id: "log-008", timestamp: "2026-05-30T09:45:21.456Z", level: "error", message: "[notification-engine] RabbitMQ channel closed unexpectedly — attempting reconnect (1/3)", service: "notification-engine" },
  { id: "log-009", timestamp: "2026-05-30T09:45:22.789Z", level: "info", message: "[data-pipeline] Spark job batch-2026-05-30-001 started with 48 partitions", service: "data-pipeline" },
  { id: "log-010", timestamp: "2026-05-30T09:45:25.012Z", level: "info", message: "[ml-inference] Model v3.2.1 loaded successfully (latency p99: 12ms)", service: "ml-inference" },
  { id: "log-011", timestamp: "2026-05-30T09:45:27.345Z", level: "debug", message: "[api-gateway] Circuit breaker status: payment-gateway=CLOSED, notifications=OPEN", service: "api-gateway" },
  { id: "log-012", timestamp: "2026-05-30T09:45:30.678Z", level: "warn", message: "[payment-gateway] Stripe webhook signature verification retry (attempt 2)", service: "payment-gateway" },
  { id: "log-013", timestamp: "2026-05-30T09:45:32.901Z", level: "info", message: "[auth-service] Session cleanup: removed 1,247 expired sessions", service: "auth-service" },
  { id: "log-014", timestamp: "2026-05-30T09:45:35.234Z", level: "error", message: "[notification-engine] Dead letter queue threshold exceeded: 500 messages", service: "notification-engine" },
  { id: "log-015", timestamp: "2026-05-30T09:45:38.567Z", level: "info", message: "[data-pipeline] Batch processing complete: 2.4M records in 127s", service: "data-pipeline" },
  { id: "log-016", timestamp: "2026-05-30T09:45:40.890Z", level: "info", message: "[cdn-edge] Cache hit ratio: 94.7% (last 5 min window)", service: "cdn-edge" },
  { id: "log-017", timestamp: "2026-05-30T09:45:43.123Z", level: "debug", message: "[ml-inference] Prediction batch processed: 128 items, avg latency 8ms", service: "ml-inference" },
  { id: "log-018", timestamp: "2026-05-30T09:45:45.456Z", level: "warn", message: "[api-gateway] Upstream response time degradation: auth-service p95 > 200ms", service: "api-gateway" },
  { id: "log-019", timestamp: "2026-05-30T09:45:48.789Z", level: "info", message: "[payment-gateway] Reconciliation job completed: 0 discrepancies found", service: "payment-gateway" },
  { id: "log-020", timestamp: "2026-05-30T09:45:50.012Z", level: "info", message: "[auth-service] OAuth2 provider sync completed (Google, GitHub, Azure AD)", service: "auth-service" },
];

// ── Servers ─────────────────────────────────────────────────

export const servers: Server[] = [
  {
    id: "srv-001",
    name: "prod-api-01",
    region: "eu-west-1 (Ireland)",
    status: "healthy",
    cpu: 42,
    ram: 67,
    disk: 54,
    uptime: "45d 12h 34m",
    uptimePercent: 99.99,
    ip: "10.0.1.101",
    os: "Ubuntu 24.04 LTS",
  },
  {
    id: "srv-002",
    name: "prod-api-02",
    region: "eu-west-1 (Ireland)",
    status: "healthy",
    cpu: 38,
    ram: 71,
    disk: 48,
    uptime: "45d 12h 34m",
    uptimePercent: 99.99,
    ip: "10.0.1.102",
    os: "Ubuntu 24.04 LTS",
  },
  {
    id: "srv-003",
    name: "prod-db-primary",
    region: "eu-central-1 (Frankfurt)",
    status: "healthy",
    cpu: 61,
    ram: 82,
    disk: 72,
    uptime: "90d 4h 12m",
    uptimePercent: 99.999,
    ip: "10.0.2.50",
    os: "Debian 12",
  },
  {
    id: "srv-004",
    name: "prod-worker-01",
    region: "eu-west-1 (Ireland)",
    status: "warning",
    cpu: 87,
    ram: 91,
    disk: 65,
    uptime: "12d 8h 55m",
    uptimePercent: 99.95,
    ip: "10.0.3.201",
    os: "Ubuntu 24.04 LTS",
  },
  {
    id: "srv-005",
    name: "staging-api-01",
    region: "eu-west-2 (London)",
    status: "healthy",
    cpu: 15,
    ram: 34,
    disk: 28,
    uptime: "30d 2h 45m",
    uptimePercent: 99.9,
    ip: "10.1.1.101",
    os: "Ubuntu 24.04 LTS",
  },
  {
    id: "srv-006",
    name: "prod-cache-01",
    region: "eu-central-1 (Frankfurt)",
    status: "critical",
    cpu: 95,
    ram: 96,
    disk: 88,
    uptime: "2d 1h 15m",
    uptimePercent: 98.5,
    ip: "10.0.4.50",
    os: "Alpine 3.19",
  },
];

// ── Activity Feed ───────────────────────────────────────────

export const activities: Activity[] = [
  { id: "act-001", type: "deployment", message: "payment-gateway deployed to production", timestamp: "2 min ago", user: "Sarah Chen" },
  { id: "act-002", type: "alert", message: "High CPU alert triggered on prod-cache-01 (95%)", timestamp: "8 min ago", user: "System" },
  { id: "act-003", type: "deployment", message: "dashboard-frontend build started (staging)", timestamp: "12 min ago", user: "Alex Müller" },
  { id: "act-004", type: "config", message: "Rate limiter threshold updated: 1000 → 1500 req/min", timestamp: "25 min ago", user: "Maria García" },
  { id: "act-005", type: "deployment", message: "notification-engine deployment failed", timestamp: "1 hour ago", user: "James Park" },
  { id: "act-006", type: "user", message: "New team member added: Priya Sharma (Developer)", timestamp: "2 hours ago", user: "Admin" },
  { id: "act-007", type: "system", message: "Scheduled backup completed successfully (2.4 TB)", timestamp: "3 hours ago", user: "System" },
  { id: "act-008", type: "deployment", message: "data-pipeline deployed with 3x throughput optimization", timestamp: "3 hours ago", user: "David Kim" },
  { id: "act-009", type: "alert", message: "SSL certificate renewal: api.stackforge.io (expires in 14 days)", timestamp: "5 hours ago", user: "System" },
  { id: "act-010", type: "config", message: "Kubernetes cluster autoscaler updated: max nodes 12 → 16", timestamp: "6 hours ago", user: "Sarah Chen" },
];

// ── Time Series Data (Charts) ───────────────────────────────

export const cpuTimeSeriesData: TimeSeriesPoint[] = [
  { time: "00:00", value: 32, value2: 45 },
  { time: "02:00", value: 28, value2: 40 },
  { time: "04:00", value: 25, value2: 38 },
  { time: "06:00", value: 35, value2: 48 },
  { time: "08:00", value: 52, value2: 62 },
  { time: "10:00", value: 68, value2: 72 },
  { time: "12:00", value: 75, value2: 78 },
  { time: "14:00", value: 72, value2: 76 },
  { time: "16:00", value: 65, value2: 70 },
  { time: "18:00", value: 58, value2: 65 },
  { time: "20:00", value: 45, value2: 55 },
  { time: "22:00", value: 38, value2: 48 },
];

export const deploymentSuccessData: TimeSeriesPoint[] = [
  { time: "Mon", value: 12, value2: 1 },
  { time: "Tue", value: 18, value2: 2 },
  { time: "Wed", value: 15, value2: 0 },
  { time: "Thu", value: 22, value2: 1 },
  { time: "Fri", value: 28, value2: 3 },
  { time: "Sat", value: 8, value2: 0 },
  { time: "Sun", value: 5, value2: 0 },
];

export const memoryTimeSeriesData: TimeSeriesPoint[] = [
  { time: "00:00", value: 58 },
  { time: "02:00", value: 55 },
  { time: "04:00", value: 52 },
  { time: "06:00", value: 60 },
  { time: "08:00", value: 68 },
  { time: "10:00", value: 74 },
  { time: "12:00", value: 78 },
  { time: "14:00", value: 76 },
  { time: "16:00", value: 72 },
  { time: "18:00", value: 65 },
  { time: "20:00", value: 60 },
  { time: "22:00", value: 56 },
];

export const diskTimeSeriesData: TimeSeriesPoint[] = [
  { time: "00:00", value: 48 },
  { time: "02:00", value: 49 },
  { time: "04:00", value: 50 },
  { time: "06:00", value: 52 },
  { time: "08:00", value: 58 },
  { time: "10:00", value: 62 },
  { time: "12:00", value: 65 },
  { time: "14:00", value: 68 },
  { time: "16:00", value: 70 },
  { time: "18:00", value: 72 },
  { time: "20:00", value: 74 },
  { time: "22:00", value: 76 },
];

// ── Current user profile ────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  timezone: string;
  company: string;
  jobTitle: string;
  bio: string;
}

export const currentUser: UserProfile = {
  id: "usr-001",
  name: "Sarah Chen",
  email: "sarah.chen@stackforge.io",
  role: "Owner",
  avatar: "SC",
  timezone: "Europe/Luxembourg",
  company: "StackForge EU",
  jobTitle: "Head of Platform Engineering",
  bio: "Leading cloud-native platform initiatives across EU regions.",
};

// ── Team Members ────────────────────────────────────────────

export const teamMembers: TeamMember[] = [
  { id: "usr-001", name: "Sarah Chen", email: "sarah.chen@stackforge.io", role: "owner", avatar: "SC", lastActive: "Just now" },
  { id: "usr-002", name: "Alex Müller", email: "alex.muller@stackforge.io", role: "admin", avatar: "AM", lastActive: "5 min ago" },
  { id: "usr-003", name: "Maria García", email: "maria.garcia@stackforge.io", role: "admin", avatar: "MG", lastActive: "1 hour ago" },
  { id: "usr-004", name: "James Park", email: "james.park@stackforge.io", role: "developer", avatar: "JP", lastActive: "2 hours ago" },
  { id: "usr-005", name: "David Kim", email: "david.kim@stackforge.io", role: "developer", avatar: "DK", lastActive: "3 hours ago" },
  { id: "usr-006", name: "Priya Sharma", email: "priya.sharma@stackforge.io", role: "developer", avatar: "PS", lastActive: "Today" },
];

// ── Services List (for log filters) ─────────────────────────

export const services = [
  "all",
  "payment-gateway",
  "auth-service",
  "api-gateway",
  "notification-engine",
  "data-pipeline",
  "ml-inference",
  "cdn-edge",
] as const;

// ── Data accessors (API-ready) ──────────────────────────────

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));

export async function fetchKpiStats(): Promise<KPIStats> {
  await delay();
  return kpiStats;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  await delay();
  return getProjectById(id) ?? null;
}

export function getDeploymentsForProject(projectName: string): Deployment[] {
  return deployments.filter((d) => d.projectName === projectName);
}

export function getLogsForService(serviceSlug: string): LogEntry[] {
  if (serviceSlug === "all") return logEntries;
  return logEntries.filter((l) => l.service === serviceSlug);
}

export function getRecentDeploymentLogs(limit = 12): LogEntry[] {
  return logEntries.slice(0, limit);
}
