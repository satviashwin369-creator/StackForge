# StackForge — Systems Architecture Document (HLD & LLD)

| Metadata | Specification Details |
|:---|:---|
| **Document Type** | Comprehensive System Design: High-Level Design (HLD) & Low-Level Design (LLD) |
| **System Name** | **StackForge Platform Engine** |
| **Architectural Style** | Microservice-Decoupled Event-Driven Cloud Native Platform |
| **Document Version** | 3.0.0 (Visual Architecture Edition) |
| **Status** | **Approved & Production-Ready** |
| **Repository** | `satviashwin369-creator/stackforge` |
| **Base Branch** | `main` |

---

## Quick Navigation: Architecture Diagrams Index

1. [High-Level Design (HLD) Architecture Blueprint](#1-high-level-design-hld-system-architecture)
2. [Low-Level Design (LLD) Component & Class Hierarchy](#2-low-level-design-lld-component--class-hierarchy)
3. [The "Deploy Packet" Lifecycle Sequence](#3-the-deploy-packet-lifecycle--execution-sequence)
4. [Docker Container Network Topology](#4-network--docker-container-topology)
5. [Kubernetes Production Cluster Architecture](#5-kubernetes-production-cluster-architecture)
6. [PostgreSQL 1 Relational Database ERD](#6-relational-database-modeling-entity-relationship)
7. [Real-Time WebSocket Protocol State Machine](#7-real-time-websocket-protocol--state-machine)
8. [Full-Stack Observability & Telemetry Pipeline](#8-observability--telemetry-dataflow-architecture)
9. [Automated CI/CD Release Pipeline](#9-automated-cicd--artifact-release-pipeline)
10. [Systems Design Trade-Off Matrix](#10-systems-design-trade-off-matrix)

> [!TIP]
> **Interactive Browser Visualizer:** For an interactive, zoomable presentation experience with 9 tabbed diagrams and interview talking points, open [`docs/ARCHITECTURE_DIAGRAMS.html`](ARCHITECTURE_DIAGRAMS.html) directly in Chrome, Edge, or Firefox.

---

## 1. High-Level Design (HLD) System Architecture

StackForge separates interactive presentation, synchronous API ingress, asynchronous background execution, relational persistence, and full observability into dedicated container boundaries.

### 1.1 HLD Visual Architecture Diagram

![High-Level Design Architecture Diagram](diagrams/01-hld-system-architecture.svg)

<details>
<summary>▶ Click to view Mermaid.js source for HLD Diagram</summary>

```mermaid
flowchart TD
    subgraph Client ["Client & Presentation Tier (Port 3000)"]
        Browser["Developer Web Browser"]
        NextApp["Next.js 16 App Router<br/>(React 19 / Tailwind v4)"]
        Zustand["Zustand Auth Store"]
        LiveConsole["Live Terminal Console"]
    end

    subgraph Gateway ["API Ingress Tier (Port 8000)"]
        FastAPI["FastAPI 0.115 ASGI Core"]
        JWTAuth["JWT Security Layer (HS256)"]
        WSServer["WebSocket Server (/ws/logs)"]
        PrometheusMiddleware["Prometheus Middleware (/metrics)"]
    end

    subgraph AsyncTier ["Distributed Queue & Event Tier"]
        Celery["Celery 5.4 Distributed Worker Pool"]
        RedisQ[("Redis 7 Alpine (Port 6379)<br/>DB 0: WS Pub/Sub<br/>DB 1: Task Queue<br/>DB 2: Result Backend")]
    end

    subgraph DataTier ["Persistence Tier (Port 5432)"]
        Postgres[("PostgreSQL 16 Alpine<br/>ACID Relational Storage")]
    end

    subgraph Observability ["Observability Tier"]
        Prometheus["Prometheus v3.5 (Port 9090)"]
        Grafana["Grafana 12.1 (Port 3001)"]
        Loki["Grafana Loki 3.5 (Port 3100)"]
        Alloy["Grafana Alloy v1.10"]
    end

    Browser <--> NextApp
    NextApp <-->|"REST API"| FastAPI
    LiveConsole <-->|"WSS Stream (?token=JWT)"| WSServer

    FastAPI --> JWTAuth
    FastAPI --> Postgres
    FastAPI --> RedisQ
    WSServer <-->|"SUBSCRIBE"| RedisQ

    FastAPI -.->|"delay() Task"| Celery
    Celery <-->|"LPUSH / BRPOP"| RedisQ
    Celery -->|"Status & Logs"| Postgres
    Celery -->|"PUBLISH log line"| RedisQ

    FastAPI --> PrometheusMiddleware
    PrometheusMiddleware -->|"15s Scrape"| Prometheus
    Prometheus -->|"PromQL"| Grafana
    Alloy -.->|"Tails container logs"| Loki
    Loki -.->|"LogQL"| Grafana
```
</details>

### 1.2 System Layer Responsibilities

| Subsystem | Technology | Port | Responsibilities |
| :--- | :--- | :---: | :--- |
| **Presentation Tier** | Next.js 16.2.6, React 19.2.4, Tailwind v4 | `3000` | Renders dashboard UI, manages auth token hydration in cookies/Zustand, and hosts the virtualized live console. |
| **API Gateway Tier** | FastAPI 0.115.6, Uvicorn, Pydantic v2 | `8000` | Ingress validation, bcrypt password hashing, JWT creation & verification, and task dispatching. |
| **Queue & Event Hub** | Redis 7 Alpine | `6379` | Multi-role memory store: DB 0 for Pub/Sub log distribution; DB 1 as Celery FIFO broker; DB 2 for task results. |
| **Asynchronous Worker**| Celery 5.4.0 (Python 3.12) | *(None)* | Consumes deployment tasks, executes 6 pipeline stages, and streams progress chunks to Redis. |
| **Persistence Tier** | PostgreSQL 16 Alpine, SQLAlchemy 2.0 | `5432` | ACID transactional persistence for users, registered projects, deployments, and audit logs. |
| **Observability Tier**| Prometheus v3.5, Grafana 12.1, Loki 3.5 | `9090`, `3001`, `3100` | Scrapes `/metrics` every 15s, collects container logs via Alloy, and auto-provisions monitoring dashboards. |

---

## 2. Low-Level Design (LLD) Component & Class Hierarchy

The Low-Level Design models internal code organization, dependency injection wiring, and domain object contracts.

### 2.1 LLD Visual Component & Class Diagram

![Low-Level Design Component Diagram](diagrams/02-lld-component-class-design.svg)

<details>
<summary>▶ Click to view Mermaid.js source for LLD Diagram</summary>

```mermaid
classDiagram
    class FastAPIApp {
        +lifespan(app)
        +include_router(auth_router)
        +include_router(project_router)
        +include_router(deployment_router)
        +include_router(ws_router)
    }

    class User {
        +UUID id
        +String email
        +String hashed_password
        +List~Project~ projects
    }

    class Project {
        +UUID id
        +UUID user_id
        +String name
        +String repo_url
        +String branch
        +List~Deployment~ deployments
    }

    class Deployment {
        +UUID id
        +UUID project_id
        +String status
        +String commit_sha
        +Integer duration_seconds
        +List~DeploymentLog~ logs
    }

    class DeploymentLog {
        +UUID id
        +UUID deployment_id
        +String stage
        +String level
        +Text message
    }

    class AuthService {
        +verify_password(plain, hashed)
        +create_access_token(data)
        +get_current_user(token, db)
    }

    class DeploymentSimulator {
        +run_pipeline(deployment_id, redis, db)
        -execute_stage(stage, duration)
        -publish_log(channel, message)
    }

    User "1" --> "*" Project : owns
    Project "1" --> "*" Deployment : contains
    Deployment "1" --> "*" DeploymentLog : tracks

    FastAPIApp --> AuthService : uses
    FastAPIApp --> DeploymentSimulator : triggers via Celery
```
</details>

### 2.2 Three-Tier Software Architecture
1. **API Routers (`backend/app/api/v1/`):** Strict boundary handlers that parse HTTP requests, enforce security dependencies (`Depends(get_current_active_user)`), validate DTOs via Pydantic v2, and return typed responses. Zero raw SQL in routers.
2. **Domain Services (`backend/app/services/`):** Contains pure business logic. `deployment_simulator.py` manages stage progression timings and synthetic exit codes. `log_streamer.py` handles Redis channel publishing.
3. **Data Access & Models (`backend/app/models/`):** SQLAlchemy 2.0 declarative mappings with typed `Mapped[]` columns. Sessions are injected into routes using `Depends(get_db)` with automatic session closure.

---

## 3. The "Deploy Packet" Lifecycle & Execution Sequence

When a developer clicks **"Deploy Now"**, StackForge offloads execution asynchronously so the API responds in **sub-50ms** while background workers orchestrate the pipeline and broadcast logs.

### 3.1 "Deploy Packet" Visual Sequence Diagram

![Deploy Packet Sequence Diagram](diagrams/03-deploy-packet-lifecycle.svg)

<details>
<summary>▶ Click to view Mermaid.js source for Sequence Diagram</summary>

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer Browser
    participant FE as Next.js Web Console
    participant API as FastAPI Gateway (:8000)
    participant DB as PostgreSQL 16 (:5432)
    participant Redis as Redis 7 Broker (:6379)
    participant Worker as Celery Worker Pool
    participant WS as WebSocket Endpoint

    Dev->>FE: Clicks "Deploy Now"
    FE->>API: POST /api/v1/projects/{id}/deploy (Bearer JWT)
    API->>DB: INSERT INTO deployments (status='QUEUED')
    API->>Redis: LPUSH celery (execute_deployment_task)
    API-->>FE: HTTP 202 Accepted (deployment_id)
    FE-->>Dev: Opens Terminal Modal & connects WS

    Dev->>WS: Connect: ws://backend/ws/logs?token=JWT
    WS->>Redis: SUBSCRIBE "deployments:{id}:logs"

    par Background Execution Loop
        Worker->>Redis: BRPOP celery
        Worker->>DB: UPDATE status='BUILDING'
        loop 6 Pipeline Stages
            Worker->>Worker: CLONE -> INSTALL -> TEST -> BUILD -> PUSH -> DEPLOY
            Worker->>Redis: PUBLISH "deployments:{id}:logs" "[STAGE] ..."
            Redis-->>WS: Pushes Log Line
            WS-->>FE: WebSocket JSON Frame
            FE-->>Dev: Terminal auto-scrolls
        end
        Worker->>DB: UPDATE status='SUCCESS'
        Worker->>DB: Batch INSERT deployment_logs
    end
```
</details>

### 3.2 Step-by-Step Execution Journey
1. **Trigger:** Developer initiates deployment from the frontend cockpit.
2. **Ingress & Authentication:** FastAPI decodes the Bearer JWT, extracts the tenant `user_id`, and verifies project ownership.
3. **Queue Insertion:** A new record with status `QUEUED` is committed to PostgreSQL.
4. **Task Dispatch:** FastAPI dispatches `execute_deployment_task.delay(deployment_id)`. Celery pushes an execution envelope to the Redis `celery` list via `LPUSH`.
5. **Immediate Acknowledgment:** The API responds with `HTTP 202 Accepted` (`{"deployment_id": "...", "status": "QUEUED"}`) in `< 50ms`.
6. **Worker Claim:** A Celery worker claims the job via `BRPOP` and transitions the deployment status to `BUILDING`.
7. **Pipeline Progression:** The worker runs the 6 canonical stages:
   $$\text{CLONE} \longrightarrow \text{INSTALL} \longrightarrow \text{LINT\_TEST} \longrightarrow \text{BUILD} \longrightarrow \text{PUSH\_REGISTRY} \longrightarrow \text{DEPLOY\_K8S}$$
8. **Real-Time Log Broadcasting:** As each line emits, the worker publishes it to Redis channel `deployments:{id}:logs`.
9. **WebSocket Push:** Connected clients receive JSON frames over the WebSocket stream in sub-10ms.
10. **Final Persistence:** Upon completion, the deployment status updates to `SUCCESS` or `FAILED`, and the complete log buffer is batch-inserted into PostgreSQL.

---

## 4. Network & Docker Container Topology

StackForge manages 9 containers linked over an internal bridge network (`stackforge-network`). Only necessary ports are exposed to the host machine.

### 4.1 Docker Container Network Topology Diagram

![Docker Network Topology Diagram](diagrams/04-docker-container-network.svg)

<details>
<summary>▶ Click to view Mermaid.js source for Docker Topology</summary>

```mermaid
flowchart LR
    subgraph Host ["Host Ports"]
        P3000[":3000"]
        P8000[":8000"]
        P5432[":5432"]
        P6379[":6379"]
        P9090[":9090"]
        P3001[":3001"]
        P3100[":3100"]
    end

    subgraph Bridge ["Docker Bridge Network: 'stackforge-network'"]
        FE["stackforge-frontend<br/>Next.js 16 (Port 3000)"]
        BE["stackforge-backend<br/>FastAPI 0.115 (Port 8000)"]
        WK["stackforge-worker<br/>Celery 5.4 (Internal)"]
        DB["stackforge-db<br/>PostgreSQL 16 (Port 5432)"]
        RD["stackforge-redis<br/>Redis 7 (Port 6379)"]
        PR["stackforge-prometheus<br/>Prometheus v3.5 (Port 9090)"]
        GF["stackforge-grafana<br/>Grafana 12.1 (Port 3001)"]
        LK["stackforge-loki<br/>Loki 3.5 (Port 3100)"]
        AL["stackforge-alloy<br/>Alloy v1.10 (Internal)"]
    end

    P3000 <--> FE
    P8000 <--> BE
    P5432 <--> DB
    P6379 <--> RD
    P9090 <--> PR
    P3001 <--> GF
    P3100 <--> LK

    FE <--> BE
    BE <--> DB
    BE <--> RD
    WK <--> DB
    WK <--> RD
    PR -->|"Scrapes :8000/metrics"| BE
    GF -->|"PromQL"| PR
    GF -->|"LogQL"| LK
    AL -->|"Ships logs"| LK
```
</details>

### 4.2 Port & Volume Allocation Matrix

| Container Name | Service | Host Port | Internal Port | Persistent Volume Mount |
| :--- | :--- | :---: | :---: | :--- |
| `stackforge-frontend` | Next.js 16 App Router | `3000` | `3000` | Ephemeral standalone build |
| `stackforge-backend` | FastAPI Core & WebSockets | `8000` | `8000` | Ephemeral runtime container |
| `stackforge-worker` | Celery Background Worker | *(None)* | *(None)* | Ephemeral task consumer |
| `stackforge-db` | PostgreSQL 16 Database | `5432` | `5432` | `postgres_data` -> `/var/lib/postgresql/data` |
| `stackforge-redis` | Redis 7 Broker & Pub/Sub | `6379` | `6379` | In-memory with AOF persistence |
| `stackforge-prometheus`| Prometheus Metrics Server | `9090` | `9090` | `prometheus_data` -> `/prometheus` |
| `stackforge-grafana` | Grafana 12 Dashboards | `3001` | `3000` | `grafana_data` -> `/var/lib/grafana` |
| `stackforge-loki` | Loki 3.5 Log Engine | `3100` | `3100` | `loki_data` -> `/loki` |
| `stackforge-alloy` | Alloy Log Shipper | *(None)* | `12345` | Internal forwarder to Loki |

---

## 5. Kubernetes Production Cluster Architecture

StackForge provides declarative manifests in `k8s/` structured for zero-trust security contexts and cloud-native scaling.

### 5.1 Kubernetes Cluster Visual Diagram

![Kubernetes Cluster Architecture Diagram](diagrams/05-kubernetes-cluster-pods.svg)

<details>
<summary>▶ Click to view Mermaid.js source for Kubernetes Architecture</summary>

```mermaid
flowchart TD
    subgraph Ingress ["Ingress Controller"]
        Ing["stackforge.io Ingress<br/>TLS Termination & Route Routing"]
    end

    subgraph K8sNamespace ["Namespace: 'stackforge'"]
        subgraph FE_Workload ["Frontend Deployment"]
            SvcFE["frontend-service (NodePort 3000)"]
            PodFE1["frontend-pod-1 (runAsNonRoot)"]
            PodFE2["frontend-pod-2 (runAsNonRoot)"]
        end

        subgraph BE_Workload ["Backend API Deployment"]
            SvcBE["backend-service (ClusterIP 8000)"]
            PodBE1["backend-pod-1 (readOnlyRoot)"]
            PodBE2["backend-pod-2 (readOnlyRoot)"]
        end

        subgraph WK_Workload ["Celery Worker Deployment"]
            KEDA["KEDA Autoscaler<br/>LLEN celery > 10"]
            PodWK1["worker-pod-1"]
            PodWKn["worker-pod-N (Scales up to 10)"]
        end

        subgraph DB_Workload ["Data Stateful Workloads"]
            SvcPG["postgres-service (ClusterIP 5432)"]
            PodPG["postgres-0 (StatefulSet)"]
            PVCPG[("PVC: 5Gi Storage")]

            SvcRD["redis-service (ClusterIP 6379)"]
            PodRD["redis-master"]
        end
    end

    Ing -->|"/"| SvcFE
    Ing -->|"/api & /ws"| SvcBE
    SvcFE --> PodFE1 & PodFE2
    SvcBE --> PodBE1 & PodBE2

    PodBE1 & PodBE2 --> SvcPG
    PodBE1 & PodBE2 --> SvcRD

    KEDA -.-> WK_Workload
    PodWK1 & PodWKn --> SvcPG
    PodWK1 & PodWKn --> SvcRD
    PodPG --- PVCPG
```
</details>

### 5.2 Kubernetes Production Hardening Specifications
- **Security Contexts:** Backend Pods enforce `readOnlyRootFilesystem: true`, `runAsNonRoot: true`, and `capabilities: { drop: ["ALL"] }`. Frontend runs as unprivileged user `nextjs` (UID 1001).
- **Resource Governance:** Explicit requests (`100m CPU`, `128Mi RAM`) and limits (`500m CPU`, `512Mi RAM`) prevent noisy-neighbor container starvation.
- **Health Probes:** Liveness and readiness HTTP probes on `/health` ensure traffic is only routed to responsive pods.
- **KEDA Autoscaling:** Celery workers autoscale from 1 to 10 replicas based on the Redis queue length (`LLEN celery > 10`).

---

## 6. Relational Database Modeling (Entity-Relationship)

StackForge models relational data in PostgreSQL 16 using SQLAlchemy 2.0 ORM with cascade rules and indexed foreign keys.

### 6.1 Database Relational ERD Diagram

![Database Relational ERD](diagrams/06-database-relational-erd.svg)

<details>
<summary>▶ Click to view Mermaid.js source for Database ERD</summary>

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : "owns (1:N)"
    PROJECTS ||--o{ DEPLOYMENTS : "executes (1:N)"
    DEPLOYMENTS ||--o{ DEPLOYMENT_LOGS : "generates (1:N)"

    USERS {
        uuid id PK "UUIDv4 Primary Key"
        string email UK "Unique indexed email"
        string hashed_password "Bcrypt work factor 12"
        string full_name "Developer Name"
        timestamp created_at "Account creation UTC"
    }

    PROJECTS {
        uuid id PK "UUIDv4 Primary Key"
        uuid user_id FK "Foreign Key -> users.id"
        string name "Project slug name"
        string repo_url "Git HTTPS repository URL"
        string branch "Target branch (main)"
        string framework "Node.js | Python | Go | Rust"
    }

    DEPLOYMENTS {
        uuid id PK "UUIDv4 Primary Key"
        uuid project_id FK "Foreign Key -> projects.id"
        string status "QUEUED | BUILDING | SUCCESS | FAILED"
        string commit_sha "7-character commit SHA"
        string branch "Target branch"
        int duration_seconds "Execution duration"
        timestamp created_at "Queue timestamp"
    }

    DEPLOYMENT_LOGS {
        uuid id PK "UUIDv4 Primary Key"
        uuid deployment_id FK "Foreign Key -> deployments.id"
        string stage "CLONE | INSTALL | TEST | BUILD | PUSH | DEPLOY"
        string level "INFO | WARN | ERROR"
        text message "Log text output"
        timestamp timestamp "Emission timestamp"
    }
```
</details>

---

## 7. Real-Time WebSocket Protocol & State Machine

The real-time log streaming subsystem employs state transitions designed to survive network interruptions without dropping build traces.

### 7.1 WebSocket Protocol State Machine Diagram

![WebSocket Protocol State Machine](diagrams/07-websocket-realtime-protocol.svg)

<details>
<summary>▶ Click to view Mermaid.js source for WebSocket State Machine</summary>

```mermaid
stateDiagram-v2
    [*] --> DISCONNECTED
    DISCONNECTED --> CONNECTING: useLiveLogs hook fires ws://
    CONNECTING --> AUTHENTICATING: Query parameter ?token=JWT
    
    AUTHENTICATING --> AUTH_FAILED: Invalid or Expired Token
    AUTH_FAILED --> DISCONNECTED: Closes 1008 Policy Violation

    AUTHENTICATING --> HISTORICAL_SYNC: Token Validated
    HISTORICAL_SYNC --> SUBSCRIBED: Query past logs from PostgreSQL
    
    SUBSCRIBED --> STREAMING_ACTIVE: Redis SUBSCRIBE deployments:{id}:logs
    STREAMING_ACTIVE --> STREAMING_ACTIVE: Receive Log Line -> Append to Buffer

    STREAMING_ACTIVE --> CONNECTION_DROPPED: Server restart or network blip
    CONNECTION_DROPPED --> BACKOFF_RETRY: Exponential Backoff (1s -> 2s -> 4s)
    BACKOFF_RETRY --> CONNECTING: Re-attempt Handshake

    BACKOFF_RETRY --> POLLING_FALLBACK: Retry count > 5 exhausted
    POLLING_FALLBACK --> POLLING_FALLBACK: HTTP GET /logs every 3s

    STREAMING_ACTIVE --> TERMINATED: Stage == SUCCESS or FAILED
    POLLING_FALLBACK --> TERMINATED: Pipeline Completed
    TERMINATED --> [*]
```
</details>

### 7.2 WebSocket Protocol Features
- **Query Parameter Auth:** Handshakes enforce valid JWT tokens via query parameter (`?token=...`), rejecting unauthenticated requests with HTTP 403 / Close Code 1008.
- **Historical Catch-Up:** Queries previous log records from PostgreSQL before subscribing to the live Redis Pub/Sub channel.
- **Circular Buffer:** Frontend stores up to 1,000 log lines in memory to prevent DOM layout thrashing.
- **Auto-Scroll Override:** Automatically scrolls to bottom unless the developer scrolls up to inspect an error.

---

## 8. Observability & Telemetry Dataflow Architecture

StackForge implements an enterprise telemetry architecture separating numeric time-series metrics from high-throughput log streams.

### 8.1 Observability Dataflow Diagram

![Observability Dataflow Diagram](diagrams/08-observability-telemetry-pipeline.svg)

<details>
<summary>▶ Click to view Mermaid.js source for Observability Pipeline</summary>

```mermaid
flowchart TD
    subgraph AppSources ["Telemetry Producers"]
        FastAPI["FastAPI Backend (:8000)<br/>Prometheus Middleware"]
        Containers["Docker Engine Daemon<br/>Container stdout & stderr logs"]
    end

    subgraph Collection ["Scrape & Forward Tier"]
        Prometheus["Prometheus Server (:9090)<br/>Scrapes /metrics every 15s"]
        Alloy["Grafana Alloy (:12345)<br/>Dynamically discovers & labels container logs"]
    end

    subgraph TSDBEngine ["Time-Series & Chunk Engines"]
        PromTSDB[("Prometheus TSDB<br/>Metrics retention: 15 days")]
        LokiTSDB[("Grafana Loki (:3100)<br/>Compressed log chunks")]
    end

    subgraph Dashboards ["Unified Dashboards"]
        Grafana["Grafana 12.1 (:3001)<br/>Auto-Provisioned Dashboards"]
        D1["Dashboard: 'StackForge Platform Overview'<br/>- API Requests & P95 Latency<br/>- Celery Pipeline Success/Failure"]
        D2["Dashboard: 'Live Container Logs'<br/>- Real-time LogQL search"]
    end

    FastAPI -->|"Exposes /metrics"| Prometheus
    Prometheus --> PromTSDB

    Containers --> Alloy
    Alloy --> LokiTSDB

    PromTSDB -->|"PromQL"| Grafana
    LokiTSDB -->|"LogQL"| Grafana

    Grafana --- D1 & D2
```
</details>

---

## 9. Automated CI/CD & Artifact Release Pipeline

Every push to `main` triggers a complete multi-job matrix pipeline that validates code quality, executes hermetic tests, builds multi-stage Docker images, and publishes them to GitHub Container Registry (GHCR).

### 9.1 CI/CD Release Pipeline Diagram

![CI/CD Pipeline Diagram](diagrams/09-cicd-release-pipeline.svg)

<details>
<summary>▶ Click to view Mermaid.js source for CI/CD Pipeline</summary>

```mermaid
flowchart LR
    subgraph Trigger ["Trigger"]
        Push["git push origin main<br/>Pull Request #1"]
    end

    subgraph Actions ["GitHub Actions Matrix (ci.yml)"]
        subgraph Job1 ["Frontend CI"]
            L1["npm run lint"] --> L2["npx tsc --noEmit"] --> L3["npm run build"]
        end

        subgraph Job2 ["Backend CI"]
            B1["In-Memory SQLite patch"] --> B2["Mock redis at import"] --> B3["pytest tests/ -v"]
        end

        subgraph Job3 ["Docker Build & Release"]
            D1["Build backend image"]
            D2["Build frontend image"]
            D3["Publish to GHCR :latest"]
            D1 & D2 --> D3
        end
    end

    subgraph Deploy ["Target Environment"]
        K8s["Kubernetes Production Cluster<br/>kubectl apply / Argo CD"]
    end

    Push --> Job1 & Job2
    Job1 & Job2 --> Job3
    Job3 --> Deploy
```
</details>

---

## 10. Systems Design Trade-Off Matrix

Every architectural choice in StackForge balances complexity, horizontal scalability, and local developer ergonomics:

| Architectural Decision | Chosen Technology | Evaluated Alternatives | Technical Rationale & Trade-Off Analysis |
|:---|:---|:---|:---|
| **API Framework** | **FastAPI** (Python 3.12) | Django, Express / Node.js, Go Gin | **Why Chosen:** Native async/await event loop, native Pydantic v2 validation, automatic OpenAPI Swagger generation, and unified type sharing with data science/ML ecosystems. Eliminates Django's heavyweight ORM overhead. |
| **Message Broker** | **Redis 7** (In-Memory) | RabbitMQ, Apache Kafka | **Why Chosen:** StackForge needs both a task broker (for Celery) and a lightweight Pub/Sub broadcasting bus (for WebSocket streams). Redis fulfills both roles in a single 15MB container, avoiding Kafka's JVM memory footprint and ZooKeeper/KRaft cluster overhead. |
| **Telemetry Ingestion** | **Prometheus** (Pull Model) | Pushgateway, StatsD, Datadog Agent | **Why Chosen:** Pull scraping every 15s allows the monitoring system to govern ingestion rates. If the backend experiences high traffic, it does not overwhelm the monitoring pipeline with push requests. Scrapes remain lightweight HTTP requests against `/metrics`. |
| **CI Test Strategy** | **In-Memory SQLite** | Ephemeral PostgreSQL Service Container | **Why Chosen:** Running PostgreSQL inside GitHub Actions runners adds 15–20 seconds of boot time, network socket configuration, and database migration cleanup. Monkey-patching engines with SQLite at import time delivers sub-second test execution with 100% test isolation. |
| **Kubernetes Path** | **Declarative YAML (`k8s/`)** | Helm Charts, Pure Terraform Kubernetes | **Why Chosen:** Declarative manifests are universally transparent for portfolio evaluation and local Minikube testing without requiring Helm template compilation or Terraform remote state locking. |
