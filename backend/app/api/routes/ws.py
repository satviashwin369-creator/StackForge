import asyncio
import json
import uuid

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.services.log_service import LogService
from app.utils.redis_client import get_redis

router = APIRouter(tags=["websockets"])


def _authenticate_ws_token(token: str | None) -> uuid.UUID | None:
    """Validate query JWT token for WebSocket connections.

    Returns the authenticated user UUID if valid, or None if missing, malformed, or expired.
    Never logs or leaks the token value.
    """
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    try:
        return uuid.UUID(payload["sub"])
    except (ValueError, TypeError):
        return None


@router.websocket("/ws/logs/{deployment_id}")
async def websocket_deployment_logs(
    websocket: WebSocket,
    deployment_id: uuid.UUID,
    token: str | None = Query(None),
):
    user_id = _authenticate_ws_token(token)
    if not user_id:
        await websocket.close(code=1008)
        return

    await websocket.accept()

    db = SessionLocal()
    try:
        logs = LogService.list_for_deployment_id(db, deployment_id)
    finally:
        db.close()

    # Send historical logs first
    for log in logs:
        await websocket.send_json(log.model_dump())

    try:
        redis = get_redis()
        pubsub = redis.pubsub()
        channel = f"{LogService.STREAM_PREFIX}{deployment_id}"
        pubsub.subscribe(channel)
    except Exception:
        # If Redis is unavailable, historical logs have been sent; wait for disconnect
        try:
            while True:
                await asyncio.sleep(5.0)
        except WebSocketDisconnect:
            return

    try:
        while True:
            # Non-blocking poll (timeout 0.01s) to avoid blocking the asyncio event loop
            message = pubsub.get_message(ignore_subscribe_messages=True, timeout=0.01)
            if message and message.get("data"):
                data = message["data"]
                if isinstance(data, bytes):
                    data = data.decode()
                await websocket.send_text(data)
            await asyncio.sleep(0.3)
    except WebSocketDisconnect:
        try:
            pubsub.unsubscribe(channel)
            pubsub.close()
        except Exception:
            pass


@router.websocket("/ws/deployments/{deployment_id}/status")
async def websocket_deployment_status(
    websocket: WebSocket,
    deployment_id: uuid.UUID,
    token: str | None = Query(None),
):
    user_id = _authenticate_ws_token(token)
    if not user_id:
        await websocket.close(code=1008)
        return

    await websocket.accept()

    try:
        redis = get_redis()
        pubsub = redis.pubsub()
        channel = f"deployment:status:{deployment_id}"
        pubsub.subscribe(channel)
    except Exception:
        try:
            while True:
                await asyncio.sleep(5.0)
        except WebSocketDisconnect:
            return

    try:
        while True:
            # Non-blocking poll (timeout 0.01s) to avoid blocking the asyncio event loop
            message = pubsub.get_message(ignore_subscribe_messages=True, timeout=0.01)
            if message and message.get("data"):
                status = message["data"]
                if isinstance(status, bytes):
                    status = status.decode()
                await websocket.send_json({"deployment_id": str(deployment_id), "status": status})
            await asyncio.sleep(0.5)
    except WebSocketDisconnect:
        try:
            pubsub.unsubscribe(channel)
            pubsub.close()
        except Exception:
            pass
