import uuid
from datetime import datetime, timedelta, timezone

import pytest
from jose import jwt
from starlette.websockets import WebSocketDisconnect

from app.core.config import get_settings
from app.core.security import create_access_token
from app.models.user import User


def _make_expired_token(user_id: uuid.UUID) -> str:
    settings = get_settings()
    expired_time = datetime.now(timezone.utc) - timedelta(minutes=15)
    payload = {"sub": str(user_id), "exp": expired_time}
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def test_ws_logs_missing_token_rejected(client):
    dep_id = uuid.uuid4()
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/api/v1/ws/logs/{dep_id}"):
            pass
    assert exc_info.value.code == 1008


def test_ws_logs_invalid_token_rejected(client):
    dep_id = uuid.uuid4()
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/api/v1/ws/logs/{dep_id}?token=malformed.invalid.token"):
            pass
    assert exc_info.value.code == 1008


def test_ws_logs_expired_token_rejected(client, test_user: User):
    dep_id = uuid.uuid4()
    expired_token = _make_expired_token(test_user.id)
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/api/v1/ws/logs/{dep_id}?token={expired_token}"):
            pass
    assert exc_info.value.code == 1008


def test_ws_logs_valid_token_accepted(client, test_user: User):
    dep_id = uuid.uuid4()
    valid_token = create_access_token(str(test_user.id))
    with client.websocket_connect(f"/api/v1/ws/logs/{dep_id}?token={valid_token}") as ws:
        assert ws is not None


def test_ws_status_missing_token_rejected(client):
    dep_id = uuid.uuid4()
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/api/v1/ws/deployments/{dep_id}/status"):
            pass
    assert exc_info.value.code == 1008


def test_ws_status_invalid_token_rejected(client):
    dep_id = uuid.uuid4()
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/api/v1/ws/deployments/{dep_id}/status?token=bad.token"):
            pass
    assert exc_info.value.code == 1008


def test_ws_status_expired_token_rejected(client, test_user: User):
    dep_id = uuid.uuid4()
    expired_token = _make_expired_token(test_user.id)
    with pytest.raises(WebSocketDisconnect) as exc_info:
        with client.websocket_connect(f"/api/v1/ws/deployments/{dep_id}/status?token={expired_token}"):
            pass
    assert exc_info.value.code == 1008


def test_ws_status_valid_token_accepted(client, test_user: User):
    dep_id = uuid.uuid4()
    valid_token = create_access_token(str(test_user.id))
    with client.websocket_connect(f"/api/v1/ws/deployments/{dep_id}/status?token={valid_token}") as ws:
        assert ws is not None
