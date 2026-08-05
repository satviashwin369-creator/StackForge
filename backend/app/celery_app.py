from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "stackforge",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)


@celery_app.task(name="stackforge.run_deployment")
def run_deployment_task(deployment_id: str) -> str:
    from uuid import UUID

    from app.services.deployment_simulator import run_deployment_pipeline

    run_deployment_pipeline(UUID(deployment_id))
    return deployment_id
