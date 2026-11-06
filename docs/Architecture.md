# StackForge — Systems Architecture Document (HLD & LLD)

| Metadata | Specification Details |
|:---|:---|
| **Document Type** | Comprehensive System Design: High-Level Design (HLD) & Low-Level Design (LLD) |
| **System Name** | **StackForge Platform Engine** |
| **Architectural Style** | Microservice-Decoupled Event-Driven Cloud Native Platform |
| **Document Version** | 2.0.0 (Complete System Design Edition) |
| **Status** | **Approved & Production-Ready** |
| **Repository** | `satviashwin369-creator/stackforge` |
| **Base Branch** | `main` |

---

## 1. System Design Context & C4 Architectural Model

StackForge is engineered as a decoupled, multi-tier Cloud Native developer platform. The system cleanly separates interactive client presentation, synchronous API ingress, asynchronous background task queuing, relational storage, and real-time observability into dedicated, isolated container boundaries.

### 1.1 C4 Context & Container Topology Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["1. Client & Presentation Layer"]
        Browser["User Web Browser (Developer Cockpit)"]
        NextApp["Next.js 16 App Router<br/>(Port 3000 / React 19 / Tailwind v4)"]
        ZustandStore["Zustand Auth Store<br/>(Token Hydration & Role Guards)"]
        WSClient["useLiveLogs Client<br/>(WebSocket / Polling Fallback)"]
    end

    subgraph IngressTier ["2. API & Ingress Gateway Tier (Port 8000)"]
        FastAPI["FastAPI 0.115 ASGI Engine<br/>(Uvicorn Multi-Worker)"]
        JWTAuth["JWT Security Layer<br/>(Bcrypt Work 12 + HS256)"]
        APIRouters["REST Sub-Routers<br/>(/auth, /projects, /deployments, /infra)"]
        WSServer["WebSocket Server<br/>(/api/v1/ws/logs/{id})"]
        PrometheusClient["Prometheus Middleware<br/>(Exposes /metrics)"]
    end

    subgraph AsyncTier ["3. Asynchronous Queue & Event Tier"]
        CeleryWorker["Celery 5.4 Distributed Worker Pool<br/>(execute_deployment_task)"]
        RedisPubSub[("Redis 7 Alpine (Port 6379)<br/>DB 0: WebSocket Pub/Sub<br/>DB 1: Celery FIFO Broker<br/>DB 2: Celery Result Backend")]
    end

    subgraph PersistenceTier ["4. Relational Persistence Tier (Port 5432)"]
        Postgres[("PostgreSQL 16 Alpine<br/>ACID Storage with Connection Pooling<br/>(Users, Projects, Deployments, Logs)")]
    end

    subgraph ObservabilityTier ["5. Full Observability & Telemetry Tier"]
        Prometheus["Prometheus v3.5 (Port 9090)<br/>15s Pull Scraper & TSDB Engine"]
        Grafana["Grafana 12.1.1 (Port 3001)<br/>Auto-Provisioned Dashboards"]
        Loki["Grafana Loki 3.5 (Port 3100)<br/>Chunk-Based Log Storage"]
        Alloy["Grafana Alloy v1.10<br/>Dynamic Container Log Forwarder"]
    end

    Browser <-->|"HTTPS / WSS"| NextApp
    NextApp <-->|"REST API Client"| FastAPI
    WSClient <-->|"Authenticated TCP Frame (?token=JWT)"| WSServer

    FastAPI --> JWTAuth
    FastAPI --> APIRouters
    FastAPI --> Postgres
    FastAPI --> RedisPubSub
    WSServer <-->|"SUBSCRIBE deployment:logs:{id}"| RedisPubSub

    FastAPI -.->|"Task Delay (Task ID Envelope)"| CeleryWorker
    CeleryWorker <-->|"LPUSH / BRPOP Jobs"| RedisPubSub
    CeleryWorker -->|"Persist Status & Logs"| Postgres
    CeleryWorker -->|"PUBLISH deployment:logs:{id}"| RedisPubSub

    FastAPI --> PrometheusClient
    PrometheusClient -->|"15s Scrape Loop"| Prometheus
    Prometheus -->|"PromQL Datasource"| Grafana
    Alloy -.->|"Tails /var/lib/docker/containers"| Loki
    Loki -.->|"LogQL Datasource"| Grafana
```

---

## 2. High-Level Design (HLD) — System Design Blueprint

The High-Level Design defines the system boundaries, ingress pathways, decoupled microservices, and protocols that govern how traffic flows through the platform.

### 2.1 Complete HLD Architecture Blueprint

```mermaid
flowchart TD
    subgraph ExternalWorld ["External Traffic & Users"]
        Developer["Platform Engineer / Developer"]
        GitRepo["Git VCS (GitHub / GitLab / Bitbucket)"]
    end

    subgraph EdgeIngress ["Edge & Reverse Proxy Ingress Tier"]
        IngressProxy["Nginx / Traefik / K8s Ingress Controller<br/>(TLS 1.3 Termination, Route Routing)"]
    end

    subgraph WebFrontendTier ["Web Frontend Tier (Next.js 16)"]
        RouteAuth["/ (auth) Group<br/>Login, Sign Up, Recovery"]
        RouteDash["/ (dashboard) Group<br/>Overview, Projects, Deployments, Infra"]
        ConsoleEngine["Live Console Subsystem<br/>Circular Log Buffer (1,000 lines)"]
    end

    subgraph APICoreTier ["Backend Core API Tier (FastAPI 0.115)"]
        AuthMiddleware["JWT Authentication Middleware<br/>Extracts Bearer Token / Validates Subject"]
        ProjectService["Project Management Service<br/>Repository validation, Git metadata"]
        DeploymentService["Deployment Orchestration Service<br/>State transitions, validation"]
        InfraService["Infrastructure Telemetry Service<br/>Node CPU, RAM, and Pod metrics"]
        WSHub["WebSocket Connection Gateway<br/>Manages active client sessions"]
    end

    subgraph QueueBrokerTier ["Distributed Task & Event Hub (Redis 7)"]
        QueueDeploy["Celery Task Queue: 'celery'<br/>(FIFO Task Envelope)"]
        PubSubChannel["Redis Pub/Sub Channel: 'deployments:{id}:logs'<br/>(Ephemeral Log Event Streaming)"]
        ResultBackend["Celery Task Result Store<br/>(Task Success/Failure metadata)"]
    end

    subgraph WorkerTier ["Background Worker Tier (Celery 5.4)"]
        TaskConsumer["Celery Worker Process (O-Fair Scheduling)"]
        StageRunner["Pipeline Stage Runner<br/>CLONE -> INSTALL -> TEST -> BUILD -> PUSH -> DEPLOY"]
    end

    subgraph DatabaseTier ["Persistence Tier (PostgreSQL 16)"]
        SQLAlchemyEngine["SQLAlchemy 2.0 Pool (size=10, max_overflow=20)"]
        TableUsers[("users: UUID, email, hashed_password")]
        TableProjects[("projects: UUID, name, repo_url, user_id")]
        TableDeployments[("deployments: UUID, project_id, status, commit")]
        TableLogs[("deployment_logs: UUID, deployment_id, message, level")]
    end

    Developer -->|"1. HTTPS / WSS"| IngressProxy
    IngressProxy -->|"Path / -> Port 3000"| WebFrontendTier
    IngressProxy -->|"Path /api -> Port 8000"| APICoreTier
    IngressProxy -->|"Path /ws -> Port 8000"| WSHub

    RouteDash -->|"2. REST Request (Bearer JWT)"| APICoreTier
    APICoreTier --> AuthMiddleware
    AuthMiddleware --> ProjectService
    AuthMiddleware --> DeploymentService

    DeploymentService -->|"3. Insert Record (status='QUEUED')"| SQLAlchemyEngine
    SQLAlchemyEngine --> TableDeployments

    DeploymentService -->|"4. Dispatch Task (execute_deployment.delay)"| QueueDeploy
    QueueDeploy --> TaskConsumer
    TaskConsumer --> StageRunner

    StageRunner -->|"5. Update status='BUILDING'/'SUCCESS'"| SQLAlchemyEngine
    StageRunner -->|"6. Store Final Log Batch"| TableLogs
    StageRunner -->|"7. Stream Chunks (PUBLISH)"| PubSubChannel

    PubSubChannel -->|"8. Push to Active Subscribers"| WSHub
    WSHub -->|"9. WebSocket Frames"| ConsoleEngine
```

---

## 3. Low-Level Design (LLD) — Component & Class Hierarchy

The Low-Level Design defines the internal software architecture, dependency injection contracts, and object relationships across backend and frontend codebases.

### 3.1 Backend Class & Component Architecture

```mermaid
classDiagram
    class FastAPIApp {
        +lifespan(app)
        +include_router()
        +add_middleware(CORSMiddleware)
        +add_middleware(PrometheusMiddleware)
    }

    class BaseDBModel {
        +UUID id
        +DateTime created_at
        +DateTime updated_at
    }

    class User {
        +String email
        +String hashed_password
        +String full_name
        +List~Project~ projects
    }

    class Project {
        +UUID user_id
        +String name
        +String repo_url
        +String branch
        +String framework
        +List~Deployment~ deployments
    }

    class Deployment {
        +UUID project_id
        +String status
        +String commit_sha
        +String commit_message
        +Integer duration_seconds
        +List~DeploymentLog~ logs
    }

    class DeploymentLog {
        +UUID deployment_id
        +String stage
        +String level
        +Text message
        +DateTime timestamp
    }

    class AuthService {
        +verify_password(plain, hashed) bool
        +get_password_hash(password) str
        +create_access_token(data, expires) str
        +get_current_user(token, db) User
    }

    class DeploymentService {
        +trigger_deployment(project_id, user_id, db) Deployment
        +get_deployment(deployment_id, db) Deployment
        +list_deployments(project_id, db) List~Deployment~
    }

    class DeploymentSimulator {
        +run_pipeline(deployment_id, redis_client, db) void
        -execute_stage(stage_name, duration, fail_rate) bool
        -publish_log(channel, stage, message) void
    }

    class CeleryTasks {
        +execute_deployment_task(deployment_id) dict
    }

    BaseDBModel <|-- User
    BaseDBModel <|-- Project
    BaseDBModel <|-- Deployment
    BaseDBModel <|-- DeploymentLog

    User "1" --> "*" Project : owns
    Project "1" --> "*" Deployment : has
    Deployment "1" --> "*" DeploymentLog : generates

    FastAPIApp --> AuthService : uses
    FastAPIApp --> DeploymentService : calls
    DeploymentService --> CeleryTasks : dispatches
    CeleryTasks --> DeploymentSimulator : executes
```

---

## 4. The "Deploy Packet" Lifecycle & Execution Sequence

When a developer clicks **"Deploy Now"**, StackForge offloads execution asynchronously so the API responds in sub-50ms while background workers orchestrate the pipeline.

### 4.1 Detailed Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer Browser
    participant FE as Next.js Web Console
    participant API as FastAPI Gateway (:8000)
    participant Auth as JWT Security Guard
    participant DB as PostgreSQL 16 (:5432)
    participant Redis as Redis 7 Broker (:6379)
    participant Worker as Celery Worker Pool
    participant Sim as Pipeline Stage Runner
    participant WS as WebSocket Endpoint

    Dev->>FE: Clicks "Deploy Now" (branch="main")
    FE->>API: POST /api/v1/projects/{id}/deploy (Bearer JWT)
    API->>Auth: decode_token(access_token)
    Auth-->>API: User Context (UUID, email)
    
    API->>DB: INSERT INTO deployments (status='QUEUED', commit_sha='a1b2c3d')
    DB-->>API: Deployment Entity (UUID: dep-987)
    
    API->>Redis: LPUSH celery "execute_deployment_task(dep-987)"
    Redis-->>API: Task Enqueued
    
    API-->>FE: HTTP 202 Accepted {"deployment_id": "dep-987", "status": "QUEUED"}
    FE-->>Dev: UI opens Live Terminal modal & initiates WebSocket connection
    
    Dev->>WS: Connect: ws://backend:8000/api/v1/ws/logs/dep-987?token=<JWT>
    WS->>Auth: Validate JWT Query Token
    Auth-->>WS: Validated
    WS->>Redis: SUBSCRIBE "deployments:dep-987:logs"
    
    par Async Celery Execution Loop
        Worker->>Redis: BRPOP celery (Pops dep-987)
        Worker->>DB: UPDATE deployments SET status='BUILDING'
        Worker->>Sim: Start 6-Stage Pipeline
        
        loop Stage: CLONE -> INSTALL -> TEST -> BUILD -> PUSH -> DEPLOY
            Sim->>Sim: Run Stage Command
            Sim->>Redis: PUBLISH "deployments:dep-987:logs" "[STAGE] Compiling assets..."
            Redis-->>WS: Streamed Log Line
            WS-->>FE: WebSocket JSON Frame
            FE-->>Dev: Terminal auto-scrolls line in emerald/amber font
        end
        
        Sim->>DB: UPDATE deployments SET status='SUCCESS', duration=34s
        Sim->>DB: INSERT INTO deployment_logs (batch insert all lines)
        Sim->>Redis: PUBLISH "deployments:dep-987:logs" "[COMPLETED] Deployment succeeded."
    end
```

---

## 5. Real-Time WebSocket & Connection Protocol State Machine

The real-time log streaming subsystem employs state transitions designed to survive network interruptions without dropping build traces.

### 5.1 Protocol State Machine Diagram

```mermaid
stateDiagram-v2
    [*] --> DISCONNECTED: Initial Component Mount
    
    DISCONNECTED --> CONNECTING: useLiveLogs hook fires ws:// endpoint
    CONNECTING --> AUTHENTICATING: Handshake with ?token=<JWT>
    
    AUTHENTICATING --> AUTH_FAILED: Invalid or Expired JWT
    AUTH_FAILED --> DISCONNECTED: Closes code 1008 (Policy Violation)
    
    AUTHENTICATING --> HISTORICAL_SYNC: Token Validated
    HISTORICAL_SYNC --> SUBSCRIBED: Query & Stream Past Logs from PostgreSQL
    
    SUBSCRIBED --> STREAMING_ACTIVE: Redis SUBSCRIBE "deployments:{id}:logs"
    STREAMING_ACTIVE --> STREAMING_ACTIVE: Receiving JSON Chunks -> Render in Terminal
    
    STREAMING_ACTIVE --> CONNECTION_DROPPED: Network Blip / Server Restart
    
    CONNECTION_DROPPED --> BACKOFF_RETRY: Exponential Backoff (1s -> 2s -> 4s -> 8s)
    BACKOFF_RETRY --> CONNECTING: Attempt Reconnection
    
    BACKOFF_RETRY --> POLLING_FALLBACK: Retry count > 5 Exhausted
    POLLING_FALLBACK --> POLLING_FALLBACK: HTTP GET /api/v1/deployments/{id}/logs every 3s
    
    STREAMING_ACTIVE --> TERMINATED: Pipeline Completed ([EOF] signal)
    POLLING_FALLBACK --> TERMINATED: Deployment status == SUCCESS/FAILED
    
    TERMINATED --> [*]
```

---

## 6. Network & Docker Container Topology Diagram

StackForge manages 9 containers linked over an internal bridge network (`stackforge-network`). Only necessary ports are exposed to the host machine.

### 6.1 Container Network & Volume Topology Diagram

```mermaid
flowchart LR
    subgraph HostEnvironment ["Host Machine (Windows / Linux / macOS)"]
        Port3000["Host Port :3000"]
        Port8000["Host Port :8000"]
        Port5432["Host Port :5432"]
        Port6379["Host Port :6379"]
        Port9090["Host Port :9090"]
        Port3001["Host Port :3001"]
        Port3100["Host Port :3100"]
    end

    subgraph DockerBridge ["Internal Docker Network: 'stackforge-network'"]
        subgraph AppServices ["Application Pods"]
            C_Front["stackforge-frontend<br/>Next.js 16 (Port 3000)"]
            C_Back["stackforge-backend<br/>FastAPI (Port 8000)"]
            C_Work["stackforge-worker<br/>Celery 5.4 (No Host Port)"]
        end

        subgraph CoreDataServices ["Data Infrastructure"]
            C_DB["stackforge-db<br/>PostgreSQL 16 (Port 5432)"]
            C_Redis["stackforge-redis<br/>Redis 7 (Port 6379)"]
        end

        subgraph MonitoringServices ["Observability Cluster"]
            C_Prom["stackforge-prometheus<br/>Prometheus v3.5 (Port 9090)"]
            C_Graf["stackforge-grafana<br/>Grafana 12.1 (Port 3001)"]
            C_Loki["stackforge-loki<br/>Loki 3.5 (Port 3100)"]
            C_Alloy["stackforge-alloy<br/>Alloy v1.10 (Internal Port 12345)"]
        end
    end

    subgraph DockerVolumes ["Docker Persistent Volumes"]
        Vol_DB[("postgres_data")]
        Vol_Prom[("prometheus_data")]
        Vol_Graf[("grafana_data")]
        Vol_Loki[("loki_data")]
    end

    Port3000 <--> C_Front
    Port8000 <--> C_Back
    Port5432 <--> C_DB
    Port6379 <--> C_Redis
    Port9090 <--> C_Prom
    Port3001 <--> C_Graf
    Port3100 <--> C_Loki

    C_Front <--> C_Back
    C_Back <--> C_DB
    C_Back <--> C_Redis
    C_Work <--> C_DB
    C_Work <--> C_Redis

    C_Prom -->|"Scrapes /metrics"| C_Back
    C_Graf -->|"Queries PromQL"| C_Prom
    C_Graf -->|"Queries LogQL"| C_Loki
    C_Alloy -->|"Ships Container Logs"| C_Loki

    C_DB --- Vol_DB
    C_Prom --- Vol_Prom
    C_Graf --- Vol_Graf
    C_Loki --- Vol_Loki
```

---

## 7. Kubernetes Production Cluster Architecture Diagram

StackForge provides declarative manifests in `k8s/` structured for zero-trust security contexts and cloud-native scaling.

### 7.1 Kubernetes Pod & Ingress Topology

```mermaid
flowchart TD
    subgraph IngressLayer ["Kubernetes Ingress & TLS Gateway"]
        Ingress["Ingress: stackforge.io<br/>(TLS termination, path routing)"]
    end

    subgraph NamespaceStackforge ["Namespace: 'stackforge'"]
        subgraph FrontendWorkload ["Frontend Deployment"]
            Svc_FE["Service: frontend-service<br/>(NodePort :3000)"]
            Pod_FE1["Pod: frontend-replica-1<br/>(runAsNonRoot: true)"]
            Pod_FE2["Pod: frontend-replica-2<br/>(runAsNonRoot: true)"]
        end

        subgraph BackendWorkload ["Backend API Deployment"]
            Svc_BE["Service: backend-service<br/>(ClusterIP :8000)"]
            Pod_BE1["Pod: backend-replica-1<br/>(readOnlyRoot: true)"]
            Pod_BE2["Pod: backend-replica-2<br/>(readOnlyRoot: true)"]
            Pod_BE3["Pod: backend-replica-3<br/>(readOnlyRoot: true)"]
        end

        subgraph WorkerWorkload ["Worker Deployment & Autoscaling"]
            KEDA["KEDA Autoscaler<br/>Trigger: Redis LLEN celery > 10"]
            Pod_W1["Pod: worker-replica-1"]
            Pod_W2["Pod: worker-replica-2"]
            Pod_Wn["Pod: worker-replica-N"]
        end

        subgraph StatefulServices ["Stateful Data Services"]
            Svc_PG["Service: postgres-service<br/>(ClusterIP :5432)"]
            Pod_PG["Pod: postgresql-0<br/>StatefulSet / Deployment"]
            PVC_PG[("PersistentVolumeClaim<br/>5Gi ReadWriteOnce")]

            Svc_RD["Service: redis-service<br/>(ClusterIP :6379)"]
            Pod_RD["Pod: redis-master"]
        end

        subgraph ConfigAndSecurity ["Configuration & Secrets"]
            Secret["Kubernetes Secret: stackforge-secret<br/>(POSTGRES_PASSWORD, JWT_SECRET_KEY)"]
            ConfigMap["ConfigMap: backend-config<br/>(DATABASE_URL, REDIS_URL, CORS_ORIGINS)"]
        end
    end

    Ingress -->|"Path /"| Svc_FE
    Ingress -->|"Path /api & /ws"| Svc_BE

    Svc_FE --> Pod_FE1
    Svc_FE --> Pod_FE2

    Svc_BE --> Pod_BE1
    Svc_BE --> Pod_BE2
    Svc_BE --> Pod_BE3

    Pod_BE1 --> Svc_PG
    Pod_BE1 --> Svc_RD
    Pod_BE2 --> Svc_PG
    Pod_BE2 --> Svc_RD

    KEDA -.->|"Scales Replicas (1..10)"| WorkerWorkload
    Pod_W1 --> Svc_PG
    Pod_W1 --> Svc_RD
    Pod_W2 --> Svc_PG
    Pod_W2 --> Svc_RD

    Pod_PG --- PVC_PG

    Secret -.->|"Injected via envFrom"| BackendWorkload
    Secret -.->|"Injected via envFrom"| WorkerWorkload
    ConfigMap -.->|"Injected via envFrom"| BackendWorkload
    ConfigMap -.->|"Injected via envFrom"| WorkerWorkload
```

---

## 8. Relational Database Modeling (Entity-Relationship)

StackForge models relational data in PostgreSQL 16 using SQLAlchemy 2.0 ORM with cascade rules and indexed foreign keys.

### 8.1 Detailed Entity-Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ PROJECTS : "owns (1:N)"
    USERS ||--o{ AUDIT_LOGS : "triggers (1:N)"
    PROJECTS ||--o{ DEPLOYMENTS : "executes (1:N)"
    DEPLOYMENTS ||--o{ DEPLOYMENT_LOGS : "generates (1:N)"

    USERS {
        uuid id PK "Primary Key (UUIDv4)"
        string email UK "Unique index, max 255 chars"
        string hashed_password "Bcrypt cryptographic hash (work 12)"
        string full_name "Developer full name"
        boolean is_active "Account status flag"
        timestamp created_at "UTC account creation"
        timestamp updated_at "UTC last modification"
    }

    PROJECTS {
        uuid id PK "Primary Key (UUIDv4)"
        uuid user_id FK "Foreign Key -> users.id (indexed, cascade delete)"
        string name "Project slug name, max 50 chars"
        string description "Project description"
        string repo_url "Git HTTPS repository URL"
        string branch "Target deployment branch (default: main)"
        string framework "Node.js | Python | Go | Rust"
        string status "ACTIVE | INACTIVE | DEPLOYING"
        timestamp created_at "UTC creation timestamp"
        timestamp updated_at "UTC last update"
    }

    DEPLOYMENTS {
        uuid id PK "Primary Key (UUIDv4)"
        uuid project_id FK "Foreign Key -> projects.id (indexed, cascade delete)"
        string status "QUEUED | BUILDING | DEPLOYING | SUCCESS | FAILED"
        string commit_sha "Git 7-character commit SHA"
        string commit_message "Git commit summary"
        string branch "Deployment branch"
        string environment "production | staging | preview"
        int duration_seconds "Total runtime execution seconds"
        timestamp created_at "UTC job dispatch timestamp"
        timestamp finished_at "UTC termination timestamp"
    }

    DEPLOYMENT_LOGS {
        uuid id PK "Primary Key (UUIDv4)"
        uuid deployment_id FK "Foreign Key -> deployments.id (indexed, cascade delete)"
        string stage "CLONE | INSTALL | TEST | BUILD | PUSH | DEPLOY"
        string level "INFO | WARN | ERROR | DEBUG"
        text message "Log line plaintext or ANSI string"
        timestamp timestamp "UTC emission timestamp"
    }

    AUDIT_LOGS {
        uuid id PK "Primary Key (UUIDv4)"
        uuid user_id FK "Foreign Key -> users.id"
        string action "PROJECT_CREATED | DEPLOYMENT_TRIGGERED | USER_LOGIN"
        string ip_address "Client remote IP"
        timestamp timestamp "UTC audit event time"
    }
```

---

## 9. Observability & Telemetry Dataflow Architecture

StackForge implements an enterprise telemetry architecture separating time-series metrics from high-throughput log streams.

### 9.1 Prometheus, Loki & Grafana Telemetry Pipeline

```mermaid
flowchart TD
    subgraph WorkloadSources ["Telemetry Generation Sources"]
        FastAPIApp["FastAPI Backend (:8000)<br/>Prometheus Middleware captures:<br/>- http_requests_total<br/>- http_request_duration_seconds<br/>- active_deployments_gauge"]
        DockerEngine["Docker Engine Daemon<br/>Container standard output & error streams<br/>(/var/lib/docker/containers/*/*.log)"]
    end

    subgraph ScrapeAndCollect ["Collection & Aggregation Layer"]
        PrometheusServer["Prometheus Server (:9090)<br/>15-Second Pull Scrape Target:<br/>http://backend:8000/metrics"]
        GrafanaAlloy["Grafana Alloy Daemon (:12345)<br/>Dynamic discovery of container IDs<br/>Labels: container_name, service, project"]
    end

    subgraph StorageEngines ["Specialized Time-Series Storage"]
        PromTSDB[("Prometheus TSDB<br/>Metrics retention: 15 days")]
        LokiTSDB[("Grafana Loki Engine (:3100)<br/>Compressed log chunks + label index")]
    end

    subgraph VisualizationLayer ["Unified Visualization Layer"]
        GrafanaDashboards["Grafana 12.1 Platform Console (:3001)"]
        Dash1["Dashboard: 'StackForge Platform Overview'<br/>- API Request Rate & P95 Latency<br/>- Deployment Success vs Failure Rates"]
        Dash2["Dashboard: 'Live Container Logs'<br/>- Real-time LogQL stream filter"]
    end

    FastAPIApp -->|"Exposes /metrics"| PrometheusServer
    PrometheusServer -->|"Writes samples"| PromTSDB

    DockerEngine -->|"Log file streams"| GrafanaAlloy
    GrafanaAlloy -->|"Pushes indexed batches"| LokiTSDB

    PromTSDB -->|"PromQL Queries"| GrafanaDashboards
    LokiTSDB -->|"LogQL Queries"| GrafanaDashboards

    GrafanaDashboards --- Dash1
    GrafanaDashboards --- Dash2
```

---

## 10. Automated CI/CD & Artifact Release Pipeline

Every push to `main` triggers a complete multi-job matrix pipeline that validates code quality, executes hermetic tests, builds multi-stage Docker images, and publishes them to GitHub Container Registry (GHCR).

### 10.1 GitHub Actions & Release Pipeline Diagram

```mermaid
flowchart LR
    subgraph Trigger ["VCS Event Trigger"]
        PushEvent["git push origin main<br/>Pull Request #1"]
    end

    subgraph GitHubActions ["GitHub Actions Matrix (ci.yml)"]
        subgraph JobFrontend ["Job 1: Frontend CI (Node 20)"]
            FE_Lint["npm run lint (ESLint 0 errors)"]
            FE_Type["npx tsc --noEmit"]
            FE_Build["npm run build (Next.js standalone)"]
        end

        subgraph JobBackend ["Job 2: Backend CI (Python 3.12)"]
            BE_Patch["Monkey-patch SQLite in conftest.py"]
            BE_Mock["Mock redis module at import"]
            BE_Pytest["pytest tests/ -v (Hermetic execution)"]
        end

        subgraph JobDocker ["Job 3: Multi-Stage Docker Build & Release"]
            Dock_Back["Build stackforge-backend<br/>(Slim Python multi-stage)"]
            Dock_Front["Build stackforge-frontend<br/>(Node 20 standalone)"]
            GHCR_Push["Publish to GHCR<br/>ghcr.io/satviashwin369-creator/*:latest"]
        end
    end

    subgraph DeploymentTarget ["Deployment Target"]
        K8sCluster["Kubernetes Cluster / Docker Compose<br/>Pull & Rolling Upgrade"]
    end

    PushEvent --> JobFrontend
    PushEvent --> JobBackend
    JobFrontend --> JobDocker
    JobBackend --> JobDocker

    FE_Lint --> FE_Type --> FE_Build
    BE_Patch --> BE_Mock --> BE_Pytest
    Dock_Back --> GHCR_Push
    Dock_Front --> GHCR_Push

    GHCR_Push --> K8sCluster
```

---

## 11. Systems Design Trade-Off Matrix

Every architectural choice in StackForge balances complexity, horizontal scalability, and local developer ergonomics:

| Architectural Decision | Chosen Technology | Evaluated Alternatives | Technical Rationale & Trade-Off Analysis |
|:---|:---|:---|:---|
| **API Framework** | **FastAPI** (Python 3.12) | Django, Express / Node.js, Go Gin | **Why Chosen:** Native async/await event loop, native Pydantic v2 validation, automatic OpenAPI Swagger generation, and unified type sharing with data science/ML ecosystems. Eliminates Django's heavyweight ORM overhead. |
| **Message Broker** | **Redis 7** (In-Memory) | RabbitMQ, Apache Kafka | **Why Chosen:** StackForge needs both a task broker (for Celery) and a lightweight Pub/Sub broadcasting bus (for WebSocket streams). Redis fulfills both roles in a single 15MB container, avoiding Kafka's JVM memory footprint and ZooKeeper/KRaft cluster overhead. |
| **Telemetry Ingestion** | **Prometheus** (Pull Model) | Pushgateway, StatsD, Datadog Agent | **Why Chosen:** Pull scraping every 15s allows the monitoring system to govern ingestion rates. If the backend experiences high traffic, it does not overwhelm the monitoring pipeline with push requests. Scrapes remain lightweight HTTP requests against `/metrics`. |
| **CI Test Strategy** | **In-Memory SQLite** | Ephemeral PostgreSQL Service Container | **Why Chosen:** Running PostgreSQL inside GitHub Actions runners adds 15–20 seconds of boot time, network socket configuration, and database migration cleanup. Monkey-patching engines with SQLite at import time delivers sub-second test execution with 100% test isolation. |
| **Kubernetes Path** | **Declarative YAML (`k8s/`)** | Helm Charts, Pure Terraform Kubernetes | **Why Chosen:** Declarative manifests are universally transparent for junior/mid-level portfolio evaluation and local Minikube testing without requiring Helm template compilation or Terraform remote state locking. |
