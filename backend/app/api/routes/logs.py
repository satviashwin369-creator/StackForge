import uuid

from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.common import ApiResponse
from app.schemas.log import LogCreate, LogRead
from app.services.deployment_service import DeploymentService
from app.services.log_service import LogService

router = APIRouter(prefix="/logs", tags=["logs"])


@router.post("", response_model=ApiResponse[LogRead], status_code=status.HTTP_201_CREATED)
def create_log(payload: LogCreate, db: DbSession, user: CurrentUser):
    entry = LogService.create(db, user, payload)
    if not entry:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    return ApiResponse(data=entry)


@router.get("/deployment/{deployment_id}", response_model=ApiResponse[list[LogRead]])
def get_logs_for_deployment(deployment_id: uuid.UUID, db: DbSession, user: CurrentUser):
    dep_check = DeploymentService.get(db, user, deployment_id)
    if not dep_check:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deployment not found")
    return ApiResponse(data=LogService.list_for_deployment(db, user, deployment_id))


@router.get("/recent", response_model=ApiResponse[list[LogRead]])
def get_recent_logs(db: DbSession, user: CurrentUser, limit: int = 50):
    return ApiResponse(data=LogService.list_recent(db, user, limit=limit))
