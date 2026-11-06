"""
StackForge backend test configuration.

Isolation strategy
------------------
The FastAPI lifespan (main.py) calls ``Base.metadata.create_all(bind=engine)``
using the engine imported from ``app.db.session``.  That engine normally points
to PostgreSQL.  In CI there is no PostgreSQL server, so the lifespan call would
fail before any test fixture runs.

Fix: replace ``app.db.session.engine`` and the aliased ``engine`` inside
``app.main`` with an in-memory SQLite engine **at module import time**, i.e.
before ``TestClient(app)`` triggers the lifespan.  ``app.db.session.SessionLocal``
is likewise redirected so that the production ``get_db`` dependency (used as a
fallback) also speaks SQLite.

The route-level ``get_db`` dependency is overridden per-test via
``app.dependency_overrides`` as before, giving each test its own session scope.
"""

import sys
import uuid
from typing import Generator
from unittest.mock import MagicMock

# ---------------------------------------------------------------------------
# 1. Mock redis *before* any app module is imported so the redis package is
#    never imported (it may not be installed in a plain CI venv).
# ---------------------------------------------------------------------------
if "redis" not in sys.modules:
    sys.modules["redis"] = MagicMock()

# ---------------------------------------------------------------------------
# 2. Build the in-memory SQLite engine BEFORE importing app.main so that the
#    module-level patch below takes effect before the lifespan closure captures
#    the engine reference.
# ---------------------------------------------------------------------------
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# ---------------------------------------------------------------------------
# 3. Patch app.db.session's engine and SessionLocal BEFORE importing app.main.
#    app.main imports `engine` and `SessionLocal` from app.db.session at the
#    top of that module, so we must redirect the source objects first.
# ---------------------------------------------------------------------------
import app.db.session as _db_session  # noqa: E402  (import after sys.modules patch)

_db_session.engine = engine
_db_session.SessionLocal = TestingSessionLocal

# ---------------------------------------------------------------------------
# 4. Now import app.main (which triggers its own import of engine/SessionLocal
#    from app.db.session).  The lifespan closure references `engine` via the
#    name in app.main's global namespace, so we must also patch that.
# ---------------------------------------------------------------------------
import app.main as _app_main  # noqa: E402

_app_main.engine = engine          # lifespan: Base.metadata.create_all(bind=engine)
_app_main.SessionLocal = TestingSessionLocal  # lifespan: seed_database uses SessionLocal

from fastapi.testclient import TestClient  # noqa: E402
from app.core.config import get_settings   # noqa: E402
from app.core.deps import get_db           # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.db.base import Base               # noqa: E402
from app.main import app                   # noqa: E402  (already imported above)
from app.models.user import User           # noqa: E402
from app.utils.redis_client import get_redis  # noqa: E402

import pytest  # noqa: E402


# ---------------------------------------------------------------------------
# 5. Redis mock — applied autouse so no test ever attempts a real Redis call.
# ---------------------------------------------------------------------------
@pytest.fixture(autouse=True)
def mock_redis(monkeypatch):
    """Mock Redis so unit tests do not require a running Redis instance."""
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
    # WS route uses SessionLocal directly for DB lookups — redirect to test session
    monkeypatch.setattr("app.api.routes.ws.SessionLocal", TestingSessionLocal)
    return fake_redis


# ---------------------------------------------------------------------------
# 6. Database fixtures — fresh schema per test function, rolled back after.
# ---------------------------------------------------------------------------
def _raw_db_session() -> Generator[Session, None, None]:
    """Create a fresh SQLite schema for each test and drop it after."""
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


# ---------------------------------------------------------------------------
# 7. HTTP test client — overrides get_db so routes use the test session.
# ---------------------------------------------------------------------------
def _raw_client(db_session: Session) -> Generator[TestClient, None, None]:
    """TestClient backed by the in-memory test database."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    # Prevent demo seeding during tests (would attempt DB writes on startup)
    settings = get_settings()
    settings.seed_demo_data = False

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    yield from _raw_client(db_session)


# ---------------------------------------------------------------------------
# 8. Convenience fixtures.
# ---------------------------------------------------------------------------
@pytest.fixture(scope="function")
def test_user(db_session: Session) -> User:
    """Pre-seed a user in the test database."""
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
    """Obtain a valid JWT Bearer header for test_user."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "TestSecret123!"},
    )
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}
