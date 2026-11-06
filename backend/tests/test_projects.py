def test_create_project(client, auth_headers):
    payload = {
        "name": "payments-api",
        "description": "Payment microservice",
        "status": "active",
        "framework": "Python",
        "repo": "github.com/stackforge/payments",
        "branch": "main",
    }
    response = client.post("/api/v1/projects", json=payload, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()["data"]
    assert data["name"] == "payments-api"
    assert data["branch"] == "main"
    assert "id" in data


def test_list_projects(client, auth_headers):
    # Create two projects
    client.post(
        "/api/v1/projects",
        json={"name": "svc-a", "status": "active", "branch": "main"},
        headers=auth_headers,
    )
    client.post(
        "/api/v1/projects",
        json={"name": "svc-b", "status": "active", "branch": "main"},
        headers=auth_headers,
    )

    response = client.get("/api/v1/projects", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) >= 2
    names = [p["name"] for p in data]
    assert "svc-a" in names
    assert "svc-b" in names


def test_get_project_by_id(client, auth_headers):
    res = client.post(
        "/api/v1/projects",
        json={"name": "auth-service", "status": "active", "branch": "main"},
        headers=auth_headers,
    )
    proj_id = res.json()["data"]["id"]

    get_res = client.get(f"/api/v1/projects/{proj_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert get_res.json()["data"]["name"] == "auth-service"


def test_update_project(client, auth_headers):
    res = client.post(
        "/api/v1/projects",
        json={"name": "frontend-app", "status": "active", "branch": "main"},
        headers=auth_headers,
    )
    proj_id = res.json()["data"]["id"]

    patch_res = client.patch(
        f"/api/v1/projects/{proj_id}",
        json={"name": "frontend-web", "description": "Updated description"},
        headers=auth_headers,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["name"] == "frontend-web"
    assert patch_res.json()["data"]["description"] == "Updated description"


def test_delete_project(client, auth_headers):
    res = client.post(
        "/api/v1/projects",
        json={"name": "temp-project", "status": "active", "branch": "main"},
        headers=auth_headers,
    )
    proj_id = res.json()["data"]["id"]

    del_res = client.delete(f"/api/v1/projects/{proj_id}", headers=auth_headers)
    assert del_res.status_code == 200

    # Ensure it no longer exists
    get_res = client.get(f"/api/v1/projects/{proj_id}", headers=auth_headers)
    assert get_res.status_code == 404
