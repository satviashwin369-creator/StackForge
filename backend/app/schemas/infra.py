from pydantic import BaseModel


class ServerStatusRead(BaseModel):
    id: str
    name: str
    region: str
    status: str
    cpu: float
    ram: float
    disk: float
    uptime: str
    uptimePercent: float
    ip: str
    os: str


class InfraStatusRead(BaseModel):
    total_servers: int
    healthy: int
    warning: int
    critical: int
    overall_status: str
    servers: list[ServerStatusRead]


class MetricPoint(BaseModel):
    time: str
    value: float
    value2: float | None = None


class InfraMetricsRead(BaseModel):
    cpu: list[MetricPoint]
    memory: list[MetricPoint]
    disk: list[MetricPoint]


class KPIStatsRead(BaseModel):
    activeDeployments: int
    uptimePercent: float
    failedBuilds: int
    runningServices: int
    activeDeploymentsTrend: float
    uptimeTrend: float
    failedBuildsTrend: float
    runningServicesTrend: float


class ActivityRead(BaseModel):
    id: str
    type: str
    message: str
    timestamp: str
    user: str
