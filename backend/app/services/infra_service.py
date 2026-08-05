import json
import random
from datetime import datetime, timezone

import psutil

from app.schemas.infra import (
    ActivityRead,
    InfraMetricsRead,
    InfraStatusRead,
    KPIStatsRead,
    MetricPoint,
    ServerStatusRead,
)
from app.services.deployment_service import DeploymentService
from app.utils.redis_client import get_redis
from sqlalchemy.orm import Session

from app.models.project import Project, ProjectStatus
from app.models.user import User
from sqlalchemy import func, select

from app.models.deployment import Deployment, DeploymentStatus


CACHE_TTL = 30
METRICS_KEY = "infra:metrics"
STATUS_KEY = "infra:status"


class InfraService:
    @staticmethod
    def _mock_servers() -> list[ServerStatusRead]:
        return [
            ServerStatusRead(
                id="srv-001",
                name="prod-api-01",
                region="eu-west-1 (Ireland)",
                status="healthy",
                cpu=round(psutil.cpu_percent(interval=0.1) or 42, 1),
                ram=round(psutil.virtual_memory().percent or 67, 1),
                disk=54.0,
                uptime="45d 12h",
                uptimePercent=99.99,
                ip="10.0.1.101",
                os="Ubuntu 24.04 LTS",
            ),
            ServerStatusRead(
                id="srv-002",
                name="prod-api-02",
                region="eu-west-1 (Ireland)",
                status="healthy",
                cpu=38.0,
                ram=71.0,
                disk=48.0,
                uptime="45d 12h",
                uptimePercent=99.99,
                ip="10.0.1.102",
                os="Ubuntu 24.04 LTS",
            ),
            ServerStatusRead(
                id="srv-003",
                name="prod-db-primary",
                region="eu-central-1 (Frankfurt)",
                status="healthy",
                cpu=61.0,
                ram=82.0,
                disk=72.0,
                uptime="90d 4h",
                uptimePercent=99.999,
                ip="10.0.2.50",
                os="Debian 12",
            ),
            ServerStatusRead(
                id="srv-004",
                name="prod-worker-01",
                region="eu-west-1 (Ireland)",
                status="warning",
                cpu=87.0,
                ram=91.0,
                disk=65.0,
                uptime="12d 8h",
                uptimePercent=99.95,
                ip="10.0.3.201",
                os="Ubuntu 24.04 LTS",
            ),
            ServerStatusRead(
                id="srv-005",
                name="staging-api-01",
                region="eu-west-2 (London)",
                status="healthy",
                cpu=15.0,
                ram=34.0,
                disk=28.0,
                uptime="30d 2h",
                uptimePercent=99.9,
                ip="10.1.1.101",
                os="Ubuntu 24.04 LTS",
            ),
            ServerStatusRead(
                id="srv-006",
                name="prod-cache-01",
                region="eu-central-1 (Frankfurt)",
                status="critical",
                cpu=95.0,
                ram=96.0,
                disk=88.0,
                uptime="2d 1h",
                uptimePercent=98.5,
                ip="10.0.4.50",
                os="Alpine 3.19",
            ),
        ]

    @staticmethod
    def get_status() -> InfraStatusRead:
        try:
            cached = get_redis().get(STATUS_KEY)
            if cached:
                return InfraStatusRead.model_validate_json(cached)
        except Exception:
            pass

        servers = InfraService._mock_servers()
        healthy = sum(1 for s in servers if s.status == "healthy")
        warning = sum(1 for s in servers if s.status == "warning")
        critical = sum(1 for s in servers if s.status == "critical")
        overall = "healthy"
        if critical:
            overall = "critical"
        elif warning:
            overall = "degraded"

        payload = InfraStatusRead(
            total_servers=len(servers),
            healthy=healthy,
            warning=warning,
            critical=critical,
            overall_status=overall,
            servers=servers,
        )
        try:
            get_redis().setex(STATUS_KEY, CACHE_TTL, payload.model_dump_json())
        except Exception:
            pass
        return payload

    @staticmethod
    def get_metrics() -> InfraMetricsRead:
        try:
            cached = get_redis().get(METRICS_KEY)
            if cached:
                return InfraMetricsRead.model_validate_json(cached)
        except Exception:
            pass

        times = [
            "00:00", "02:00", "04:00", "06:00", "08:00", "10:00",
            "12:00", "14:00", "16:00", "18:00", "20:00", "22:00",
        ]
        base_cpu = psutil.cpu_percent(interval=0.1) or 50

        def series(offset: float) -> list[MetricPoint]:
            return [
                MetricPoint(
                    time=t,
                    value=round(base_cpu + random.uniform(-15, 15) + offset, 1),
                    value2=round(base_cpu + random.uniform(-10, 20) + offset + 5, 1),
                )
                for t in times
            ]

        payload = InfraMetricsRead(
            cpu=series(0),
            memory=series(8),
            disk=[MetricPoint(time=t, value=round(50 + i * 2.2, 1)) for i, t in enumerate(times)],
        )
        try:
            get_redis().setex(METRICS_KEY, CACHE_TTL, payload.model_dump_json())
        except Exception:
            pass
        return payload

    @staticmethod
    def get_kpis(db: Session, user: User) -> KPIStatsRead:
        active = DeploymentService.count_active(db, user)
        failed = DeploymentService.count_failed_recent(db, user)
        running = db.scalar(
            select(func.count(Project.id)).where(
                Project.user_id == user.id,
                Project.status == ProjectStatus.ACTIVE.value,
            )
        ) or 0
        total_deps = db.scalar(
            select(func.count(Deployment.id))
            .join(Project)
            .where(Project.user_id == user.id)
        ) or 0
        success = db.scalar(
            select(func.count(Deployment.id))
            .join(Project)
            .where(
                Project.user_id == user.id,
                Deployment.status == DeploymentStatus.SUCCESS.value,
            )
        ) or 0
        uptime = 99.97 if total_deps == 0 else round(99.5 + (success / max(total_deps, 1)) * 0.5, 2)

        return KPIStatsRead(
            activeDeployments=active or 12,
            uptimePercent=uptime,
            failedBuilds=failed,
            runningServices=running,
            activeDeploymentsTrend=8.2,
            uptimeTrend=0.02,
            failedBuildsTrend=-12.0,
            runningServicesTrend=2.0,
        )

    @staticmethod
    def get_activities(db: Session, user: User, limit: int = 10) -> list[ActivityRead]:
        deps = db.scalars(
            select(Deployment)
            .join(Project)
            .where(Project.user_id == user.id)
            .order_by(Deployment.created_at.desc())
            .limit(limit)
        ).all()
        activities: list[ActivityRead] = []
        for d in deps:
            activities.append(
                ActivityRead(
                    id=str(d.id),
                    type="deployment",
                    message=f"{d.project.name} → {d.status} ({d.environment})",
                    timestamp=d.created_at.isoformat(),
                    user=d.author or "System",
                )
            )
        return activities
