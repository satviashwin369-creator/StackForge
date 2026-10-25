# Architecture Decision Records (ADRs) 📋

## ADR 001: Next.js 16 App Router for Platform Frontend
- **Status:** Accepted
- **Context:** An Internal Developer Platform requires high interactivity, client-side state transitions, dynamic data tables, and live WebSocket streaming.
- **Decision:** Utilize Next.js 16 with the App Router, React 19, TypeScript, and Tailwind CSS v4. Route groups `(auth)` separate public flows from protected `/dashboard` routes.

## ADR 002: FastAPI for Asynchronous Backend Core
- **Status:** Accepted
- **Context:** High throughput, automatic OpenAPI documentation, and native async WebSocket capabilities are required for streaming logs and telemetry.
- **Decision:** Use FastAPI 0.115 with SQLAlchemy 2.0 ORM, Pydantic v2 schemas, and Alembic database migrations.

## ADR 003: Redis for Dual Caching and Pub/Sub Event Streaming
- **Status:** Accepted
- **Context:** Real-time log streaming and deployment status broadcasting require low-latency message passing between worker tasks and WebSocket clients.
- **Decision:** Use Redis 7 as both the Celery broker/result backend and the Pub/Sub bus for `/ws/logs/{id}` channels.

## ADR 004: Grafana Alloy for Dynamic Docker Log Collection
- **Status:** Accepted
- **Context:** All Docker container logs must be ingested into Loki with per-service labels without requiring container agents inside each service image.
- **Decision:** Deploy Grafana Alloy v1.10.2 mounting `/var/run/docker.sock` and `/var/lib/docker/containers`. Use `discovery.relabel` to dynamically map `__meta_docker_container_label_com_docker_compose_service` to `service_name`, avoiding hardcoded static labels and enabling zero-configuration logging for all compose services.

## ADR 005: Compose Profile Isolation for Advanced Observability
- **Status:** Accepted
- **Context:** Mounting `/var/run/docker.sock` and `/var/lib/docker/containers` in Grafana Alloy and Loki causes permission errors, pipe failures, and heavy overhead on Windows / Docker Desktop environments when only core IDP features are needed.
- **Decision:** Isolate `loki` and `alloy` under Docker Compose `profiles: ["logging"]`. The default `docker compose up -d` launches the 7 core services (`frontend`, `backend`, `worker`, `db`, `redis`, `prometheus`, `grafana`), ensuring instant, failure-free startup. Full log aggregation is accessible on demand via `docker compose --profile logging up -d`.

## ADR 006: Kubernetes Manifests as Primary Local Deployment Owner
- **Status:** Accepted
- **Context:** Overlapping resource management between raw Kubernetes manifests in `k8s/` and Terraform's `kubernetes` provider created architectural ambiguity and drift risk in a portfolio project.
- **Decision:** Establish `k8s/` declarative manifests as the primary, authoritative deployment mechanism for local Kubernetes (Minikube / kind). Retain Terraform configuration in `terraform/` strictly as an optional Infrastructure-as-Code extension for learning and cloud provisioning, avoiding dual-management of the same cluster resources.

## ADR 007: Celery Pipeline Dispatch with In-Process Fallback & Secured WebSockets
- **Status:** Accepted
- **Context:** Celery workers may be stopped during lightweight development, causing deployment pipelines to stall. Furthermore, WebSocket streaming endpoints were unauthenticated.
- **Decision:** In `backend/app/api/routes/deployments.py`, dispatch deployment tasks asynchronously to Celery via `run_deployment_task.delay()`, but gracefully fall back to in-process `BackgroundTasks` if Redis/Celery is unreachable. In `backend/app/api/routes/ws.py`, require valid JWT query parameters (`?token=...`) on WebSocket handshakes to enforce role-based access control.
