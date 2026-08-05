import uuid

from fastapi import APIRouter, HTTPException, status

from app.core.deps import CurrentUser, DbSession
from app.schemas.common import ApiResponse, MessageResponse
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ApiResponse[ProjectRead], status_code=status.HTTP_201_CREATED)
def create_project(payload: ProjectCreate, db: DbSession, user: CurrentUser):
    project = ProjectService.create(db, user, payload)
    return ApiResponse(data=project)


@router.get("", response_model=ApiResponse[list[ProjectRead]])
def list_projects(db: DbSession, user: CurrentUser):
    return ApiResponse(data=ProjectService.list_for_user(db, user))


@router.get("/{project_id}", response_model=ApiResponse[ProjectRead])
def get_project(project_id: uuid.UUID, db: DbSession, user: CurrentUser):
    project = ProjectService.get(db, user, project_id)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ApiResponse(data=project)


@router.patch("/{project_id}", response_model=ApiResponse[ProjectRead])
def update_project(
    project_id: uuid.UUID,
    payload: ProjectUpdate,
    db: DbSession,
    user: CurrentUser,
):
    project = ProjectService.update(db, user, project_id, payload)
    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ApiResponse(data=project)


@router.delete("/{project_id}", response_model=ApiResponse[MessageResponse])
def delete_project(project_id: uuid.UUID, db: DbSession, user: CurrentUser):
    if not ProjectService.delete(db, user, project_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    return ApiResponse(data=MessageResponse(message="Project deleted"))
