import time
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.db.session import SessionLocal
from app.models.deployment import Deployment, DeploymentStatus
from app.models.log import LogLevel
from app.services.deployment_service import DeploymentService
from app.services.log_service import LogService
from app.utils.redis_client import get_redis


def _publish_status(deployment_id: uuid.UUID, status: str) -> None:
    try:
        get_redis().publish(
            f"deployment:status:{deployment_id}",
            status,
        )
    except Exception:
        pass


def run_deployment_pipeline(deployment_id: uuid.UUID) -> None:
    """Simulate CI/CD pipeline — runs in background (Celery or FastAPI BackgroundTasks)."""
    db: Session = SessionLocal()
    try:
        deployment = db.scalar(
            select(Deployment)
            .where(Deployment.id == deployment_id)
            .options(joinedload(Deployment.project))
        )
        if not deployment:
            return

        project = deployment.project
        service = project.name if project else "stackforge"
        start = datetime.now(timezone.utc)

        stages = [
            (DeploymentStatus.QUEUED.value, "Queued for build agent..."),
            (DeploymentStatus.BUILDING.value, "Running build — npm ci && npm run build"),
            (DeploymentStatus.BUILDING.value, "Running test suite — 247 tests"),
            (DeploymentStatus.DEPLOYING.value, "Pushing container image to registry"),
            (DeploymentStatus.DEPLOYING.value, "Rolling out to eu-west-1 cluster"),
        ]

        for status, msg in stages:
            deployment.status = status
            db.commit()
            _publish_status(deployment_id, status)
            LogService.append_system_log(
                db, deployment_id, f"[{service}] {msg}", LogLevel.INFO.value, service
            )
            time.sleep(1.2)

        final = DeploymentService.simulate_outcome()
        deployment.status = final
        deployment.finished_at = datetime.now(timezone.utc)
        deployment.duration_seconds = int(
            (deployment.finished_at - start).total_seconds()
        )
        db.commit()
        _publish_status(deployment_id, final)

        level = LogLevel.INFO.value if final == DeploymentStatus.SUCCESS.value else LogLevel.ERROR.value
        LogService.append_system_log(
            db,
            deployment_id,
            f"[{service}] Deployment {final} — duration {_format(deployment.duration_seconds)}",
            level,
            service,
        )
    finally:
        db.close()


def _format(seconds: int) -> str:
    m, s = divmod(seconds, 60)
    return f"{m}m {s:02d}s"
