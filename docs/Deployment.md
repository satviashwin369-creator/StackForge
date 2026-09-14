# StackForge Deployment Guide 🚀

This document covers running StackForge locally using Docker Compose and preparing for production Kubernetes deployment.

---

## 1. Local Deployment (Docker Compose)

### Stack Overview
The local deployment runs all 9 core services on a dedicated bridge network (`stackforge-net`):

```bash
# 1. Ensure Docker daemon is active
docker info

# 2. Check environment variables
cat .env

# 3. Spin up full stack
docker compose up -d --build

# 4. View logs across all services
docker compose logs -f

# 5. Check container health status
docker compose ps
```

### Healthcheck Verifications
- **Backend:** `curl http://localhost:8000/health`
- **PostgreSQL:** Checked using `pg_isready -U stackforge -d stackforge`
- **Redis:** Checked using `redis-cli ping`
- **Prometheus:** `curl http://localhost:9090/-/ready`
- **Grafana:** `curl http://localhost:3001/api/health`
- **Loki:** Label check via `curl http://localhost:3100/loki/api/v1/label/service_name/values`

---

## 2. Observability Integration

### Docker Log Forwarding with Alloy
Alloy mounts `/var/run/docker.sock` and `/var/lib/docker/containers`. It extracts container names and Docker Compose service labels dynamically:

```alloy
discovery.docker "containers" {
  host = "unix:///var/run/docker.sock"
}

discovery.relabel "docker_compose" {
  targets = discovery.docker.containers.targets

  rule {
    source_labels = ["__meta_docker_container_id"]
    regex = "(.+)"
    target_label = "__path__"
    replacement = "/var/lib/docker/containers/$1/$1-json.log"
  }

  rule {
    source_labels = ["__meta_docker_container_label_com_docker_compose_service"]
    regex = "(.+)"
    target_label = "service_name"
  }
}
```

---

## 3. Production Roadmap (Milestone 9)

In production environments:
1. **Container Orchestration:** Deploy on Kubernetes using Helm or Kustomize manifests.
2. **Database:** Transition from containerized PostgreSQL to managed cloud databases (AWS RDS / Cloud SQL).
3. **Caching:** Transition to managed Redis (AWS ElastiCache / Redis Cloud).
4. **GitOps:** Continuously sync state from Git using Argo CD.
