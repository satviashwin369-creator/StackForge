# StackForge — Infrastructure as Code (Terraform)

This directory contains declarative Terraform configurations for deploying the StackForge platform onto a Kubernetes cluster using the official HashiCorp Kubernetes provider.

---

## Architecture & Resources

The Terraform module manages:
- **Namespace:** Dedicated `stackforge` Kubernetes namespace.
- **Storage:** Persistent Volume Claim (`postgres-pvc`, 5Gi) for PostgreSQL database persistence.
- **Data Stores:** PostgreSQL 16 Deployment & ClusterIP Service, Redis 7 Deployment & ClusterIP Service.
- **Compute:** FastAPI Backend Deployment & ClusterIP Service, Celery Worker Deployment.
- **Frontend:** Next.js Dashboard Deployment & NodePort Service.

---

## Input Variables

| Variable | Description | Type | Default | Sensitive |
|---|---|---|---|:---:|
| `postgres_password` | Master password for PostgreSQL database | `string` | *(None - Required)* | **Yes** |
| `jwt_secret_key` | Cryptographic secret key for signing backend JWT tokens | `string` | *(None - Required)* | **Yes** |
| `postgres_user` | Master username for PostgreSQL | `string` | `"stackforge"` | No |
| `postgres_db` | Database name for PostgreSQL | `string` | `"stackforge"` | No |
| `namespace` | Target Kubernetes namespace | `string` | `"stackforge"` | No |
| `backend_image` | Container image for FastAPI backend & Celery worker | `string` | `"ghcr.io/satviashwin369-creator/stackforge-backend:latest"` | No |
| `frontend_image` | Container image for Next.js frontend | `string` | `"ghcr.io/satviashwin369-creator/stackforge-frontend:latest"` | No |
| `postgres_image` | Container image for PostgreSQL | `string` | `"postgres:16-alpine"` | No |
| `redis_image` | Container image for Redis | `string` | `"redis:7-alpine"` | No |

---

## Safe Credential Management

Never commit passwords, JWT signing keys, or populated `.tfvars` files to version control.

### Method 1: Environment Variables (Recommended for CI/CD & Local Shells)

Terraform automatically reads environment variables prefixed with `TF_VAR_`:

```bash
export TF_VAR_postgres_password="replace-with-a-secure-database-password"
export TF_VAR_jwt_secret_key="replace-with-a-secure-random-64-character-jwt-secret-key"
```

### Method 2: Untracked Variable File (Local Development)

1. Copy the example template:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Populate `terraform.tfvars` with your development secrets.
3. The root `.gitignore` is configured to ignore `*.tfvars` and `*.tfvars.json` (except `!*.tfvars.example`), preventing accidental commits.

---

## Critical State Security Warning

> [!WARNING]
> Marking a variable as `sensitive = true` prevents its value from appearing in console outputs (`terraform plan` / `terraform apply`), but **does not remove or encrypt the value inside `terraform.tfstate`**.
>
> Terraform stores all resource attributes, including secrets and passwords, in plaintext within state files.
>
> **Requirements for Production:**
> 1. Always store state in an encrypted remote backend (such as AWS S3 with SSE-KMS, Azure Blob Storage, or HashiCorp HCP Terraform).
> 2. Restrict IAM permissions to the state bucket.
> 3. Never commit `terraform.tfstate` or `terraform.tfstate.backup` files to Git.

---

## Validation & Formatting

```bash
# Check code formatting
terraform fmt -check

# Validate configuration syntax and schema
terraform validate
```
