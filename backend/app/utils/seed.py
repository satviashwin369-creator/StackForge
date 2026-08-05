"""Seed demo data for portfolio demos."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.deployment import Deployment, DeploymentStatus
from app.models.project import Project, ProjectStatus
from app.models.user import User
from app.services.log_service import LogService
from app.models.log import LogLevel


DEMO_EMAIL = "demo@stackforge.io"
DEMO_PASSWORD = "StackForge123!"


def seed_database(db: Session) -> None:
    user = db.scalar(select(User).where(User.email == DEMO_EMAIL))
    if not user:
        user = User(
            email=DEMO_EMAIL,
            hashed_password=hash_password(DEMO_PASSWORD),
            full_name="Sarah Chen",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if db.scalar(select(Project).where(Project.user_id == user.id)):
        return

    samples = [
        Project(
            user_id=user.id,
            name="payment-gateway",
            description="Core payment processing microservice",
            status=ProjectStatus.ACTIVE.value,
            framework="Node.js",
            repo="github.com/stackforge/payment-gateway",
            branch="main",
        ),
        Project(
            user_id=user.id,
            name="user-auth-service",
            description="OAuth2/OIDC authentication service",
            status=ProjectStatus.ACTIVE.value,
            framework="Go",
            repo="github.com/stackforge/auth-service",
            branch="main",
        ),
        Project(
            user_id=user.id,
            name="notification-engine",
            description="Real-time notification system",
            status=ProjectStatus.ACTIVE.value,
            framework="Python",
            repo="github.com/stackforge/notifications",
            branch="main",
        ),
    ]
    db.add_all(samples)
    db.commit()

    projects = db.scalars(select(Project).where(Project.user_id == user.id)).all()
    for project in projects:
        dep = Deployment(
            project_id=project.id,
            status=DeploymentStatus.SUCCESS.value,
            commit="a3f8b2c",
            commit_message="chore: initial StackForge seed deployment",
            branch=project.branch,
            environment="production",
            duration_seconds=142,
            author="Sarah Chen",
        )
        db.add(dep)
        db.commit()
        db.refresh(dep)
        LogService.append_system_log(
            db,
            dep.id,
            f"[{project.name}] Deployment completed successfully",
            LogLevel.INFO.value,
            project.name,
        )
