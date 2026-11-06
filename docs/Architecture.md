# StackForge — Systems Architecture Document (HLD & LLD)

| Metadata | Specification Details |
|:---|:---|
| **Document Type** | High-Level Design (HLD) & Low-Level Design (LLD) |
| **System Name** | **StackForge Platform Engine** |
| **Architectural Style** | Microservice-Inspired Decoupled Architecture |
| **Document Version** | 1.0.0 (Release Baseline) |
| **Status** | **Approved & Released** |

---

## 1. System Context & C4 Topological Model

StackForge is engineered as a decoupled, multi-tier Cloud Native platform. The system separates interactive client presentation, synchronous API ingress, asynchronous background task queuing, relational storage, and real-time observability into dedicated containerized boundaries.

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer"]
        Browser["User Web Browser"]
    end

    subgraph PresentationTier ["Presentation Tier (Port 3000)"]
        NextApp["Next.js 16 App Router<br/>(React 19, TypeScript, Tailwind CSS)"]
        ZustandStore["Zustand Auth Store<br/>(Local Storage + Cookie Hydration)"]
        WSClient["useLiveLogs Client<br/>(WebSocket / Polling Fallback)"]
    end

    subgraph APITier ["Application & Ingress Tier (Port 8000)"]
        FastAPI["FastAPI 0.115 Engine<br/>(Uvicorn ASGI Server)"]
        JWTAuth["JWT Security Layer<br/>(Passlib Bcrypt + HS256)"]
        Router["RESTful Sub-Routers<br/>(/auth, /projects, /deployments, /infra)"]
        WSServer["WebSocket Server<br/>(/api/v1/ws/logs/{id})"]
        PrometheusClient["Prometheus Client Middleware<br/>(Exporting /metrics)"]
    end

    subgraph AsyncTier ["Asynchronous Queue Tier"]
        CeleryWorker["Celery 5.4 Task Worker<br/>(app.celery_app.celery_app)"]
        Redis[("Redis 7 Alpine<br/>Port 6379<br/>DB 0: WS Pub/Sub<br/>DB 1: Celery Broker<br/>DB 2: Celery Results")]
    end

    subgraph DataTier ["Persistence Tier (Port 5432)"]
        Postgres[("PostgreSQL 16 Alpine<br/>Relational Storage<br/>(Users, Projects, Deployments, Logs)")]
    end

    subgraph TelemetryTier ["Observability Tier"]
        Prometheus["Prometheus v3.5<br/>Port 9090<br/>(15s Pull Scraper)"]
        Grafana["Grafana 12.1.1<br/>Port 3001<br/>(Auto-Provisioned Dashboards)"]
        Loki["Grafana Loki 3.5<br/>Port 3100<br/>(Log Storage Engine)"]
        Alloy["Grafana Alloy v1.10<br/>(Container Log Discoverer)"]
    end

    Browser <-->|HTTP / WebSocket| NextApp
    NextApp <-->|REST API Proxy| FastAPI
    WSClient <-->|Authenticated JWT TCP| WSServer
    
    FastAPI --> JWTAuth
    FastAPI --> Router
    FastAPI --> Postgres
    FastAPI --> Redis
    WSServer <--> Redis
    
    FastAPI -.->|run_deployment_task.delay| CeleryWorker
    CeleryWorker <--> Redis
    CeleryWorker --> Postgres

    FastAPI --> PrometheusClient
    PrometheusClient -->|15s Pull Scrape| Prometheus
    Prometheus -->|Datasource Proxy| Grafana
    Alloy -.->|Tails /var/lib/docker/containers| Loki
    Loki -.->|Datasource Proxy| Grafana
```

---

## 2. High-Level Design (HLD)

### 2.1 Component Layer Responsibilities

| Tier / Subsystem | Primary Technologies | Operational Responsibilities |
|:---|:---|:---|
| **Presentation Tier** | Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide, Recharts | Renders developer dashboard, manages client authentication state, executes rewrite proxies to backend, and maintains live streaming log consoles. |
| **API Ingress Tier** | FastAPI 0.115, Uvicorn, SQLAlchemy 2.0, Pydantic v2 | Validates incoming payloads, issues signed JWT tokens, enforces role-based endpoint access, executes project CRUD, and coordinates Celery task dispatches. |
| **Asynchronous Queue Tier**| Celery 5.4, Redis 7 (broker `db 1`, results `db 2`) | Consumes background pipeline tasks, manages execution state transitions, and streams step-by-step progress logs to Redis channels. |
| **Persistence Tier** | PostgreSQL 16 Alpine, SQLAlchemy ORM | Guarantees ACID relational consistency for user credentials, microservice catalog metadata, historical deployment runs, and system audit logs. |
| **Core Observability** | Prometheus v3.5, Grafana 12.1 | Scrapes application runtime performance metrics (latency, HTTP error rates, memory) and visualizes platform KPIs without manual dashboard creation. |
| **Advanced Logging Profile**| Grafana Loki 3.5, Grafana Alloy v1.10 | Discovers Docker container standard output streams dynamically and indexes them with service labels for centralized query analysis. |

---

## 3. Low-Level Design (LLD) & Data Packet Journeys

### 3.1 The Complete Journey of a "Deploy" Packet
To understand how StackForge achieves zero-blocking asynchronous execution, trace the exact lifecycle of an execution request:

```mermaid
sequenceDiagram
    autonumber
    actor User as Developer Browser
    participant FE as Next.js Frontend
    participant API as FastAPI Backend
    participant Redis as Redis Broker / PubSub
    participant Worker as Celery Worker
    participant DB as PostgreSQL
    participant WS as WebSocket Client

    User->>FE: Clicks "Trigger Deployment"
    FE->>API: POST /api/v1/deployments (Bearer JWT, project_id)
    API->>DB: Query Project & Insert Deployment (status="queued")
    API->>Redis: Dispatch Celery Task (run_deployment_task.delay)
    API-->>FE: HTTP 201 Created (DeploymentRead payload)
    
    par Asynchronous Execution
        Worker->>Redis: Polls celery queue & claims task
        Worker->>DB: Update status="building"
        Worker->>Redis: Publish to "deployment:status:{id}" ("building")
        Worker->>Redis: Publish log lines to "deployment:logs:{id}"
        Worker->>DB: Append LogEntry records
        Worker->>DB: Update status="success" & duration_seconds
    and Real-Time Client Streaming
        User->>WS: Connects to /api/v1/ws/logs/{id}?token=<JWT>
        WS->>API: Handshake verification (decode_access_token)
        API->>DB: Query historical logs & send to client
        API->>Redis: SUBSCRIBE to "deployment:logs:{id}"
        Redis-->>API: Stream published log line
        API-->>WS: Push log JSON over WebSocket
        WS-->>User: Console auto-scrolls with live build output
    end
```

### 3.2 Resilient Fallback Mechanics

#### A. Backend Task Dispatch Fallback
In production environments, message brokers or worker processes can experience transient outages. StackForge implements an automatic in-process fallback in `backend/app/api/routes/deployments.py`:
```python
try:
    from app.celery_app import run_deployment_task
    run_deployment_task.delay(str(deployment.id))
except Exception:
    # Graceful fallback: execute in-process if Celery or Redis is offline
    background_tasks.add_task(run_deployment_pipeline, deployment.id)
```
*Design Outcome:* If Redis or the Celery worker is stopped, the user's deployment never stalls in an unhandled 500 error; FastAPI's internal `BackgroundTasks` takes over and executes the pipeline in an async background thread.

#### B. Client WebSocket Polling Fallback
Corporate firewalls, legacy proxies, or network glitches frequently terminate WebSocket connections. StackForge's React hook `useLiveLogs` in `frontend/hooks/use-live-logs.ts` guards against this:
1. It attempts to connect to `ws://localhost:8000/api/v1/ws/logs/{id}?token=...`.
2. If the connection fails or closes unexpectedly, it automatically activates an HTTP polling loop against `GET /api/v1/logs/deployment/{id}` every 3 seconds.
3. The developer continues seeing live log entries without interface interruption.

---

## 4. Relational Database Modeling (Entity-Relationship)

StackForge uses PostgreSQL 16 managed via SQLAlchemy 2.0 ORM models. The database schema strictly enforces relational integrity and user isolation:

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : "owns"
    PROJECTS ||--o{ DEPLOYMENTS : "executes"
    DEPLOYMENTS ||--o{ LOGS : "generates"

    USERS {
        uuid id PK "UUID4 primary key"
        string email UK "Unique index, max 255"
        string hashed_password "Bcrypt cryptographic hash"
        string full_name "Developer display name"
        timestamp created_at "UTC creation timestamp"
        timestamp updated_at "UTC update timestamp"
    }

    PROJECTS {
        uuid id PK "UUID4 primary key"
        uuid user_id FK "Foreign key -> users.id (indexed)"
        string name "Project slug name"
        string description "Service purpose"
        string status "running | stopped | failing"
        string framework "Node.js | Go | Python | FastAPI"
        string repo "Git repository URL"
        string branch "Target deployment branch"
        timestamp created_at "UTC creation timestamp"
    }

    DEPLOYMENTS {
        uuid id PK "UUID4 primary key"
        uuid project_id FK "Foreign key -> projects.id (indexed)"
        string status "queued | building | deploying | success | failed"
        string commit "Git commit 7-char SHA"
        string commit_message "Commit headline"
        string branch "Active branch"
        string author "Developer or automated trigger"
        string environment "production | staging"
        int duration_seconds "Total pipeline run duration"
        timestamp created_at "UTC queue timestamp"
        timestamp finished_at "UTC termination timestamp"
    }

    LOGS {
        uuid id PK "UUID4 primary key"
        uuid deployment_id FK "Foreign key -> deployments.id (indexed)"
        string service "Service name tag"
        string level "info | warn | error | debug"
        text message "Log line text content"
        timestamp timestamp "UTC log emission time"
    }
```

---

## 5. Systems Design Trade-Off Matrix

Every architectural choice in StackForge represents a calculated balance between complexity, scalability, and local developer ergonomics:

| Architectural Decision | Chosen Technology | Evaluated Alternatives | Technical Rationale & Trade-Off Analysis |
|:---|:---|:---|:---|
| **API Framework** | **FastAPI** (Python 3.12) | Django, Express / Node.js, Go Gin | **Why Chosen:** Native async/await event loop, native Pydantic v2 validation, automatic OpenAPI Swagger generation, and unified type sharing with data science/ML ecosystems. Eliminates Django's heavyweight ORM overhead. |
| **Message Broker** | **Redis 7** (In-Memory) | RabbitMQ, Apache Kafka | **Why Chosen:** StackForge needs both a task broker (for Celery) and a lightweight Pub/Sub broadcasting bus (for WebSocket streams). Redis fulfills both roles in a single 15MB container, avoiding Kafka's JVM memory footprint and ZooKeeper/KRaft cluster overhead. |
| **Telemetry Ingestion** | **Prometheus** (Pull Model) | Pushgateway, StatsD, Datadog Agent | **Why Chosen:** Pull scraping every 15s allows the monitoring system to govern ingestion rates. If the backend experiences high traffic, it does not overwhelm the monitoring pipeline with push requests. Scrapes remain lightweight HTTP requests against `/metrics`. |
| **CI Test Strategy** | **In-Memory SQLite** | Ephemeral PostgreSQL Service Container | **Why Chosen:** Running PostgreSQL inside GitHub Actions runners adds 15–20 seconds of boot time, network socket configuration, and database migration cleanup. Monkey-patching engines with SQLite at import time delivers sub-second test execution with 100% test isolation. |
| **Kubernetes Path** | **Declarative YAML (`k8s/`)** | Helm Charts, Pure Terraform Kubernetes | **Why Chosen:** Declarative manifests are universally transparent for junior/mid-level portfolio evaluation and local Minikube testing without requiring Helm template compilation or Terraform remote state locking. |

---

## 6. Repository Directory Structure & Component Map

The repository maintains strict separation of concerns across infrastructure, presentation, API, and documentation modules:

```text
stackforge/
├── .github/workflows/
│   └── ci.yml                 # GitHub Actions pipeline (Frontend, Backend, GHCR Publish)
├── backend/                   # FastAPI Application Core
│   ├── app/
│   │   ├── api/routes/        # Sub-routers (auth, projects, deployments, ws, logs, infra)
│   │   ├── core/              # Config (pydantic-settings), Security (bcrypt, JWT), Logging
│   │   ├── db/                # SQLAlchemy session factory and declarative base
│   │   ├── models/            # SQLAlchemy database entities (User, Project, Deployment, Log)
│   │   ├── schemas/           # Pydantic validation schemas (Request / Response DTOs)
│   │   ├── services/          # Business logic (Auth, Deployment, Simulator, Log, Infra)
│   │   ├── utils/             # Redis client wrapper and demo database seeder
│   │   ├── celery_app.py      # Celery instance configuration and task definitions
│   │   └── main.py            # FastAPI lifespan manager, middleware, and entrypoint
│   ├── tests/                 # Automated Test Suite (Isolated SQLite fixtures)
│   │   ├── conftest.py        # Import-time engine monkey-patching fixture
│   │   ├── test_auth.py       # Authentication unit and integration tests
│   │   ├── test_projects.py   # Project CRUD lifecycle and isolation tests
│   │   ├── test_ws.py         # WebSocket authentication and token validation tests
│   │   └── run_tests.py       # Zero-dependency standalone test runner
│   ├── Dockerfile             # Multi-stage production Python container definition
│   └── requirements.txt       # Pinned production Python dependencies
├── frontend/                  # Next.js 16 Web Dashboard
│   ├── app/                   # App Router structure
│   │   ├── (auth)/            # Public route group (Login, Sign Up)
│   │   ├── dashboard/         # Protected route group (Overview, Projects, Deployments)
│   │   └── layout.tsx         # Root layout with theme and session providers
│   ├── components/            # UI components (Atomic Radix/Tailwind and Dashboard panels)
│   ├── hooks/                 # Custom React hooks (useLiveLogs, usePolling, useAsyncData)
│   ├── lib/                   # API client fetch wrappers, types, and cookie managers
│   ├── stores/                # Zustand client state stores (auth-store.ts)
│   └── Dockerfile             # Multi-stage Node.js standalone container definition
├── k8s/                       # Hardened Declarative Kubernetes Manifests
│   ├── namespace.yaml         # Dedicated 'stackforge' namespace
│   ├── secret.yaml.example    # Committed placeholder secret template
│   ├── backend/               # FastAPI & Celery Worker Deployments and Services
│   ├── database/              # PostgreSQL Deployment, ClusterIP Service, 5Gi PVC
│   ├── frontend/              # Next.js Deployment & NodePort Service
│   └── redis/                 # Redis Deployment & ClusterIP Service
├── monitoring/                # Observability Configuration
│   ├── alloy/config.alloy     # Grafana Alloy dynamic Docker container log discovery
│   ├── grafana/               # Auto-provisioned Prometheus/Loki datasources and dashboards
│   ├── loki/loki-config.yml   # Grafana Loki storage and TSDB index configuration
│   └── prometheus/            # Prometheus scrape configuration (15s backend:8000 target)
├── terraform/                 # Infrastructure as Code (HashiCorp Kubernetes Provider)
│   ├── main.tf                # Declarative Kubernetes resources (Namespace, PVC, Workloads)
│   ├── variables.tf           # Parameterized inputs with sensitive=true protection
│   └── terraform.tfvars.example # Safe credential template
├── docker-compose.yml         # Multi-profile orchestration (7 core, 2 logging)
├── PROJECT_LOG.md             # Comprehensive engineering diary and milestone log
└── README.md                  # Public portfolio presentation and quick-start guide
```
