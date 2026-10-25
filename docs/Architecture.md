# StackForge Architecture 🏛️

StackForge is engineered as a lightweight, production-inspired Internal Developer Platform (IDP) delivering developer self-service, container execution observability, and multi-stage deployment workflows.

## System Topography

```text
                                  +-----------------------+
                                  |      Web Browser      |
                                  +-----------+-----------+
                                              |
                                              | HTTP / Authenticated WebSocket
                                              v
                              +---------------+---------------+
                              |    Next.js 16 Web Frontend    |
                              |   (Port 3000 / App Router)    |
                              +---------------+---------------+
                                              |
                                              | Reverse Proxy / REST / WS
                                              v
                              +---------------+---------------+
                              |      FastAPI Backend API      |
                              |     (Port 8000 / Uvicorn)     |
                              +---+-----------+-----------+---+
                                  |           |           |
            +---------------------+           |           +---------------------+
            |                                 |                                 |
            v                                 v                                 v
+-----------+-----------+         +-----------+-----------+         +-----------+-----------+
|     PostgreSQL 16     |         |        Redis 7        |         |  Prometheus Client    |
| (Port 5432 / DB Data) |         | (Port 6379 / PubSub)  |         |     (/metrics)        |
+-----------------------+         +-----------+-----------+         +-----------+-----------+
                                              |                                 |
                                              v                                 | Scrapes (15s)
                                  +-----------+-----------+                     v
                                  |     Celery Worker     |         +-----------+-----------+
                                  | (Async Deployment Job)|         |      Prometheus       |
                                  +-----------------------+         |      (Port 9090)      |
                                                                    +-----------+-----------+
                                                                                |
                                                                                v Auto-Provisioned
+ - - - - - - - - - - - - +       + - - - - - - - - - - - +         +-----------+-----------+
|  Docker Daemon Socket   | ----> |     Grafana Alloy     | ------> |        Grafana        |
|  (Optional Log Profile) |       |  (Optional Profile)   |         |  (Port 3001 / Dash)   |
+ - - - - - - - - - - - - +       + - - - - - - - - - - - +         +-----------+-----------+
                                              |                                 ^
                                              v                                 |
                                  + - - - - - - - - - - - +                     |
                                  |     Grafana Loki      | --------------------+
                                  |  (Optional Profile)   |
                                  + - - - - - - - - - - - +
```

## Core Subsystems

### 1. Web Frontend (Next.js 16 + React 19)
- **App Router:** Route group isolation between unauthenticated (`(auth)/login`, `(auth)/signup`) and protected (`dashboard/*`) layouts.
- **State Management:** Zustand store (`auth-store.ts`) with persistent local storage hydration for JWT tokens.
- **Real-Time Client:** Custom React hook `useLiveLogs` connecting to `/api/v1/ws/logs/{id}?token=...` with resilient fallback to polling.
- **Design System:** Tailwind CSS v4, Lucide icons, Framer Motion transitions, and Recharts telemetry charts.
- **Quality Assurance:** 100% strict TypeScript types and zero ESLint errors.

### 2. Application API (FastAPI + SQLAlchemy 2.0)
- **Lifespan Manager:** Handles automatic database schema creation (`Base.metadata.create_all`) and deterministic database demo seeding.
- **Authorization & Security:** Dependency-injected `CurrentUser` extracted from signed JWT bearer tokens using Passlib bcrypt hashing.
- **Observability Instrumentation:** Exports live Prometheus metrics via `/metrics`:
  - `http_requests_total`: Request counts by method, status code, and endpoint.
  - `http_request_duration_seconds`: High-resolution request latency histogram.
  - Standard process CPU and memory runtime metrics.
- **Pipeline Orchestration:** Dispatches deployment tasks asynchronously to Celery, with graceful automatic fallback to FastAPI in-process `BackgroundTasks` if Redis/Celery is offline.

### 3. Asynchronous Pipeline Engine (Celery + Redis)
- **Task Scheduling:** Runs `run_deployment_task` workers executing 6 delivery stages (`Source → Build → Test → Security Scan → Deploy → Verify`).
- **Broadcasting:** Publishes step transitions and execution log lines through Redis Pub/Sub channels.

### 4. Observability Pipeline (Prometheus + Grafana + Loki Profile)
- **Prometheus Metric Collection:** Collects application performance metrics every 15 seconds from `backend:8000/metrics`.
- **Auto-Provisioned Grafana:** Mounts provisioning configurations and dashboards on container boot, showing backend health, request rate, error ratios, latency, and memory.
- **Optional Logging Profile (`--profile logging`):** When enabled, Grafana Alloy dynamically collects Docker container logs and ingests them into Loki with service labels.

### 5. Architectural Integrity & Telemetry Distinction
- **Genuine Live Signals:** FastAPI health (`/health`), Prometheus scrape status (`up`), HTTP request rate (`http_requests_total`), error rates, and process memory.
- **Simulated Demonstration Data:** Infrastructure node cluster cards (`/dashboard/infrastructure`) model simulated cluster metrics to demonstrate how multi-server fleet telemetry is presented in a production IDP dashboard without requiring a paid cloud cluster.
