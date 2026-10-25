import uuid
from typing import Generator
from unittest.mock import MagicMock

try:
    import pytest
except ImportError:
    class _MockPytest:
        @staticmethod
        def fixture(*args, **kwargs):
            def decorator(f):
                return f
            if len(args) == 1 and callable(args[0]):
                return args[0]
            return decorator
    pytest = _MockPytest()

import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

if "redis" not in sys.modules:
    sys.modules["redis"] = MagicMock()

from app.core.config import get_settings
from app.core.deps import get_db
from app.core.security import hash_password
from app.db.base import Base
from app.main import app
from app.models.user import User
from app.utils.redis_client import get_redis

# In-memory SQLite engine for fast, isolated test execution
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(autouse=True)
def mock_redis(monkeypatch):
    """Mock Redis client so unit tests do not require an active Redis instance."""
    fake_redis = MagicMock()
    fake_redis.get.return_value = None
    fake_redis.setex.return_value = True
    fake_redis.publish.return_value = 1
    fake_pubsub = MagicMock()
    fake_pubsub.get_message.return_value = None
    fake_redis.pubsub.return_value = fake_pubsub
    monkeypatch.setattr("app.utils.redis_client.get_redis", lambda: fake_redis)
    monkeypatch.setattr("app.api.routes.ws.get_redis", lambda: fake_redis)
    monkeypatch.setattr("app.services.log_service.get_redis", lambda: fake_redis)
    monkeypatch.setattr("app.services.deployment_simulator.get_redis", lambda: fake_redis)
    monkeypatch.setattr("app.services.infra_service.get_redis", lambda: fake_redis)
    monkeypatch.setattr("app.api.routes.ws.SessionLocal", TestingSessionLocal)
    return fake_redis


def _raw_db_session() -> Generator[Session, None, None]:
    """Create a fresh schema for each test function and roll back after."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    yield from _raw_db_session()


def _raw_client(db_session: Session) -> Generator[TestClient, None, None]:
    """TestClient that injects the in-memory test database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    # Disable automatic startup demo seeding during testing
    settings = get_settings()
    settings.seed_demo_data = False

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    yield from _raw_client(db_session)


@pytest.fixture(scope="function")
def test_user(db_session: Session) -> User:
    """Pre-seeded user in test database."""
    user = User(
        id=uuid.uuid4(),
        email="testuser@stackforge.io",
        hashed_password=hash_password("TestSecret123!"),
        full_name="Alex Platform",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def auth_headers(client: TestClient, test_user: User) -> dict[str, str]:
    """Obtain valid JWT Bearer header for test_user."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "TestSecret123!"},
    )
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
