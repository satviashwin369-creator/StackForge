# StackForge Deployment Guide 🚀

This document covers running StackForge locally using Docker Compose, deploying to a local Kubernetes cluster, and considerations for public portfolio demonstrations.

---

## 1. Local Deployment (Docker Compose)

### Architecture Profiles
To ensure rapid, trouble-free startup across all operating systems (especially Windows), StackForge organizes services into two Compose profiles:

1. **Default Profile (Core IDP - 7 Services):**
   - `frontend`: Next.js 16 Web Dashboard (Port `3000`)
   - `backend`: FastAPI Application API (Port `8000`)
   - `worker`: Celery Background Worker
   - `db`: PostgreSQL 16 Alpine Database (Port `5432`)
   - `redis`: Redis 7 Alpine Broker & Pub/Sub (Port `6379`)
   - `prometheus`: Prometheus Metrics Scraper (Port `9090`)
   - `grafana`: Grafana Analytics & Dashboards (Port `3001`)

2. **Optional Logging Profile (`--profile logging` - 2 Additional Services):**
   - `loki`: Grafana Loki 3.5.0 Log Storage (Port `3100`)
   - `alloy`: Grafana Alloy v1.10.2 Docker Log Forwarder (Port `12345`)

### Quick Start Commands

```bash
# 1. Clone repository and navigate to root
cd stackforge

# 2. Configure environment file (or use defaults)
cp .env.example .env

# 3. Launch Core Services (Fast, zero socket-mount issues)
docker compose up -d --build

# 4. (Optional) Launch with Full Log Aggregation
docker compose --profile logging up -d

# 5. Check Service Health
docker compose ps

# 6. View Consolidated Logs
docker compose logs -f backend frontend
```

### Health & Endpoint Verification
- **Frontend Dashboard:** `http://localhost:3000`
- **Backend Swagger Docs:** `http://localhost:8000/docs`
- **Backend Health Check:** `curl -s http://localhost:8000/health` (returns `{"status":"ok"}`)
- **Prometheus Metrics:** `curl -s http://localhost:8000/metrics`
- **Prometheus Targets:** `http://localhost:9090/targets` (state `UP`)
- **Grafana Dashboards:** `http://localhost:3001` (pre-provisioned with `StackForge Platform Overview`)

---

## 2. Kubernetes Deployment (Minikube / kind)

StackForge includes hardened, declarative Kubernetes manifests in `k8s/` designed for local cluster deployment.

### Manifest Hierarchy
```text
k8s/
├── namespace.yaml           # Defines the 'stackforge' namespace
├── secret.yaml.example      # Tracked template for 'stackforge-secrets' (DB, JWT)
├── database/
│   └── postgres.yaml       # 5Gi PVC, PostgreSQL Deployment & Service
├── redis/
│   └── redis.yaml          # Redis Deployment & ClusterIP Service
├── backend/
│   ├── backend.yaml        # FastAPI API Deployment, Service, Probes & Resources
│   └── worker.yaml         # Celery Worker Deployment & Resources
└── frontend/
    └── frontend.yaml       # Next.js Deployment, NodePort Service & Resources
```

### Deployment Instructions

```bash
# 1. Start your local cluster (Minikube or kind)
minikube start --cpus=4 --memory=4096
# OR: kind create cluster --name stackforge

# 2. Create the namespace first
kubectl apply -f k8s/namespace.yaml

# 3. Provision Secrets (copy example template or create dynamically)
# Option A: Local testing via untracked secret file (ignored by Git)
cp k8s/secret.yaml.example k8s/secret.yaml
kubectl apply -f k8s/secret.yaml

# Option B: Dynamic Secret creation (recommended for production/CI)
# kubectl create secret generic stackforge-secrets -n stackforge \
#   --from-literal=POSTGRES_PASSWORD='<secure-password>' \
#   --from-literal=DATABASE_URL='postgresql+psycopg2://stackforge:<secure-password>@db:5432/stackforge' \
#   --from-literal=JWT_SECRET_KEY='<secure-64-char-random-key>'

# 4. Deploy Database & Redis dependencies
kubectl apply -f k8s/database/
kubectl apply -f k8s/redis/

# 5. Deploy Backend and Celery Worker
kubectl apply -f k8s/backend/

# 6. Deploy Frontend
kubectl apply -f k8s/frontend/

# 7. Check Pod and PVC status
kubectl get pods -n stackforge
kubectl get pvc -n stackforge

# 8. Port-Forward Services for Local Browser Access
# Frontend Web Dashboard (Port 3000)
kubectl port-forward svc/frontend -n stackforge 3000:3000 &

# Backend API & WebSocket Endpoint (Port 8000)
# Required for real-time WebSocket live logs at ws://localhost:8000/api/v1.
# If port 8000 is not forwarded, the frontend gracefully falls back to HTTP polling.
kubectl port-forward svc/backend -n stackforge 8000:8000 &
```

### WebSocket vs HTTP Polling Architecture
- **Browser WebSocket Routing:** Browser client connections cannot traverse Next.js server-side HTTP route proxies. They connect directly to `NEXT_PUBLIC_WS_URL` (`ws://localhost:8000/api/v1`).
- **Dual Port-Forwarding:** Port-forwarding `svc/backend` to host port `8000` allows browser WebSocket handshakes to reach FastAPI directly.
- **Graceful Polling Fallback:** If `svc/backend` is not forwarded or WebSocket communication fails, the frontend `useLiveLogs` hook automatically falls back to HTTP polling (`/api/v1/deployments/<id>/logs`) through Next.js rewrite proxying every 3 seconds.

---

## 3. Infrastructure as Code (Terraform)

The `terraform/` directory contains declarative configurations for deploying StackForge to a Kubernetes cluster using the official HashiCorp Kubernetes provider.

- **Role:** Demonstrates Infrastructure-as-Code modularity, input variable validation, and credential management.
- **Resource Ownership:** To prevent configuration drift, raw Kubernetes manifests in `k8s/` remain the primary deployment mechanism for local clusters.
- **Credential Hardening:** All sensitive parameters (`postgres_password`, `jwt_secret_key`) are declared as `sensitive = true` input variables with no hardcoded defaults.
- **Safe Local Setup:**
  ```bash
  cd terraform
  cp terraform.tfvars.example terraform.tfvars
  # Populate local development secrets in terraform.tfvars (ignored by git)
  # OR provide via TF_VAR_postgres_password and TF_VAR_jwt_secret_key
  ```
- **State Security:** Note that `sensitive = true` protects console output but does not encrypt state files. Production environments require remote encrypted backends (e.g. S3 with KMS). See `terraform/README.md` for full details.

---

## 4. Public Portfolio Demo Strategy

If you wish to demonstrate StackForge publicly without running a local Kubernetes cluster:

- **Why Not Serverless / Vercel Alone:** StackForge relies on persistent WebSockets (`/ws/logs`), an active Celery worker, and long-running Docker containers. Pure serverless platforms (like Vercel) terminate functions after short execution windows and do not support background workers or persistent TCP sockets.
- **Recommended Free/Low-Cost Architecture:**
  - **Database:** Managed PostgreSQL via Neon (free tier) or Supabase (free tier).
  - **Redis:** Upstash Redis (free tier serverless Redis).
  - **Containers:** Deploy Frontend and FastAPI Backend as container services on Render or Railway.
  - **Local DevOps Focus:** For technical interviews, your local Docker Compose and Kubernetes demonstrations remain the strongest proof of DevOps competency.
