import uuid

from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.common import ApiResponse
from app.schemas.deployment import DeploymentCreate, DeploymentRead, PipelineStageRead
from app.models.project import Project
from app.services.deployment_service import DeploymentService
from app.services.deployment_simulator import run_deployment_pipeline

router = APIRouter(prefix="/deployments", tags=["deployments"])


@router.post("", response_model=ApiResponse[DeploymentRead], status_code=status.HTTP_201_CREATED)
def trigger_deployment(
    payload: DeploymentCreate,
    background_tasks: BackgroundTasks,
    db: DbSession,
    user: CurrentUser,
):
    deployment = DeploymentService.create(
        db, user, payload, author_name=user.full_name or user.email
    )
    if not deployment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    project = db.get(Project, deployment.project_id)
    background_tasks.add_task(run_deployment_pipeline, deployment.id)
    return ApiResponse(
        data=DeploymentService._to_read(deployment, project.name if project else "unknown")
    )


@router.get("", response_model=ApiResponse[list[DeploymentRead]])
def list_deployments(db: DbSession, user: CurrentUser, limit: int = 50):
    return ApiResponse(data=DeploymentService.list_for_user(db, user, limit=limit))


@router.get("/pipeline", response_model=ApiResponse[list[PipelineStageRead]])
def get_pipeline(db: DbSession, user: CurrentUser):
    return ApiResponse(data=DeploymentService.active_pipeline(db, user))


@router.get("/{deployment_id}", response_model=ApiResponse[DeploymentRead])
def get_deployment(deployment_id: uuid.UUID, db: DbSession, user: CurrentUser):
    dep = DeploymentService.get(db, user, deployment_id)
    if not dep:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    return ApiResponse(data=dep)
