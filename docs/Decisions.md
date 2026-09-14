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
