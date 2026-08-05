from fastapi import APIRouter

from app.api.routes import auth, dashboard, deployments, infra, logs, projects, ws

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(projects.router)
api_router.include_router(deployments.router)
api_router.include_router(logs.router)
api_router.include_router(infra.router)
api_router.include_router(dashboard.router)
api_router.include_router(ws.router)
