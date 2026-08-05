import asyncio
import json
import uuid

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.db.session import SessionLocal
from app.services.log_service import LogService
from app.utils.redis_client import get_redis

router = APIRouter(tags=["websockets"])


@router.websocket("/ws/logs/{deployment_id}")
async def websocket_deployment_logs(websocket: WebSocket, deployment_id: uuid.UUID):
    await websocket.accept()
    db = SessionLocal()
    try:
        logs = LogService.list_for_deployment_id(db, deployment_id)
    finally:
        db.close()

    # Send historical logs (no auth on WS for demo — add token query param in production)
    for log in logs:
        await websocket.send_json(log.model_dump())

    redis = get_redis()
    pubsub = redis.pubsub()
    channel = f"{LogService.STREAM_PREFIX}{deployment_id}"
    pubsub.subscribe(channel)

    try:
        while True:
            message = pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message and message.get("data"):
                data = message["data"]
                if isinstance(data, bytes):
                    data = data.decode()
                await websocket.send_text(data)
            await asyncio.sleep(0.3)
    except WebSocketDisconnect:
        pubsub.unsubscribe(channel)
        pubsub.close()


@router.websocket("/ws/deployments/{deployment_id}/status")
async def websocket_deployment_status(websocket: WebSocket, deployment_id: uuid.UUID):
    await websocket.accept()
    redis = get_redis()
    pubsub = redis.pubsub()
    channel = f"deployment:status:{deployment_id}"
    pubsub.subscribe(channel)

    try:
        while True:
            message = pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if message and message.get("data"):
                status = message["data"]
                if isinstance(status, bytes):
                    status = status.decode()
                await websocket.send_json({"deployment_id": str(deployment_id), "status": status})
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        pubsub.unsubscribe(channel)
        pubsub.close()
