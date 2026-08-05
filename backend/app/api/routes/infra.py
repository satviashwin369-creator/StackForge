from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.common import ApiResponse
from app.schemas.infra import ActivityRead, InfraMetricsRead, InfraStatusRead, KPIStatsRead
from app.services.infra_service import InfraService

router = APIRouter(prefix="/infra", tags=["infrastructure"])


@router.get("/status", response_model=ApiResponse[InfraStatusRead])
def infra_status():
    return ApiResponse(data=InfraService.get_status())


@router.get("/metrics", response_model=ApiResponse[InfraMetricsRead])
def infra_metrics():
    return ApiResponse(data=InfraService.get_metrics())


@router.get("/kpis", response_model=ApiResponse[KPIStatsRead])
def dashboard_kpis(db: DbSession, user: CurrentUser):
    return ApiResponse(data=InfraService.get_kpis(db, user))


@router.get("/activities", response_model=ApiResponse[list[ActivityRead]])
def dashboard_activities(db: DbSession, user: CurrentUser, limit: int = 10):
    return ApiResponse(data=InfraService.get_activities(db, user, limit=limit))
