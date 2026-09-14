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