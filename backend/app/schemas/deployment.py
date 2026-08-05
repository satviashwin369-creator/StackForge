from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class DeploymentCreate(BaseModel):
    project_id: UUID
    commit: str = Field(default="a1b2c3d", max_length=40)
    commit_message: str | None = None
    branch: str | None = None
    environment: str = "production"


class DeploymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    projectName: str
    status: str
    commit: str
    commitMessage: str
    branch: str
    duration: str
    timestamp: str
    author: str
    environment: str
    project_id: UUID | None = None
    created_at: datetime | None = None


class PipelineStageRead(BaseModel):
    name: str
    status: str
    duration: str
    icon: str
