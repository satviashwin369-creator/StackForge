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
├── namespace.yaml       # Defines the 'stackforge' namespace
├── secret.yaml          # Defines 'stackforge-secrets' (DB, JWT)
├── database/
│   └── postgres.yaml   # 5Gi PVC, PostgreSQL Deployment & Service
├── redis/
│   └── redis.yaml      # Redis Deployment & ClusterIP Service
├── backend/
│   ├── backend.yaml    # FastAPI API Deployment, Service, Probes & Resources
│   └── worker.yaml     # Celery Worker Deployment & Resources
└── frontend/
    └── frontend.yaml   # Next.js Deployment, NodePort Service & Resources
```

### Deployment Instructions

```bash
# 1. Start your local cluster (Minikube or kind)
minikube start --cpus=4 --memory=4096
# OR: kind create cluster --name stackforge

# 2. Create the namespace first
kubectl apply -f k8s/namespace.yaml

# 3. Apply Secrets (contains local dev defaults; customize for production)
kubectl apply -f k8s/secret.yaml

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

# 8. Access Frontend via Port Forwarding
kubectl port-forward svc/frontend -n stackforge 3000:3000
```

---

## 3. Infrastructure as Code (Terraform)

The `terraform/` directory contains optional Infrastructure-as-Code modules for cloud provisioning.

- **Role:** Optional IaC extension demonstrating HCL modularity and AWS provider configuration.
- **Resource Ownership:** To prevent configuration drift, raw Kubernetes manifests in `k8s/` are the authoritative deployment mechanism for clusters. Terraform should not be used to duplicate or overwrite resources already managed by `k8s/`.

---

## 4. Public Portfolio Demo Strategy

If you wish to demonstrate StackForge publicly without running a local Kubernetes cluster:

- **Why Not Serverless / Vercel Alone:** StackForge relies on persistent WebSockets (`/ws/logs`), an active Celery worker, and long-running Docker containers. Pure serverless platforms (like Vercel) terminate functions after short execution windows and do not support background workers or persistent TCP sockets.
- **Recommended Free/Low-Cost Architecture:**
  - **Database:** Managed PostgreSQL via Neon (free tier) or Supabase (free tier).
  - **Redis:** Upstash Redis (free tier serverless Redis).
  - **Containers:** Deploy Frontend and FastAPI Backend as container services on Render or Railway.
  - **Local DevOps Focus:** For technical interviews, your local Docker Compose and Kubernetes demonstrations remain the strongest proof of DevOps competency.
