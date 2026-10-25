# StackForge Development Roadmap 🗺️

## Phase 1 — Foundation ✅ COMPLETE
- [x] Initial project scaffolding & monorepo layout
- [x] Docker Compose environment setup
- [x] PostgreSQL 16 & Redis 7 configuration
- [x] FastAPI base application & Alembic migration schema

## Phase 2 — Authentication ✅ COMPLETE
- [x] User model with bcrypt password hashing
- [x] JWT token generation and validation middleware
- [x] Next.js authentication screens (Login / Signup)
- [x] Zustand auth store with localStorage persistence
- [x] Route guard protection for all `/dashboard/*` paths

## Phase 3 — Platform Features & Observability ✅ COMPLETE
- [x] **Dashboard API Integration:** Real-time KPIs, activity streams, and dynamic charts
- [x] **Project Management:** Full CRUD operations, project health scores, and tech stack tags
- [x] **Deployment Pipelines:** 6-stage delivery runner (`Source → Build → Test → Security Scan → Deploy → Verify`) with Celery async dispatch and resilient background fallback
- [x] **Real-Time Log Streaming:** WebSocket streaming console (`/ws/logs/{id}?token=...`) with JWT authentication and polling fallback
- [x] **Infrastructure Health Monitor (Simulated):** Demonstrates server status cards, 24h CPU/RAM/Disk metrics, and 30-day uptime SLA for portfolio presentation
- [x] **Prometheus Telemetry:** Live FastAPI `/metrics` scrape target every 15s collecting HTTP request rate, 5xx error ratios, and latency histograms
- [x] **Grafana Analytics:** Auto-provisioned Grafana dashboards (`http://localhost:3001`) with Prometheus default datasource
- [x] **Grafana Loki Logging (Optional Profile):** Log collection via Grafana Alloy with dynamic Docker Compose service labeling (`--profile logging`)

## Phase 4 — Cloud & DevOps Infrastructure 🚀 IMPLEMENTED & HARDENED
- [x] **Automated Quality Gates:** ESLint zero-error compliance and TypeScript strict compilation in frontend
- [x] **Automated Test Suite:** Unit and integration tests for Auth, Projects CRUD, and Infrastructure endpoints with in-memory SQLite fixture
- [x] **CI Pipeline & Quality Checks:** GitHub Actions pipeline running lint, type checks, backend tests, and multi-service image builds
- [x] **Safe GHCR Image Publishing:** Immutable commit-SHA tagging with protected release policy (pushes `:latest` only on trusted `main` branch pushes; never from untrusted PRs)
- [x] **Kubernetes Manifests:** Namespace isolation (`k8s/namespace.yaml`), Secrets abstraction (`k8s/secret.yaml`), Deployments, Services, readiness/liveness probes, and resource requests/limits across all microservices
- [x] **Repository Hygiene:** Eliminated orphaned lockfiles, legacy compose files, and conflicting dev Dockerfiles

## Phase 5 — Optional Extensions & Future Milestones ⏳ PLANNED
- [ ] **Terraform Cloud Provisioning:** Optional IaC module for AWS EKS / RDS / VPC (preserved in `terraform/` as standalone extension)
- [ ] **Argo CD GitOps:** Continuous declarative reconciliation of `k8s/` manifests
- [ ] **Public Demo Deployment:** Cloud-hosted live portfolio demonstration using managed PostgreSQL (Neon/Supabase) and container runtime (Railway/Render)
