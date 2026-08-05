import json
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.deployment import Deployment
from app.models.log import LogEntry, LogLevel
from app.models.project import Project
from app.models.user import User
from app.schemas.log import LogCreate, LogRead
from app.utils.redis_client import get_redis


class LogService:
    STREAM_PREFIX = "logs:stream:"

    @staticmethod
    def _to_read(entry: LogEntry) -> LogRead:
        ts = entry.created_at
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
        return LogRead(
            id=str(entry.id),
            timestamp=ts.isoformat().replace("+00:00", "Z"),
            level=entry.level,
            message=entry.message,
            service=entry.service,
        )

    @staticmethod
    def _publish_stream(deployment_id: uuid.UUID, entry: LogRead) -> None:
        try:
            redis = get_redis()
            channel = f"{LogService.STREAM_PREFIX}{deployment_id}"
            redis.publish(channel, json.dumps(entry.model_dump()))
        except Exception:
            pass

    @staticmethod
    def create(db: Session, user: User, payload: LogCreate) -> LogRead | None:
        dep = db.scalar(
            select(Deployment)
            .join(Project)
            .where(Deployment.id == payload.deployment_id, Project.user_id == user.id)
        )
        if not dep:
            return None
        entry = LogEntry(
            deployment_id=dep.id,
            level=payload.level,
            message=payload.message,
            service=payload.service,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        read = LogService._to_read(entry)
        LogService._publish_stream(dep.id, read)
        return read

    @staticmethod
    def list_for_deployment(
        db: Session, user: User, deployment_id: uuid.UUID
    ) -> list[LogRead]:
        dep = db.scalar(
            select(Deployment)
            .join(Project)
            .where(Deployment.id == deployment_id, Project.user_id == user.id)
        )
        if not dep:
            return []
        return LogService.list_for_deployment_id(db, deployment_id)

    @staticmethod
    def list_for_deployment_id(db: Session, deployment_id: uuid.UUID) -> list[LogRead]:
        entries = db.scalars(
            select(LogEntry)
            .where(LogEntry.deployment_id == deployment_id)
            .order_by(LogEntry.created_at)
        ).all()
        return [LogService._to_read(e) for e in entries]

    @staticmethod
    def list_recent(db: Session, user: User, limit: int = 50) -> list[LogRead]:
        entries = db.scalars(
            select(LogEntry)
            .join(Deployment)
            .join(Project)
            .where(Project.user_id == user.id)
            .order_by(LogEntry.created_at.desc())
            .limit(limit)
        ).all()
        return [LogService._to_read(e) for e in reversed(entries)]

    @staticmethod
    def append_system_log(
        db: Session,
        deployment_id: uuid.UUID,
        message: str,
        level: str = LogLevel.INFO.value,
        service: str = "stackforge",
    ) -> LogEntry:
        entry = LogEntry(
            deployment_id=deployment_id,
            level=level,
            message=message,
            service=service,
        )
        db.add(entry)
        db.commit()
        db.refresh(entry)
        read = LogService._to_read(entry)
        LogService._publish_stream(deployment_id, read)
        return entry
