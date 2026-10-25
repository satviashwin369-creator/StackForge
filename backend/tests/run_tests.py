"""Standalone test runner for StackForge backend test suite.

Allows running all unit and integration tests locally without requiring pytest
to be installed in the global host environment, while also serving as a secondary
local verification runner alongside pytest.
"""

import os
import sys
import unittest
from unittest.mock import MagicMock

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Mock redis module in sys.modules if not installed on host
if "redis" not in sys.modules:
    sys.modules["redis"] = MagicMock()

import app.utils.redis_client
import app.services.log_service
import app.services.deployment_simulator
import app.services.infra_service

fake_redis = MagicMock()
fake_redis.get.return_value = None
fake_redis.setex.return_value = True
fake_redis.publish.return_value = 1

app.utils.redis_client.get_redis = lambda: fake_redis
app.services.log_service.get_redis = lambda: fake_redis
app.services.deployment_simulator.get_redis = lambda: fake_redis
app.services.infra_service.get_redis = lambda: fake_redis

from tests.conftest import db_session, client, test_user, auth_headers
import tests.test_auth as ta
import tests.test_projects as tp
import tests.test_infra as ti


class StackForgeBackendTestSuite(unittest.TestCase):
    def setUp(self):
        self._db_gen = db_session()
        self.db = next(self._db_gen)
        self._client_gen = client(self.db)
        self.client = next(self._client_gen)

    def tearDown(self):
        try:
            next(self._client_gen)
        except StopIteration:
            pass
        try:
            next(self._db_gen)
        except StopIteration:
            pass

    # --- Auth Tests ---
    def test_auth_register_success(self):
        ta.test_register_user_success(self.client)

    def test_auth_register_duplicate_fails(self):
        ta.test_register_duplicate_email_fails(self.client)

    def test_auth_login_success(self):
        user = test_user(self.db)
        ta.test_login_success(self.client, user)

    def test_auth_login_invalid_password(self):
        user = test_user(self.db)
        ta.test_login_invalid_password(self.client, user)

    def test_auth_get_current_user_me(self):
        user = test_user(self.db)
        headers = auth_headers(self.client, user)
        ta.test_get_current_user_me(self.client, user, headers)

    # --- Project Tests ---
    def test_projects_create_success(self):
        user = test_user(self.db)
        headers = auth_headers(self.client, user)
        tp.test_create_project_success(self.client, headers)

    def test_projects_list(self):
        user = test_user(self.db)
        headers = auth_headers(self.client, user)
        tp.test_list_projects(self.client, headers)

    def test_projects_crud_lifecycle(self):
        user = test_user(self.db)
        headers = auth_headers(self.client, user)
        tp.test_project_crud_lifecycle(self.client, headers)

    def test_projects_user_isolation(self):
        user = test_user(self.db)
        headers = auth_headers(self.client, user)
        tp.test_user_cannot_access_other_user_project(self.client, self.db, headers)

    # --- Infra / Telemetry Tests ---
    def test_infra_health(self):
        ti.test_health_endpoint(self.client)

    def test_infra_metrics(self):
        ti.test_metrics_endpoint(self.client)


if __name__ == "__main__":
    runner = unittest.TextTestRunner(verbosity=2)
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(StackForgeBackendTestSuite)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
