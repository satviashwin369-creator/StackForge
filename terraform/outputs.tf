output "namespace" {
  description = "StackForge Kubernetes namespace"
  value       = kubernetes_namespace.stackforge.metadata[0].name
}

output "frontend_service" {
  description = "StackForge frontend Kubernetes service"
  value       = kubernetes_service.frontend.metadata[0].name
}

output "backend_service" {
  description = "StackForge backend Kubernetes service"
  value       = kubernetes_service.backend.metadata[0].name
}