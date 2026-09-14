# StackForge API Specification 📡

The StackForge Backend API is built on FastAPI and follows RESTful conventions alongside WebSocket protocols for real-time streaming.

Interactive OpenAPI documentation is live at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc`.

---

## Base URLs
- **REST Endpoints:** `http://localhost:8000/api/v1`
- **WebSocket Endpoints:** `ws://localhost:8000/api/v1`

---

## Authentication (`/api/v1/auth`)

All secured endpoints expect an `Authorization: Bearer <token>` HTTP header.

### `POST /auth/register`
Create a new user account.
```json
{
  "email": "user@stackforge.io",
  "password": "SecurePassword123!",
  "full_name": "DevOps Engineer"
}
```

### `POST /auth/login`
Authenticate credentials and obtain JWT bearer token.
- **Content-Type:** `application/x-www-form-urlencoded` or JSON
- **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 86400
}
```

### `GET /auth/me`
Retrieve user profile for currently authenticated bearer token.

---

## Projects (`/api/v1/projects`)

### `GET /projects`
Retrieve all projects associated with the authenticated user.

### `POST /projects`
Create a new project workspace.
```json
{
  "name": "payment-gateway",
  "description": "Core payment processing microservice",
  "repo_url": "https://github.com/org/payment-svc",
  "stack": "Go / gRPC",
  "environment": "production"
}
```

### `GET /projects/{id}`
Fetch detailed metadata, health scores, and deployment history for project `{id}`.

### `PUT /projects/{id}`
Update project configuration or status.

### `DELETE /projects/{id}`
Remove project workspace.

---

## Deployments & Pipelines (`/api/v1/deployments`)

### `GET /deployments`
List recent deployment executions across projects.

### `POST /deployments`
Trigger a new 6-stage deployment pipeline execution.
```json
{
  "project_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "branch": "main",
  "commit_sha": "7bf474a",
  "triggered_by": "user@stackforge.io"
}
```

### `GET /deployments/{id}`
Fetch execution outcome, duration, and metadata for deployment `{id}`.

### `GET /deployments/{id}/pipeline`
Retrieve step-by-step progress of the 6 pipeline stages:
`Source` → `Build` → `Test` → `Security Scan` → `Deploy` → `Verify`

---

## Logs & WebSockets (`/api/v1/logs`, `/api/v1/ws`)

### `GET /logs/recent`
Retrieve recent cross-service log lines. Supports query parameters `limit` (default: 50).

### `GET /logs/deployment/{deployment_id}`
Retrieve historical log lines persisted for deployment `{deployment_id}`.

### `WS /ws/logs/{deployment_id}`
Connect to receive real-time streaming standard output and error messages during pipeline execution.

### `WS /ws/deployments/{deployment_id}/status`
Connect to receive real-time stage status transitions for deployment `{deployment_id}`.

---

## Infrastructure & Telemetry (`/api/v1/infra`)

### `GET /infra/status`
Returns high-level health state of database, cache, and container nodes.

### `GET /infra/metrics`
Returns CPU, RAM, and Disk timeseries telemetry.

### `GET /infra/kpis`
Returns platform KPIs including deployment success rates, active services, and incident counts.

### `GET /infra/activities`
Returns audit log of recent user and system events.

---

## System & Observability

- `GET /health` — Service readiness probe (`{"status": "ok"}`)
- `GET /metrics` — Prometheus standard exposition format
