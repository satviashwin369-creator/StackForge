variable "namespace" {
  description = "Kubernetes namespace for StackForge"
  type        = string
  default     = "stackforge"
}

variable "backend_image" {
  description = "StackForge backend container image"
  type        = string
  default     = "ghcr.io/satviashwin369-creator/stackforge-backend:latest"
}

variable "frontend_image" {
  description = "StackForge frontend container image"
  type        = string
  default     = "ghcr.io/satviashwin369-creator/stackforge-frontend:latest"
}

variable "postgres_image" {
  description = "PostgreSQL container image"
  type        = string
  default     = "postgres:16-alpine"
}

variable "redis_image" {
  description = "Redis container image"
  type        = string
  default     = "redis:7-alpine"
}

variable "postgres_user" {
  description = "Username for PostgreSQL database"
  type        = string
  default     = "stackforge"
}

variable "postgres_password" {
  description = "Password for PostgreSQL database"
  type        = string
  sensitive   = true
}

variable "postgres_db" {
  description = "Database name for PostgreSQL"
  type        = string
  default     = "stackforge"
}

variable "jwt_secret_key" {
  description = "Cryptographic secret key for signing backend JWT tokens"
  type        = string
  sensitive   = true
}