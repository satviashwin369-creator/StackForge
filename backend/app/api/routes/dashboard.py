from fastapi import APIRouter

from app.core.deps import CurrentUser, DbSession
from app.schemas.common import ApiResponse
from app.schemas.infra import ActivityRead, KPIStatsRead, MetricPoint
from app.services.deployment_service import DeploymentService
from app.services.infra_service import InfraService
from app.schemas.deployment import PipelineStageRead

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis", response_model=ApiResponse[KPIStatsRead])
def kpis(db: DbSession, user: CurrentUser):
    return ApiResponse(data=InfraService.get_kpis(db, user))


@router.get("/activities", response_model=ApiResponse[list[ActivityRead]])
def activities(db: DbSession, user: CurrentUser, limit: int = 10):
    return ApiResponse(data=InfraService.get_activities(db, user, limit=limit))


@router.get("/metrics/cpu", response_model=ApiResponse[list[MetricPoint]])
def cpu_metrics():
    metrics = InfraService.get_metrics()
    return ApiResponse(data=metrics.cpu)


@router.get("/metrics/deployment-success", response_model=ApiResponse[list[MetricPoint]])
def deployment_success_metrics():
    metrics = InfraService.get_metrics()
    # Reuse CPU series shape for demo bar chart data
    return ApiResponse(
        data=[
            MetricPoint(time=p.time, value=abs(p.value) % 30, value2=abs((p.value2 or 0)) % 5)
            for p in metrics.cpu
        ]
    )


@router.get("/pipeline", response_model=ApiResponse[list[PipelineStageRead]])
def pipeline(db: DbSession, user: CurrentUser):
    return ApiResponse(data=DeploymentService.active_pipeline(db, user))
