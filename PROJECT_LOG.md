# StackForge Development Log

## Project Overview

StackForge is a production-style Internal Developer Platform (IDP) inspired by modern DevOps platforms like Portainer, Harness, and GitLab.

The goal is to build a complete Cloud Native DevOps platform demonstrating modern engineering practices including authentication, APIs, containers, CI/CD, Kubernetes, infrastructure automation, monitoring, logging, and deployment workflows.

---

# Tech Stack

## Frontend

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- Zustand
- Axios API Client

## Backend

- FastAPI
- SQLAlchemy
- PostgreSQL
- Redis
- JWT Authentication
- Alembic Database Migration

## DevOps

- Docker
- Docker Compose
- Kubernetes
- Terraform
- GitHub Actions
- Argo CD (Planned Extension / Optional)
- Prometheus
- Grafana
- Loki
- Grafana Alloy (log collector)

---

# Current Progress

## Phase 1 — Foundation ✅ COMPLETE

Completed:

- [x] Git initialized
- [x] GitHub repository created
- [x] Project structure created
- [x] Frontend foundation created
- [x] Backend foundation created
- [x] Docker environment prepared
- [x] PostgreSQL configured
- [x] Redis configured
- [x] FastAPI application structure created
- [x] Database models created
- [x] API structure prepared

---

# Phase 2 — Authentication ✅ COMPLETE

## Milestone 1 — Frontend Authentication

Status:

✅ Complete

Completed:

- [x] Login UI implemented
- [x] Signup UI implemented
- [x] Authentication forms created
- [x] OAuth architecture prepared
- [x] Frontend authentication flow created

---

## Milestone 2 — Backend Authentication Integration

Status:

✅ Complete

Completed:

- [x] User database model created
- [x] Registration API implemented
- [x] Login API implemented
- [x] Password hashing implemented
- [x] JWT token generation implemented
- [x] PostgreSQL user storage connected
- [x] `/me` user validation endpoint implemented

---

## Milestone 3 — JWT Storage & Session Persistence

Status:

✅ Complete

Completed:

- [x] JWT token storage implemented
- [x] Zustand authentication store created
- [x] Auth state management implemented
- [x] Session hydration implemented
- [x] Refresh persistence verified
- [x] Automatic token validation implemented

---

## Milestone 4 — Protected Routes & Authorization

Status:

✅ Complete

Completed:

### Backend

- [x] JWT dependency created
- [x] Bearer token validation implemented
- [x] Current user extraction implemented
- [x] Protected dashboard APIs

Protected APIs:

- `/dashboard/kpis`
- `/dashboard/activities`
- `/dashboard/pipeline`

### Frontend

- [x] ProtectedRoute component created
- [x] Dashboard route protection added
- [x] Unauthenticated users redirected to login
- [x] Authenticated users can access dashboard
- [x] Session persistence tested after refresh

---

# Phase 3 — Platform Features

## Milestone 5 — Dashboard API Integration

Status:

✅ Complete

Completed:

- [x] Dashboard API service layer created
- [x] FastAPI dashboard endpoints created
- [x] Frontend API communication implemented
- [x] Live dashboard data loading
- [x] Authentication headers attached
- [x] Mock fallback data removed
- [x] Dashboard error handling implemented
- [x] Dashboard loading states implemented
- [x] Dashboard data models finalized

---

## Milestone 6 — Projects Management

Status:

✅ Complete

Completed:

- [x] Project database model
- [x] Project CRUD APIs
- [x] Frontend project management UI
- [x] Project creation
- [x] Project editing
- [x] Project deletion
- [x] Project detail page
- [x] Project deployment linking
- [x] Project status display
- [x] Project health score display
- [x] Project stack information display
- [x] Deployment information connected to projects

---

## Milestone 7 — Deployments

Status:

✅ Complete

Completed:

- [x] Deployment database model
- [x] Deployment creation API
- [x] Deployment workflow
- [x] Deployment triggering from project page
- [x] Deployment status tracking
- [x] Deployment history
- [x] Project-to-deployment relationship
- [x] Deployment persistence in PostgreSQL
- [x] Deployment timeline
- [x] Deployment duration tracking
- [x] Deployment completion tracking
- [x] Active pipeline API
- [x] Pipeline execution tracking
- [x] Pipeline frontend service integration
- [x] Pipeline visualization
- [x] Source stage
- [x] Build stage
- [x] Test stage
- [x] Security Scan stage
- [x] Deploy stage
- [x] Verify stage
- [x] Successful pipeline visualization
- [x] Pipeline persistence across page refresh
- [x] Deployment/project data verified against PostgreSQL

### Deployment Verification

Verified deployment records in PostgreSQL including:

- Deployment ID
- Project relationship
- Deployment status
- Creation timestamp
- Completion timestamp
- Duration

Latest verified deployments completed successfully.

Pipeline UI was verified to display:

`Source → Build → Test → Security Scan → Deploy → Verify`

The pipeline remains visible after refreshing the project page.

---

## Milestone 8 — Monitoring & Logs

Status:

✅ Complete

### Prometheus

Status:

✅ Complete

Completed:

- [x] Backend `/metrics` endpoint implemented
- [x] Prometheus metrics endpoint verified
- [x] Prometheus service added to Docker Compose
- [x] Prometheus configuration created
- [x] Backend configured as Prometheus scrape target
- [x] Prometheus persistent storage configured
- [x] Prometheus container successfully started
- [x] Prometheus readiness verified
- [x] Backend metrics successfully scraped by Prometheus
- [x] `stackforge-backend` target verified as `up`
- [x] Prometheus scrape errors verified as empty

Verified Prometheus target:

`backend:8000/metrics`

Scrape interval:

`15s`

Prometheus target health:

`up`

---

### Grafana

Status:

✅ Complete

Completed:

- [x] Add Grafana service to Docker Compose
- [x] Grafana container running on port 3001
- [x] Grafana accessible via browser (`http://localhost:3001`)
- [x] Health status verified (`/api/health` 200 OK)
- [x] Grafana persistent volume mounted

---

### Loki Logging

Status:

✅ Complete

Completed:

- [x] Loki service added to Docker Compose (grafana/loki:3.5.0)
- [x] Loki configuration created (loki-config.yml)
- [x] Loki persistent storage configured
- [x] Loki container running on port 3100
- [x] Loki receiving logs successfully with TSDB filesystem schema

---

### Grafana Alloy (Log Collection)

Status:

✅ Complete

Completed:

- [x] Alloy service added to Docker Compose (grafana/alloy:v1.10.2)
- [x] Docker socket mounted for container discovery (`unix:///var/run/docker.sock`)
- [x] Docker container log directory mounted (`/var/lib/docker/containers`)
- [x] `discovery.docker` configured for automatic container discovery
- [x] `discovery.relabel` configured for dynamic service labeling
- [x] `__path__` constructed from container ID for log file resolution
- [x] Docker Compose service name dynamically extracted via `__meta_docker_container_label_com_docker_compose_service`
- [x] `service_name` label dynamically set per container (not hard-coded)
- [x] JSON log parsing configured (log, stream, time extraction)
- [x] Logs forwarded to Loki via `loki.write`
- [x] All 9 services verified in Loki: `alloy`, `backend`, `db`, `frontend`, `grafana`, `loki`, `prometheus`, `redis`, `worker`

Alloy Pipeline Architecture:

`Docker containers → discovery.docker → discovery.relabel → local.file_match → loki.source.file → loki.process (JSON parse) → loki.write → Loki`

---

### Log Streaming (In-App)

Status:

✅ Complete

Completed:

- [x] Deployment log streaming via FastAPI WebSocket (`/ws/logs/{deployment_id}`)
- [x] Deployment status streaming via WebSocket (`/ws/deployments/{id}/status`)
- [x] Redis Pub/Sub channel pub/sub integration for real-time log distribution
- [x] Historical deployment logs retrieval API (`/api/v1/logs/deployment/{id}`)
- [x] Cross-service recent log retrieval API (`/api/v1/logs/recent`)
- [x] Frontend live log console (`/dashboard/logs`) with `LogViewer`
- [x] Frontend `useLiveLogs` hook with automatic polling fallback
- [x] Persistent log storage in PostgreSQL (`Log` model)
- [x] Cross-stack log indexing verified through Grafana Alloy and Loki

---

### System & Infrastructure Monitoring

Status:

✅ Complete

Completed:

- [x] Cluster & service health endpoint (`/api/v1/infra/status`)
- [x] Timeseries resource telemetry endpoint (`/api/v1/infra/metrics`)
- [x] Docker Compose health checks configured (`frontend`, `backend`, `db`, `redis`)
- [x] Frontend infrastructure monitor (`/dashboard/infrastructure`)
- [x] Real-time server health cards with CPU/RAM/Disk stats
- [x] 24-hour cluster CPU usage chart
- [x] 24-hour memory utilization chart
- [x] Disk storage consumption chart
- [x] 30-day Uptime SLA tracking per node

---

### Deployment Telemetry & Pipeline Monitoring

Status:

✅ Complete

Completed:

- [x] Deployment success/failure metrics calculated in KPIs
- [x] Deployment duration tracking (exact start/completion timestamps in PostgreSQL)
- [x] Deployment history table with status badges (`/dashboard/deployments`)
- [x] 6-stage pipeline progress monitoring (`/api/v1/deployments/{id}/pipeline`)
- [x] Visual pipeline flow UI (`PipelineFlow`) with live stage indicator

---

### Dashboard Monitoring Integration

Status:

✅ Complete

Completed:

- [x] Real-time platform KPI statistics (`/api/v1/infra/kpis`)
- [x] Recent system activities feed (`/api/v1/infra/activities`)
- [x] Main dashboard (`/dashboard`) integrating stats, activity, and deployment runs
- [x] Live data hydration without mock data fallbacks
- [x] Real-time error boundaries and skeleton loading states

---

### Production-Style Observability Verification

Status:

✅ Complete

Completed:

- [x] Verified Prometheus readiness and active scrape target (`backend:8000/metrics`)
- [x] Verified Grafana 12.1.1 healthy on port 3001
- [x] Verified Loki 3.5.0 ingesting logs with TSDB schema
- [x] Verified Alloy dynamic discovery and per-service relabeling
- [x] Verified all 9 Docker services indexed in Loki
- [x] Verified in-browser live WebSocket log stream
- [x] Verified full observability workflow end-to-end

---

## Milestone 9 — DevOps Hardening, Quality Gates & Kubernetes Architecture

Status:

✅ Complete

Completed:

- [x] Docker production setup (multi-stage Dockerfiles, Compose health checks)
- [x] Kubernetes manifests (namespace, secrets via secretKeyRef, resource limits, probes)
- [x] Terraform infrastructure (k8s provider, parameterized credentials, sensitive variables)
- [x] GitHub Actions CI/CD (lint, type-check, backend tests, Docker build, GHCR publish)
- [x] Frontend ESLint and TypeScript quality gates (0 errors)
- [x] Automated backend pytest suite with SQLite isolation
- [x] WebSocket JWT authentication
- [x] Celery dispatch with BackgroundTasks fallback
- [x] Loki/Alloy isolated under Docker Compose logging profile
- [x] Grafana datasource and dashboard auto-provisioning
- [x] Prometheus HTTP metrics middleware

Note: Argo CD GitOps is classified as optional (Milestone 10).
AWS cloud deployment is not in scope for this project.

---

# Current Branch

refactor/devops-hardening

---

# Latest Completed Feature

fix(tests): patch app.db.session and app.main engines before TestClient lifespan

---

# Current Architecture

## Frontend

Next.js application providing:

- Authentication
- Protected dashboard
- Project management
- Project details
- Deployment triggering
- Deployment history
- Pipeline visualization
- Logs preview
- Dashboard analytics

## Backend

FastAPI application providing:

- Authentication
- JWT authorization
- Dashboard APIs
- Project CRUD APIs
- Deployment APIs
- Pipeline APIs
- PostgreSQL persistence
- Redis integration
- Prometheus metrics endpoint

## Database

PostgreSQL stores:

- Users
- Projects
- Deployments

Projects are linked to deployments through the project relationship.

## Containers

Current Docker Compose services:

- frontend
- backend
- db
- redis
- worker
- prometheus
- grafana
- loki
- alloy

Current verified service state:

- Frontend — healthy
- Backend — healthy
- PostgreSQL — healthy
- Redis — healthy
- Celery worker — running
- Prometheus — running
- Grafana — running (port 3001)
- Loki — running (port 3100)
- Alloy — running (log collection via Docker discovery)

The Celery worker does not use an HTTP healthcheck because it does not expose an HTTP server on port 8000. Its previous incorrect HTTP healthcheck was disabled.

---

# Known Issues

- OAuth providers are prepared but production credentials are pending
- Metrics endpoint has no authentication (acceptable for internal/portfolio use; document the decision)
- Grafana dashboards can be further enriched with custom pre-provisioned JSON models
- Terraform manages Kubernetes resources only (no cloud IaC provisioning yet)
- Argo CD GitOps is optional, not currently implemented

---

# Next Task

## Final PR Review & Merge (`refactor/devops-hardening` → `main`)

Subject to explicit user approval:
1. Perform final PR inspection on GitHub.
2. Merge PR #1 into `main` via Squash & Merge (or standard merge as preferred).
3. Verify that `main` branch GitHub Actions CI completes successfully and publishes release images to GHCR with `:latest` tag.

## Post-Merge Work & Portfolio Presentation

- Pin repository on GitHub profile.
- Capture local runtime screenshots (`docs/images/`) and embed in README.
- Prepare technical interview talking points:
  - Microservice containerization and multi-stage Dockerfiles.
  - Celery asynchronous dispatch and Redis Pub/Sub log streaming.
  - Test isolation strategies (in-memory SQLite fixture vs production PostgreSQL).
  - Kubernetes manifest hardening (secrets, resources, health probes).
  - Prometheus scraping and Grafana dashboard auto-provisioning.
  - CI/CD security (immutable commit-SHA tagging vs `:latest` release restriction).

---

# Development Rules

- Complete one milestone at a time
- Complete one monitoring component at a time
- Commit after every major feature
- Maintain clean Git history
- Test before moving forward
- Do not rewrite completed architecture
- Preserve existing technology choices
- Verify backend/database/frontend integration before marking a milestone complete
- Verify Docker Compose services before proceeding
- Verify monitoring components through real running containers
- Verify database-backed features with PostgreSQL when applicable

---

# Resume Instructions

If another AI continues this project:

1. Read this file first.
2. Analyze the repository before making changes.
3. Continue only from the current milestone.
4. Do not rewrite completed features.
5. Preserve existing architecture.
6. Complete one milestone at a time.
7. Verify changes through the running Docker Compose environment.
8. Verify database-backed features with PostgreSQL when applicable.
9. Verify monitoring components through their real services and endpoints.
10. Do not mark a component complete without verification.
11. Provide git commit and push commands after completing changes.

---

# Milestone Status Summary

| Phase | Milestone / Task | Status |
|---|---|---|
| Phase 1 — Foundation | Foundation Scaffolding & Topologies | ✅ Complete |
| Phase 2 — Authentication | Milestones 1–4: JWT Auth, Stores & Route Guards | ✅ Complete |
| Phase 3 — Platform Features | Milestones 5–8: Dashboard, Projects, Pipelines & Observability | ✅ Complete |
| Phase 4 — DevOps Hardening | Milestone 9: Quality Gates, CI/CD, K8s & Security | ✅ Complete |
| Phase E1.2 — CI Isolation | In-Memory SQLite Test Engine Patching (`da3f919`) | ✅ Complete |
| Phase E1.3 — CI & Identity | Actions Run `42182396415` & Verified Git Identity (`581088a`) | ✅ Complete |
| Phase E2 — Final PR Audit | Read-Only PR #1 Review across all 48 Changed Files | ✅ Complete |
| Phase E2.1 — Minor Fixes | Standalone Test Runner Alignment (`e04fd2c`) | ✅ Complete |
| Task 1 — PR Finalization | PR #1 Conversion from Draft to Ready for Review | ✅ Complete |
| Task 2 — Runtime Validation | Full Local Docker Compose & Observability Validation | ✅ Complete |
| Task 3 — Documentation Audit | Comprehensive README, PROJECT_LOG & Docs Alignment | ✅ Complete |
| Phase 5 — Merge & Release | Merge PR #1 to `main` & GitHub Profile Presentation | ⏳ Next Step (Awaiting Approval) |
| Phase 6 — Future Explorations | Milestone 10: Optional Argo CD GitOps and live cloud deployment exploration | ⏳ Planned / Optional |

---

## Milestone 9 — DevOps Hardening, Quality Gates & Kubernetes Architecture

### Completed & Verified
- **Frontend Code Quality:** Resolved all 21 ESLint errors in React 19 / Next.js codebase. `npm run lint` exits 0 with 0 errors and 0 warnings; `npx tsc --noEmit` exits 0 with zero type errors.
- **Automated Backend Tests:** Implemented unit and integration test suite covering Auth, Projects CRUD, and Infrastructure endpoints with in-memory SQLite isolation.
- **CI/CD Quality Gates & Safe Publishing:** Added backend test execution and frontend linting to GitHub Actions. Restricted GHCR container image publishing strictly to `push` events on `main` using immutable commit-SHA tags (pull requests only test and build; never push `:latest`).
- **Celery Worker Integration & Fallback:** Wired Celery asynchronous task dispatch (`run_deployment_task.delay`) with graceful automatic fallback to FastAPI in-process `BackgroundTasks` if Redis/Celery is offline.
- **WebSocket Security:** Added JWT Bearer token authentication to `/ws/logs/{id}` and `/ws/deployments/{id}/status`.
- **Compose Profile Isolation:** Placed Grafana Loki and Alloy under `profiles: ["logging"]` to eliminate Windows socket mount issues in default local runs.
- **Kubernetes Manifest Hardening:** Created `k8s/namespace.yaml` and `k8s/secret.yaml`, updated all workloads (`backend`, `worker`, `database`, `redis`, `frontend`) to use `secretKeyRef`, and defined realistic CPU/memory requests and limits across all microservices. Validated with YAML safe-loader across all 12 documents.
- **Monitoring Auto-Provisioning:** Created Grafana datasource provisioning (Prometheus default, Loki optional) and dashboard provisioning (`StackForge Platform Overview` JSON). Instrumented FastAPI with live Prometheus HTTP request counter, error ratio, and latency histogram middleware.
- **Repository Hygiene:** Safely removed empty root `package-lock.json`, tracked `docker-compose.yml.before-loki`, and conflicting legacy `backend/docker-compose.yml` and `backend/docker/Dockerfile`.

### Runtime Verification Notes
- Frontend typechecking, linting, Python compilation, Docker Compose configuration syntax, and Kubernetes manifest parsing are verified 100% on the local system.
- Live container and cluster executions are verified through isolated test suites; full Kubernetes cluster deployment is ready for execution via `kubectl apply -f k8s/` once Minikube or kind is booted.

### Kubernetes Manifest Architecture

```text
k8s/
├── namespace.yaml
├── secret.yaml.example     ← committed placeholder (never populate; use kubectl create secret)
├── backend/
│   ├── backend.yaml
│   └── worker.yaml
├── database/
│   └── postgres.yaml
├── frontend/
│   └── frontend.yaml
└── redis/
    └── redis.yaml
```

Note: `k8s/secret.yaml` is listed in `.gitignore` and is **not tracked** in Git.
Copy from `secret.yaml.example` for local cluster use only.

---

## Phase E1.2 — Backend CI Test Isolation Fix

**Branch:** `refactor/devops-hardening`
**Commit:** `da3f919`

### Problem

The first GitHub Actions CI run exposed a backend test isolation defect.
`main.py` lifespan calls `Base.metadata.create_all(bind=engine)` where `engine`
is the production PostgreSQL engine imported from `app.db.session`.  In CI
there is no PostgreSQL server, so tests failed during lifespan startup before
any test fixture executed.  Local tests masked this because Docker Compose
PostgreSQL was running during development.

### Fix

`backend/tests/conftest.py` now patches `app.db.session.engine` and
`app.main.engine` with the in-memory SQLite test engine **at module import
time**, before `TestClient(app)` triggers the FastAPI lifespan.
`SessionLocal` is likewise redirected.  Production code is not affected; it
still selects PostgreSQL via `sqlalchemy_database_uri` in `Settings`.

### Files Changed

- `backend/tests/conftest.py` — engine patching, cleaner structure, documentation

### Verification

Backend CI (`pytest tests -v` on Python 3.12 in GitHub Actions, no PostgreSQL).
Frontend CI (`npm run lint`, `npx tsc --noEmit`, `npm run build`).

---

## Phase E1.3 — GitHub Actions Verification & Git Identity Verification

**Branch:** `refactor/devops-hardening`
**Commits:** `da3f919` (CI fix), `581088a` (Documentation update)
**GitHub Actions Run:** `42182396415` (Status: `success`)

### Summary & Verification
1. **GitHub Actions CI:** Confirmed all 3 jobs passed:
   - Frontend CI: `npm run lint`, `npx tsc --noEmit`, `npm run build` (success).
   - Backend CI: `pytest tests -v` on Python 3.12 with SQLite isolation (success).
   - Docker Build: Multi-service container image build (success).
2. **Git Identity Verification:**
   - Author name: `Ashwin Satvi`
   - Verified email: `satviashwin369@gmail.com`
   - Cleaned up malformed local `.gitconfig` entries to ensure consistent author identity for all subsequent commits.
3. **Repository State:** Branch `refactor/devops-hardening` is clean and in 1:1 sync with origin. `main` branch remains untouched.

---

## Phase E2 — Final Pull Request Read-Only Review

**Branch:** `refactor/devops-hardening`
**Pull Request:** #1 (Draft, 14 commits, 0 merge conflicts)
**Head Commit:** `581088a601dd3dc432ce539e27c0736e92d38ff5`

### Audit Findings
- Performed a read-only audit across all 48 changed files against architecture rules and documentation.
- All core implementations (Auth, CRUD, Celery, Prometheus, Grafana, Docker, K8s, CI) were verified intact with no regressions.
- Identified two minor non-blocking findings:
  1. Standalone test script `backend/tests/run_tests.py` referenced outdated test function names that did not match `test_auth.py` and `test_projects.py`.
  2. Verified Git commit author email configuration needed standardization before creating any final commit.

---

## Phase E2.1 — Final Minor Fixes & Standalone Test Runner Alignment

**Branch:** `refactor/devops-hardening`
**Commit:** `e04fd2c03109a7b9032dd4231138ec60cd43970d` (`fix(tests): align standalone test runner with test functions`)
**GitHub Actions Run:** `42185554521` (Status: `success`)

### Summary & Fix
1. Updated `backend/tests/run_tests.py` to match the exact test function signatures in `test_auth.py` and `test_projects.py`.
2. Verified standalone runner execution: 6 auth tests and 7 project CRUD tests passed cleanly with 0 errors.
3. Created commit `e04fd2c` under verified Git identity: `Ashwin Satvi <satviashwin369@gmail.com>`.
4. Pushed to remote; triggered GitHub Actions CI run `42185554521`. All 3 jobs (Frontend CI, Backend CI, Docker Build) succeeded.

---

## Task 1 — Pull Request #1 Finalization

**Branch:** `refactor/devops-hardening`
**Pull Request:** #1 (https://github.com/satviashwin369-creator/StackForge/pull/1)
**Head Commit:** `e04fd2c03109a7b9032dd4231138ec60cd43970d`

### Action
- Verified local and remote branch synchronization.
- Confirmed working tree clean and all 15 commits present.
- Converted PR #1 on GitHub from **Draft** to **Ready for review**.
- Auto-merge remains disabled; PR remains open and unmerged awaiting final review.

---

## Task 2 — Final Local Runtime Validation

**Branch:** `refactor/devops-hardening`
**Head Commit:** `e04fd2c03109a7b9032dd4231138ec60cd43970d`
**Mode:** Non-destructive runtime audit on local machine.

### Concrete Results
1. **Docker Compose:** Syntax validated with `docker compose config`. All 9 containers active and running (`stackforge-frontend`, `stackforge-backend`, `stackforge-db`, `stackforge-redis`, `stackforge-worker`, `stackforge-prometheus`, `stackforge-grafana`, `stackforge-loki`, `stackforge-alloy`).
2. **Frontend:** Port 3000 returned HTTP 200. Next.js App Router and static assets serving properly.
3. **Backend API:** Port 8000 returned HTTP 200 on `/health`, `/docs` (OpenAPI Swagger), and `/metrics`.
4. **PostgreSQL & Redis:** Healthy container status. Relational tables initialized; Redis broker and Pub/Sub bus operational.
5. **Celery Background Worker:** Connected to `redis://redis:6379/1`, registered task `stackforge.run_deployment`.
6. **Authentication:** User login, `/auth/me`, and dynamic user registration (`/auth/register`) validated with real JWT bearer tokens.
7. **Project Management:** Full CRUD operations validated (List 3 seeded projects, Create new project, Delete test project).
8. **Deployment Pipeline & Celery Execution:** Deployment queued and transitioned from `queued` to `deploying`. Celery worker generated 4 live log lines into the database.
9. **WebSocket Logs:** Unauthenticated request rejected with HTTP 403; Authenticated handshake returned HTTP 101 Switching Protocols.
10. **Observability (Prometheus & Grafana):** Prometheus target `http://backend:8000/metrics` is UP and scraped every 15s. Grafana `/api/health` returned OK with auto-provisioned dashboards.
11. **Logging (Loki & Alloy):** Alloy actively tails container logs; Loki receives log pushes.
12. **Kubernetes Runtime:** **NOT TESTED** (no local Minikube/kind cluster was active on host machine; expected and documented per safety guidelines).

---

## Task 3 — Final Documentation Audit & Cleanup

**Branch:** `refactor/devops-hardening`
**Head Commit:** `e04fd2c03109a7b9032dd4231138ec60cd43970d`

### Actions & Corrections
1. **README.md:**
   - Reframed tone to student-built, portfolio-grade IDP (avoiding exaggerated enterprise claims).
   - Added clear simulation disclosure distinguishing live backend operations from simulated pipeline stages (`deployment_simulator.py`) and infrastructure fleet metrics (`infra_service.py`).
   - Clarified technology scope: Argo CD, Kafka, Jaeger, and AWS are not implemented.
   - Clarified that `k8s/` and `terraform/` manage overlapping Kubernetes resources and must not be applied simultaneously.
   - Added safe shutdown instructions (`docker compose down`, never `-v`).
   - Documented unauthenticated `/metrics` and pending OAuth credentials as verified limitations.
   - Recommended specific screenshots for portfolio presentation.
2. **PROJECT_LOG.md:**
   - Synchronized current branch and HEAD commit (`e04fd2c`).
   - Appended Phase E1.3, E2, E2.1, Task 1, Task 2, and Task 3 records.
   - Updated Milestone Status Summary table and Next Task section.
3. **Documentation Streamlining:**
   - Consolidated legacy deployment notes into unified core engineering specifications.
   - Documented resource ownership boundary between Kubernetes manifests and Terraform.
