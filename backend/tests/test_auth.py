def test_register_success(client):
    payload = {
        "email": "newdev@stackforge.io",
        "password": "SecurePassword123!",
        "full_name": "Dev One",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "access_token" in data["data"]


def test_register_duplicate_email(client, test_user):
    payload = {
        "email": test_user.email,
        "password": "AnotherPassword123!",
        "full_name": "Duplicate User",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.text.lower()


def test_login_success(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "TestSecret123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data["data"]


def test_login_invalid_password(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": test_user.email, "password": "WrongPassword999!"},
    )
    assert response.status_code == 401
    assert "invalid email or password" in response.text.lower()


def test_login_nonexistent_user(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@stackforge.io", "password": "SomePassword123!"},
    )
    assert response.status_code == 401


def test_me_authenticated(client, auth_headers, test_user):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["email"] == test_user.email
    assert data["full_name"] == test_user.full_name


def test_me_unauthenticated(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401
