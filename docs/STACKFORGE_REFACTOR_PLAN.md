# StackForge — Safe Architecture Simplification & DevOps Hardening Plan

**Status:** Approved for Implementation  
**Target Audience:** Engineering Review & Portfolio Presentation (3rd-Year B.Tech Level)  
**Safety Mandate:** Non-destructive, reversible, preservation of existing code assets.  
**Git Checkpoint Tag:** `checkpoint-pre-refactor`  
**Refactoring Branch:** `refactor/devops-hardening`  

---

## 1. Executive Summary & Objective

StackForge is an Internal Developer Platform (IDP) designed to manage microservice lifecycles, continuous deployment pipelines, live log streaming, and telemetry.

The objective of this refactoring is to transition StackForge from an overextended set of partially disconnected tools into a **tight, resilient, understandable, and production-inspired DevOps platform**. The project prioritizes working functionality and architectural clarity over tool proliferation, ensuring it is reliable to run locally on Windows/Linux/macOS without requiring paid cloud services.

---

## 2. Current Architecture vs. Target Architecture

### A. Current Architecture (Baseline)
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Zustand.
- **Backend:** FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2, JWT authentication.
- **Persistence:** PostgreSQL 16 Alpine.
- **Async Queue & Cache:** Redis 7 + Celery 5.4. *(Defect: Celery worker container runs but API bypasses it, using in-process `BackgroundTasks`).*
- **Observability:** Prometheus v3.5, Grafana 12.1, Grafana Loki 3.5, Grafana Alloy v1.10. *(Defect: Grafana starts empty with zero pre-provisioned datasources or dashboards; Alloy requires Windows host Docker socket access).*
- **Orchestration:** Kubernetes manifests (`k8s/`) + Terraform (`terraform/` using `hashicorp/kubernetes` provider). *(Defect: Duplicated resource definitions; plaintext credentials in manifests; missing namespace manifest).*
- **CI/CD:** GitHub Actions building and publishing to GHCR. *(Defect: Pushes `:latest` tag on unmerged Pull Requests; zero automated tests in CI; skips frontend linting).*

### B. Target Architecture (Hardened & Streamlined)
```
               [ Browser / User ]
                       │
                       ▼
       ┌───────────────────────────────┐
       │   Next.js 16 Frontend (:3000) │
       └───────────────┬───────────────┘
                       │ (API Proxy /api/v1/*)
                       ▼
       ┌───────────────────────────────┐
       │     FastAPI Backend (:8000)   │◄──── Scraped by Prometheus (:9090)
       └───────┬───────────────┬───────┘          │
               │               │                  ▼
        (SQLAlchemy)     (Celery Task /      Grafana (:3001)
               │          Redis Pub/Sub)  (Pre-provisioned Dashboards)
               ▼               ▼
      ┌─────────────┐   ┌─────────────┐
      │ PostgreSQL  │   │   Redis 7   │
      │   (:5432)   │   │   (:6379)   │
      └─────────────┘   └──────┬──────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   Celery    │
                        │   Worker    │
                        └─────────────┘
  
  [ Optional Profile: logging ]
  Docker Socket ──► Grafana Alloy (:12345) ──► Grafana Loki (:3100)
```

---

## 3. Core vs. Optional Components

| Component | Classification | Justification & Strategy |
|---|---|---|
| **Next.js Frontend** | **Core** | Primary developer portal UI; preserve all views (Auth, Projects, Deployments, Logs, Infra). |
| **FastAPI Backend** | **Core** | Core REST & WebSocket server, authentication, project CRUD, telemetry endpoint. |
| **PostgreSQL** | **Core** | Primary relational database for users, projects, deployments, and logs. |
| **Redis** | **Core** | Essential for fast Pub/Sub WebSocket log streaming and Celery task broker. |
| **Celery Worker** | **Core (Wired)** | Connect backend `trigger_deployment` directly to `run_deployment_task.delay()` with graceful fallback to `BackgroundTasks` if Redis/worker is offline. |
| **Prometheus** | **Core (Metrics)** | Scrapes backend `/metrics` for application health, request throughput, and latency. |
| **Grafana** | **Core (Viz)** | Automated provisioning mounted so Prometheus metrics dashboards work out-of-the-box. |
| **Loki & Alloy** | **Optional (`logging` profile)** | Moved behind Docker Compose profile `--profile logging`. Default stack is lightweight and runs without Docker socket friction on Windows; optional profile remains fully available. |
| **Kubernetes (`k8s/`)** | **Core (DevOps)** | Hardened with `namespace.yaml`, `secret.yaml`, and container resource requests/limits. Primary deployment manifest source. |
| **Terraform (`terraform/`)** | **Optional (IaC Ext.)** | Preserved as an IaC reference for Kubernetes workloads; documented clearly to prevent dual-apply collision with raw manifests. |

---

## 4. Dependencies Between Services

1. **Frontend $\rightarrow$ Backend:** Next.js proxies `/api/v1/*` to `backend:8000`. WebSockets connect directly to `/api/v1/ws/*`.
2. **Backend $\rightarrow$ PostgreSQL:** Backend requires PostgreSQL connection on startup for SQLAlchemy models and demo seeding.
3. **Backend $\rightarrow$ Redis:** Backend publishes deployment status updates and logs to Redis channels (`logs:stream:{id}`).
4. **Celery Worker $\rightarrow$ Redis & PostgreSQL:** Worker consumes tasks from `redis://redis:6379/1`, writes stage logs to PostgreSQL, and broadcasts progress via Redis.
5. **Prometheus $\rightarrow$ Backend:** Prometheus polls `http://backend:8000/metrics` every 15s.
6. **Grafana $\rightarrow$ Prometheus:** Grafana connects to `http://prometheus:9090` using automated datasource provisioning.

---

## 5. Files to Modify and Files to Preserve

### Files to Modify
- `.github/workflows/ci.yml`: Add test steps, add lint check, restrict GHCR push to `main` branch push events.
- `docker-compose.yml`: Place `loki` and `alloy` under `profiles: ["logging"]`; streamline default service startup.
- `backend/app/api/routes/deployments.py`: Dispatch to Celery worker task `run_deployment_task.delay()` with fallback.
- `backend/requirements.txt`: Add `pytest` and `httpx` for test execution.
- `k8s/database/postgres.yaml`, `k8s/backend/backend.yaml`, `k8s/backend/worker.yaml`: Reference `secretKeyRef` instead of inline credentials; add CPU/memory requests and limits.
- `frontend/components/dashboard/chart-container.tsx`, `frontend/components/providers/theme-provider.tsx`, `frontend/hooks/use-async-data.ts`, `frontend/hooks/use-live-logs.ts`, `frontend/hooks/use-polling.ts`: Fix 21 React 19 hook lifecycle ESLint errors.
- `README.md`, `PROJECT_LOG.md`, `docs/`: Update documentation to reflect hardened, accurate architecture.

### Files to Create
- `docs/STACKFORGE_REFACTOR_PLAN.md`: (This document).
- `k8s/namespace.yaml`: Defines `stackforge` namespace.
- `k8s/secret.yaml`: Defines `stackforge-secrets` template for local development.
- `monitoring/grafana/provisioning/datasources/datasources.yaml`: Automatic Prometheus datasource provisioning.
- `monitoring/grafana/provisioning/dashboards/dashboards.yaml`: Automatic dashboard loader.
- `monitoring/grafana/dashboards/stackforge-overview.json`: Standardized system metrics dashboard.
- `backend/tests/test_auth.py`, `backend/tests/test_projects.py`: Automated pytest test suite.

### Files to Remove (Repository Hygiene)
- `package-lock.json` (in root): 89-byte empty lockfile (frontend has its own `package-lock.json`).
- `docker-compose.yml.before-loki`: Redundant backup file tracked in Git.
- `backend/docker-compose.yml` & `backend/docker/Dockerfile`: Legacy conflicting files with outdated ports (4000) and service names.

### Files That Must Be Preserved Intact
- All database models (`backend/app/models/*`).
- Alembic migration files (`backend/alembic/*`).
- All frontend pages and core UI components.
- Terraform files (`terraform/main.tf`, `variables.tf`, `outputs.tf`, `terraform.tfstate`).
- Loki & Alloy configs (`monitoring/loki/loki-config.yml`, `monitoring/alloy/config.alloy`).

---

## 6. Security & Hardening Strategy

1. **Kubernetes Secret Externalization:** Move plaintext passwords and JWT secrets out of deployment environment blocks into Kubernetes `Secret` resources (`stackforge-secrets`).
2. **CI Registry Protection:** Guard the Docker build job so that `docker push` only triggers when `github.event_name == 'push'` on `refs/heads/main`. Pull requests will only build and run tests without pushing tags.
3. **Automated Quality Gates:** Enforce `python -m compileall`, `pytest`, `npx tsc --noEmit`, and `npm run lint` in GitHub Actions.
4. **Local Secrets Isolation:** Maintain `.env.example` with safe demonstration defaults. Local `.env` remains strictly ignored by `.gitignore`.

---

## 7. Potential Breaking Changes & Mitigations

| Potential Risk | Affected Area | Mitigation |
|---|---|---|
| Celery connection error if Redis is down | Deployment creation | Implement `try...except` wrapper in `deployments.py` that gracefully falls back to FastAPI `BackgroundTasks`. |
| Missing Grafana datasources on startup | Monitoring UI | Provide declarative YAML provisioning in `monitoring/grafana/provisioning/datasources/`. |
| React component behavior changes during lint fixes | Frontend UI rendering | Use standard React 19 state initialization and ref patterns; verify with `npx tsc` and `npm run build`. |
| Docker compose profile confusion | Local startup | Default `docker compose up -d` launches standard stack; document `docker compose --profile logging up -d` clearly. |

---

## 8. Validation Strategy

Each batch will be validated using safe, non-destructive checks:
1. **Frontend:** `npx tsc --noEmit` (type checking) and `npm run lint` (ESLint).
2. **Backend:** `python -m compileall app -q` (compilation) and `pytest tests/` (unit testing).
3. **Docker Compose:** `docker compose config` (syntax & service graph validation).
4. **Terraform:** `terraform validate` (syntax & schema validation).
5. **Git Hygiene:** `git status --short` and `git diff` review before every commit.

---

## 9. Rollback Plan

If any batch introduces regressions or fails validation:
1. To discard uncommitted changes in working directory: `git checkout -- .`
2. To roll back to the pre-refactor state: `git reset --hard checkpoint-pre-refactor`
3. To switch back to original unmodified `main`: `git checkout main`

---

## 10. Vercel & Free Public Demo Analysis

### Can StackForge Run on Vercel?
- **Frontend (Next.js):** **Yes, seamlessly.** Next.js App Router deployable on Vercel free tier with standard GitHub integration.
- **Backend (FastAPI):** **Not natively suited for Vercel Serverless Functions.**
  - FastAPI can be adapted via Mangum / Vercel Serverless Python runtime, but Vercel has a 10s execution timeout and lacks persistent background workers or WebSocket support.
- **WebSockets, Redis & Celery:** **Incompatible with Vercel.** Vercel Serverless does not support persistent TCP WebSocket connections or long-running Celery worker processes.
- **PostgreSQL:** Can use a free serverless PostgreSQL provider (e.g., Neon.tech, Supabase free tier).

### Recommended Free-Tier Architecture for a Public Demo (When Needed)
If the student wishes to provide a live public demo URL without paid hosting:
1. **Frontend:** Deploy Next.js to **Vercel** (free).
2. **Backend + Database + Redis:** Deploy containerized FastAPI + PostgreSQL + Redis to **Render.com** (free tier web service) or **Fly.io** (free allowance).
3. **WebSocket Fallback:** Ensure frontend `useLiveLogs` polling fallback is active if free-tier proxy restricts WebSockets.
4. **Core Portfolio Recommendation:** Emphasize the Docker Compose and Kubernetes deployment as the primary engineering deliverable. A live public demo can be an optional companion, but local container and Kubernetes orchestration is the industry standard for DevOps portfolios.
