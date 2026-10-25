from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest
from starlette.responses import Response

from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging import get_logger, setup_logging
from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.utils.seed import seed_database

settings = get_settings()
logger = get_logger("stackforge")

REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total HTTP Requests",
    ["method", "status_code", "endpoint"],
)
REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "HTTP Request Latency in seconds",
    ["method", "endpoint"],
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging(settings.debug)
    logger.info("starting", environment=settings.environment)
    Base.metadata.create_all(bind=engine)
    if settings.seed_demo_data:
        db = SessionLocal()
        try:
            seed_database(db)
            logger.info("demo_data_seeded")
        finally:
            db.close()
    yield
    logger.info("shutdown")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def prometheus_metrics_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time

    # Normalize path for high-cardinality mitigation if needed
    endpoint = request.url.path
    REQUEST_COUNT.labels(
        method=request.method,
        status_code=str(response.status_code),
        endpoint=endpoint,
    ).inc()
    REQUEST_DURATION.labels(
        method=request.method,
        endpoint=endpoint,
    ).observe(duration)
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("unhandled_error", path=str(request.url), error=str(exc))
    return JSONResponse(
        status_code=500,
        content={
            "code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred",
            "status": 500,
        },
    )


@app.get("/health")
def health():
    return {"status": "ok", "service": settings.app_name}


@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


app.include_router(api_router, prefix=settings.api_v1_prefix)
