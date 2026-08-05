from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class LogCreate(BaseModel):
    deployment_id: UUID
    message: str = Field(min_length=1)
    level: str = "info"
    service: str = "stackforge"


class LogRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    timestamp: str
    level: str
    message: str
    service: str
