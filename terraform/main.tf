terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.38"
    }
  }

  required_version = ">= 1.5.0"
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

# ---------------------------------------------------------
# Namespace
# ---------------------------------------------------------

resource "kubernetes_namespace" "stackforge" {
  metadata {
    name = var.namespace
  }
}

# ---------------------------------------------------------
# PostgreSQL PVC
# ---------------------------------------------------------

resource "kubernetes_persistent_volume_claim" "postgres" {
  metadata {
    name      = "postgres-pvc"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "5Gi"
      }
    }
  }
}

# ---------------------------------------------------------
# PostgreSQL
# ---------------------------------------------------------

resource "kubernetes_deployment" "postgres" {
  metadata {
    name      = "postgres"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "postgres"
      }
    }

    template {
      metadata {
        labels = {
          app = "postgres"
        }
      }

      spec {
        automount_service_account_token = false
        enable_service_links            = false

        container {
          name  = "postgres"
          image = var.postgres_image

          port {
            container_port = 5432
          }

          env {
            name  = "POSTGRES_USER"
            value = "stackforge"
          }

          env {
            name  = "POSTGRES_PASSWORD"
            value = "stackforge_secret"
          }

          env {
            name  = "POSTGRES_DB"
            value = "stackforge"
          }

          volume_mount {
            name       = "postgres-storage"
            mount_path = "/var/lib/postgresql/data"
          }

          readiness_probe {
            exec {
              command = [
                "pg_isready",
                "-U",
                "stackforge",
                "-d",
                "stackforge"
              ]
            }

            initial_delay_seconds = 5
            period_seconds        = 5
          }

          liveness_probe {
            exec {
              command = [
                "pg_isready",
                "-U",
                "stackforge",
                "-d",
                "stackforge"
              ]
            }

            initial_delay_seconds = 15
            period_seconds        = 10
          }
        }

        volume {
          name = "postgres-storage"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.postgres.metadata[0].name
          }
        }
      }
    }
  }
}

# ---------------------------------------------------------
# PostgreSQL Service
# ---------------------------------------------------------

resource "kubernetes_service" "db" {
  metadata {
    name      = "db"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    selector = {
      app = "postgres"
    }

    port {
      port        = 5432
      target_port = 5432
    }

    type = "ClusterIP"
  }
}

# ---------------------------------------------------------
# Redis
# ---------------------------------------------------------

resource "kubernetes_deployment" "redis" {
  metadata {
    name      = "redis"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "redis"
      }
    }

    template {
      metadata {
        labels = {
          app = "redis"
        }
      }

      spec {
        automount_service_account_token = false
        enable_service_links            = false

        container {
          name  = "redis"
          image = var.redis_image

          port {
            container_port = 6379
          }

          readiness_probe {
            exec {
              command = [
                "redis-cli",
                "ping"
              ]
            }

            initial_delay_seconds = 5
            period_seconds        = 5
          }

          liveness_probe {
            exec {
              command = [
                "redis-cli",
                "ping"
              ]
            }

            initial_delay_seconds = 10
            period_seconds        = 10
          }
        }
      }
    }
  }
}

# ---------------------------------------------------------
# Redis Service
# ---------------------------------------------------------

resource "kubernetes_service" "redis" {
  metadata {
    name      = "redis"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    selector = {
      app = "redis"
    }

    port {
      port        = 6379
      target_port = 6379
    }

    type = "ClusterIP"
  }
}

# ---------------------------------------------------------
# Backend
# ---------------------------------------------------------

resource "kubernetes_deployment" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "backend"
      }
    }

    template {
      metadata {
        labels = {
          app = "backend"
        }
      }

      spec {
        automount_service_account_token = false
        enable_service_links            = false

        container {
          name              = "backend"
          image             = var.backend_image
          image_pull_policy = "IfNotPresent"

          port {
            container_port = 8000
          }

          env {
            name  = "DATABASE_URL"
            value = "postgresql+psycopg2://stackforge:stackforge_secret@db:5432/stackforge"
          }

          env {
            name  = "REDIS_URL"
            value = "redis://redis:6379/0"
          }

          env {
            name  = "CELERY_BROKER_URL"
            value = "redis://redis:6379/1"
          }

          env {
            name  = "CELERY_RESULT_BACKEND"
            value = "redis://redis:6379/2"
          }

          env {
            name  = "BACKEND_INTERNAL_URL"
            value = "http://backend:8000"
          }

          env {
            name  = "CORS_ORIGINS"
            value = "http://frontend:3000,http://127.0.0.1:3000"
          }

          env {
            name  = "DEBUG"
            value = "false"
          }

          env {
            name  = "ENVIRONMENT"
            value = "production"
          }

          env {
            name  = "JWT_SECRET_KEY"
            value = "change-me-to-a-long-random-secret-in-production"
          }

          env {
            name  = "PORT"
            value = "8000"
          }

          env {
            name  = "POSTGRES_DB"
            value = "stackforge"
          }

          env {
            name  = "POSTGRES_HOST"
            value = "db"
          }

          env {
            name  = "POSTGRES_PASSWORD"
            value = "stackforge_secret"
          }

          env {
            name  = "POSTGRES_USER"
            value = "stackforge"
          }

          readiness_probe {
            http_get {
              path = "/health"
              port = 8000
            }

            initial_delay_seconds = 10
            period_seconds        = 5
          }

          liveness_probe {
            http_get {
              path = "/health"
              port = 8000
            }

            initial_delay_seconds = 20
            period_seconds        = 10
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_deployment.postgres,
    kubernetes_deployment.redis
  ]
}

# ---------------------------------------------------------
# Backend Service
# ---------------------------------------------------------

resource "kubernetes_service" "backend" {
  metadata {
    name      = "backend"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    selector = {
      app = "backend"
    }

    port {
      port        = 8000
      target_port = 8000
    }

    type = "ClusterIP"
  }
}

# ---------------------------------------------------------
# Frontend
# ---------------------------------------------------------

resource "kubernetes_deployment" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "frontend"
      }
    }

    template {
      metadata {
        labels = {
          app = "frontend"
        }
      }

      spec {
        automount_service_account_token = false
        enable_service_links            = false

        container {
          name              = "frontend"
          image             = var.frontend_image
          image_pull_policy = "IfNotPresent"

          port {
            container_port = 3000
          }

          env {
            name  = "BACKEND_INTERNAL_URL"
            value = "http://backend:8000"
          }

          env {
            name  = "NEXT_PUBLIC_API_URL"
            value = "/api/v1"
          }

          env {
            name  = "NEXT_PUBLIC_WS_URL"
            value = "http://localhost:8000/api/v1"
          }

          readiness_probe {
            http_get {
              path = "/"
              port = 3000
            }

            initial_delay_seconds = 15
            period_seconds        = 10
          }

          liveness_probe {
            http_get {
              path = "/"
              port = 3000
            }

            initial_delay_seconds = 30
            period_seconds        = 15
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_deployment.backend
  ]
}

# ---------------------------------------------------------
# Frontend Service
# ---------------------------------------------------------

resource "kubernetes_service" "frontend" {
  metadata {
    name      = "frontend"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    selector = {
      app = "frontend"
    }

    port {
      port        = 3000
      target_port = 3000
    }

    type = "NodePort"
  }
}

# ---------------------------------------------------------
# Celery Worker
# ---------------------------------------------------------

resource "kubernetes_deployment" "worker" {
  metadata {
    name      = "worker"
    namespace = kubernetes_namespace.stackforge.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "worker"
      }
    }

    template {
      metadata {
        labels = {
          app = "worker"
        }
      }

      spec {
        automount_service_account_token = false
        enable_service_links            = false

        container {
          name              = "worker"
          image             = var.backend_image
          image_pull_policy = "IfNotPresent"

          command = [
            "celery",
            "-A",
            "app.celery_app.celery_app",
            "worker"
          ]

          env {
            name  = "DATABASE_URL"
            value = "postgresql+psycopg2://stackforge:stackforge_secret@db:5432/stackforge"
          }

          env {
            name  = "REDIS_URL"
            value = "redis://redis:6379/0"
          }

          env {
            name  = "CELERY_BROKER_URL"
            value = "redis://redis:6379/1"
          }

          env {
            name  = "CELERY_RESULT_BACKEND"
            value = "redis://redis:6379/2"
          }

          env {
            name  = "BACKEND_INTERNAL_URL"
            value = "http://backend:8000"
          }

          env {
            name  = "CORS_ORIGINS"
            value = "http://localhost:3000,http://127.0.0.1:3000"
          }

          env {
            name  = "DEBUG"
            value = "false"
          }

          env {
            name  = "ENVIRONMENT"
            value = "production"
          }

          env {
            name  = "JWT_SECRET_KEY"
            value = "change-me-to-a-long-random-secret-in-production"
          }

          env {
            name  = "PORT"
            value = "8000"
          }

          env {
            name  = "POSTGRES_DB"
            value = "stackforge"
          }

          env {
            name  = "POSTGRES_HOST"
            value = "db"
          }

          env {
            name  = "POSTGRES_PASSWORD"
            value = "stackforge_secret"
          }

          env {
            name  = "POSTGRES_USER"
            value = "stackforge"
          }
        }
      }
    }
  }

  depends_on = [
    kubernetes_deployment.postgres,
    kubernetes_deployment.redis,
    kubernetes_deployment.backend
  ]
}