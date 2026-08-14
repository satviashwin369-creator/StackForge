import uuid
from datetime import datetime, timezone

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.deployment import Deployment, DeploymentStatus
from app.models.project import Project, ProjectStatus
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate


def _relative_time(dt: datetime | None) -> str:
    if not dt:
        return "Never"
    now = datetime.now(timezone.utc)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    delta = now - dt
    minutes = int(delta.total_seconds() // 60)
    if minutes < 1:
        return "Just now"
    if minutes < 60:
        return f"{minutes} min ago"
    hours = minutes // 60
    if hours < 24:
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    days = hours // 24
    return f"{days} day{'s' if days > 1 else ''} ago"


def _display_status(project: Project, latest: Deployment | None) -> str:
    if project.status == ProjectStatus.INACTIVE.value:
        return "idle"
    if not latest:
        return "idle"
    if latest.status in (
        DeploymentStatus.BUILDING.value,
        DeploymentStatus.DEPLOYING.value,
    ):
        return "building"
    if latest.status == DeploymentStatus.FAILED.value:
        return "failed"
    if latest.status == DeploymentStatus.QUEUED.value:
        return "building"
    if latest.status == DeploymentStatus.SUCCESS.value:
        return "running"
    return "idle"


def _health_score(latest: Deployment | None) -> int:
    if not latest:
        return 95
    if latest.status == DeploymentStatus.SUCCESS.value:
        return 98
    if latest.status == DeploymentStatus.FAILED.value:
        return 45
    if latest.status in (DeploymentStatus.BUILDING.value, DeploymentStatus.DEPLOYING.value):
        return 88
    return 90


def _tech_stack(framework: str | None) -> list[str]:
    mapping = {
        "Next.js": ["Next.js", "TypeScript", "Tailwind"],
        "Node.js": ["Node.js", "Express", "PostgreSQL"],
        "Go": ["Go", "gRPC", "Redis"],
        "Python": ["Python", "FastAPI", "Docker"],
        "Rust": ["Rust", "Wasm", "Tokio"],
    }
    if framework and framework in mapping:
        return mapping[framework]
    return [framework or "Docker", "Kubernetes", "CI/CD"]


class ProjectService:
    @staticmethod
    def _to_read(project: Project, latest: Deployment | None) -> ProjectRead:
        return ProjectRead(
            id=str(project.id),
            name=project.name,
            description=project.description or "",
            status=_display_status(project, latest),
            framework=project.framework or "Docker",
            lastDeployed=_relative_time(
                latest.created_at if latest else project.updated_at
            ),
            healthScore=_health_score(latest),
            repo=project.repo or f"github.com/stackforge/{project.name}",
            branch=project.branch,
            techStack=_tech_stack(project.framework),
            db_status=project.status,
            created_at=project.created_at,
        )

    @staticmethod
    def _latest_deployment(db: Session, project_id: uuid.UUID) -> Deployment | None:
        return db.scalar(
            select(Deployment)
            .where(Deployment.project_id == project_id)
            .order_by(desc(Deployment.created_at))
            .limit(1)
        )

    @staticmethod
    def create(db: Session, user: User, payload: ProjectCreate) -> ProjectRead:
        project = Project(
            user_id=user.id,
            name=payload.name,
            description=payload.description,
            status=payload.status,
            framework=payload.framework,
            repo=payload.repo,
            branch=payload.branch,
        )
        db.add(project)
        db.commit()
        db.refresh(project)
        return ProjectService._to_read(project, None)

    @staticmethod
    def list_for_user(db: Session, user: User) -> list[ProjectRead]:
        projects = db.scalars(
            select(Project).where(Project.user_id == user.id).order_by(Project.name)
        ).all()
        result = []
        for p in projects:
            latest = ProjectService._latest_deployment(db, p.id)
            result.append(ProjectService._to_read(p, latest))
        return result

    @staticmethod
    def get(db: Session, user: User, project_id: uuid.UUID) -> ProjectRead | None:
        project = db.get(Project, project_id)
        if not project or project.user_id != user.id:
            return None
        latest = ProjectService._latest_deployment(db, project.id)
        return ProjectService._to_read(project, latest)

    @staticmethod
    def update(
        db: Session, user: User, project_id: uuid.UUID, payload: ProjectUpdate
    ) -> ProjectRead | None:
        project = db.get(Project, project_id)
        if not project or project.user_id != user.id:
            return None
        data = payload.model_dump(exclude_unset=True)
        for key, value in data.items():
            setattr(project, key, value)
        db.commit()
        db.refresh(project)
        latest = ProjectService._latest_deployment(db, project.id)
        return ProjectService._to_read(project, latest)

    @staticmethod
    def delete(db: Session, user: User, project_id: uuid.UUID) -> bool:
        project = db.get(Project, project_id)
        if not project or project.user_id != user.id:
            return False
        db.delete(project)
        db.commit()
        return True
