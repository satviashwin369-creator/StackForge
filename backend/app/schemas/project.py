from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=128)
    description: str | None = None
    framework: str | None = None
    repo: str | None = None
    branch: str = "main"
    status: str = "active"


class ProjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=128)
    description: str | None = None
    framework: str | None = None
    repo: str | None = None
    branch: str | None = None
    status: str | None = None


class ProjectRead(BaseModel):
    """Frontend-compatible project shape."""

    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    description: str
    status: str  # running | failed | building | idle
    framework: str
    lastDeployed: str
    healthScore: int
    repo: str
    branch: str
    techStack: list[str]
    db_status: str | None = None
    created_at: datetime | None = None


class ProjectDetailRead(ProjectRead):
    user_id: UUID
