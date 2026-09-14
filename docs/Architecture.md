# StackForge Architecture 🏛️

StackForge is engineered as an Internal Developer Platform (IDP) delivering developer self-service, container execution observability, and multi-stage deployment workflows.

## System Topography

```text
                                  +-----------------------+
                                  |      Web Browser      |
                                  +-----------+-----------+
                                              |
                                              | HTTP / WebSocket
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
                                              v                                 | Scrapes
                                  +-----------+-----------+                     v
                                  |     Celery Worker     |         +-----------+-----------+
                                  |    (Async Pipelines)  |         |      Prometheus       |
                                  +-----------------------+         |      (Port 9090)      |
                                                                    +-----------+-----------+
                                                                                |
                                                                                v
+-----------------------+         +-----------------------+         +-----------+-----------+
|  Docker Daemon Socket | ------> |     Grafana Alloy     | ------> |     Grafana Loki      |
|  /var/run/docker.sock |         |  (Port 12345/Relabel) |         |      (Port 3100)      |
+-----------------------+         +-----------------------+         +-----------+-----------+
                                                                                |
                                                                                v
                                                                    +-----------+-----------+
                                                                    |        Grafana        |
                                                                    |      (Port 3001)      |
                                                                    +-----------------------+
```

## Core Subsystems

### 1. Web Frontend (Next.js 16 + React 19)
- **App Router:** Clean route isolation between unauthenticated (`(auth)/login`, `(auth)/signup`) and protected (`dashboard/*`) layouts.
- **State Management:** Zustand store (`auth-store.ts`) with persistent local storage hydration for JWT tokens.
- **Real-Time Client:** Custom React hook `useLiveLogs` that dynamically establishes WebSocket connections to `/ws/logs/{id}` with fallbacks to interval polling.
- **Design System:** Tailwind CSS v4, Lucide icons, Framer Motion transitions, and Recharts telemetry charts.

### 2. Application API (FastAPI + SQLAlchemy 2.0)
- **Lifespan Manager:** Handles automatic database schema creation (`Base.metadata.create_all`) and deterministic database demo seeding.
- **Authorization & Security:** Dependency-injected `CurrentUser` extracted from signed JWT bearer tokens using Passlib bcrypt hashing.
- **Observability Hook:** Exports standard Prometheus metrics via `/metrics` using `prometheus_client`.

### 3. Asynchronous Pipeline Engine (Celery + Redis)
- **Task Scheduling:** Executes asynchronous deployment pipelines.
- **Broadcasting:** Publishes live step transitions and streaming execution logs through Redis Pub/Sub channels.

### 4. Observability Pipeline (Alloy + Loki + Prometheus + Grafana)
- **Container Discovery:** Grafana Alloy discovers all running containers via `/var/run/docker.sock`.
- **Dynamic Relabeling:** Evaluates `__meta_docker_container_label_com_docker_compose_service` to tag logs with their Docker Compose service name, eliminating hardcoded labels.
- **Loki Ingestion:** Forwards parsed JSON logs directly into Loki's TSDB filesystem store.
- **Prometheus Metric Collection:** Collects application performance metrics every 15 seconds.
- **Unified Visualization:** Grafana aggregates both metric queries and Loki logQL queries.
