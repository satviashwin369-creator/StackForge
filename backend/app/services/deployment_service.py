import random
import uuid
from datetime import datetime, timezone

from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session, joinedload

from app.models.deployment import Deployment, DeploymentStatus
from app.models.project import Project
from app.models.user import User
from app.schemas.deployment import DeploymentCreate, DeploymentRead, PipelineStageRead


def _format_duration(seconds: int | None) -> str:
    if seconds is None:
        return "—"
    m, s = divmod(seconds, 60)
    return f"{m}m {s:02d}s"


def _relative_time(dt: datetime) -> str:
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    minutes = int((now - dt).total_seconds() // 60)
    if minutes < 1:
        return "Just now"
    if minutes < 60:
        return f"{minutes} min ago"
    return f"{minutes // 60} hours ago"


class DeploymentService:
    @staticmethod
    def _to_read(dep: Deployment, project_name: str) -> DeploymentRead:
        return DeploymentRead(
            id=str(dep.id),
            projectName=project_name,
            status=dep.status,
            commit=dep.commit,
            commitMessage=dep.commit_message or "",
            branch=dep.branch,
            duration=_format_duration(dep.duration_seconds),
            timestamp=_relative_time(dep.created_at),
            author=dep.author or "System",
            environment=dep.environment,
            project_id=dep.project_id,
            created_at=dep.created_at,
        )

    @staticmethod
    def create(
        db: Session, user: User, payload: DeploymentCreate, author_name: str
    ) -> Deployment | None:
        project = db.get(Project, payload.project_id)
        if not project or project.user_id != user.id:
            return None
        deployment = Deployment(
            project_id=project.id,
            status=DeploymentStatus.QUEUED.value,
            commit=payload.commit,
            commit_message=payload.commit_message or "Triggered via StackForge API",
            branch=payload.branch or project.branch,
            environment=payload.environment,
            author=author_name,
        )
        db.add(deployment)
        db.commit()
        db.refresh(deployment)
        return deployment

    @staticmethod
    def list_for_user(db: Session, user: User, limit: int = 50) -> list[DeploymentRead]:
        deps = db.scalars(
            select(Deployment)
            .join(Project)
            .where(Project.user_id == user.id)
            .options(joinedload(Deployment.project))
            .order_by(desc(Deployment.created_at))
            .limit(limit)
        ).all()
        return [DeploymentService._to_read(d, d.project.name) for d in deps]

    @staticmethod
    def get(db: Session, user: User, deployment_id: uuid.UUID) -> DeploymentRead | None:
        dep = db.scalar(
            select(Deployment)
            .join(Project)
            .where(Deployment.id == deployment_id, Project.user_id == user.id)
            .options(joinedload(Deployment.project))
        )
        if not dep:
            return None
        return DeploymentService._to_read(dep, dep.project.name)

    @staticmethod
    def get_entity(
        db: Session, user: User, deployment_id: uuid.UUID
    ) -> Deployment | None:
        return db.scalar(
            select(Deployment)
            .join(Project)
            .where(Deployment.id == deployment_id, Project.user_id == user.id)
            .options(joinedload(Deployment.project))
        )

    @staticmethod
    def list_by_project(
        db: Session, user: User, project_id: uuid.UUID
    ) -> list[DeploymentRead]:
        project = db.get(Project, project_id)
        if not project or project.user_id != user.id:
            return []
        deps = db.scalars(
            select(Deployment)
            .where(Deployment.project_id == project_id)
            .order_by(desc(Deployment.created_at))
        ).all()
        return [DeploymentService._to_read(d, project.name) for d in deps]

    @staticmethod
    def active_pipeline(db: Session, user: User) -> list[PipelineStageRead]:
        """Return pipeline stages for the most recent in-progress deployment."""
        dep = db.scalar(
            select(Deployment)
            .join(Project)
            .where(
                Project.user_id == user.id,
                Deployment.status.in_(
                    [
                        DeploymentStatus.QUEUED.value,
                        DeploymentStatus.BUILDING.value,
                        DeploymentStatus.DEPLOYING.value,
                    ]
                ),
            )
            .order_by(desc(Deployment.created_at))
        )
        
        if not dep:
            return []

        status = dep.status

        def stage(name: str, icon: str, idx: int) -> PipelineStageRead:
            order = ["queued", "building", "deploying", "success"]
            current_idx = (
                order.index(status) if status in order else 3
            )
            if idx < current_idx:
                st = "success"
            elif idx == current_idx and status not in ("success", "failed"):
                st = "running" if status != "queued" else "pending"
            elif status == "failed" and idx == current_idx:
                st = "failed"
            else:
                st = "pending"
            return PipelineStageRead(
                name=name,
                status=st,
                duration="0m 15s" if st != "pending" else "—",
                icon=icon,
            )

        return [
            stage("Source", "git-branch", 0),
            stage("Build", "hammer", 1),
            stage("Test", "flask-conical", 2),
            stage("Security Scan", "shield-check", 3),
            stage("Deploy", "rocket", 4),
            stage("Verify", "check-circle", 5),
        ]

    @staticmethod
    def count_active(db: Session, user: User) -> int:
        return db.scalar(
            select(func.count(Deployment.id))
            .join(Project)
            .where(
                Project.user_id == user.id,
                Deployment.status.in_(
                    [
                        DeploymentStatus.QUEUED.value,
                        DeploymentStatus.BUILDING.value,
                        DeploymentStatus.DEPLOYING.value,
                    ]
                ),
            )
        ) or 0

    @staticmethod
    def count_failed_recent(db: Session, user: User) -> int:
        return db.scalar(
            select(func.count(Deployment.id))
            .join(Project)
            .where(
                Project.user_id == user.id,
                Deployment.status == DeploymentStatus.FAILED.value,
            )
        ) or 0

    @staticmethod
    def simulate_outcome() -> str:
        return DeploymentStatus.SUCCESS.value if random.random() > 0.15 else DeploymentStatus.FAILED.value
