import requests

try:
    print("Testing GET /docs to verify server is alive...")
    res = requests.get("http://127.0.0.1:8000/docs")
    print(f"Docs Status: {res.status_code}")
except Exception as e:
    print(f"Could not reach server: {e}")

try:
    print("\nTesting POST /api/v1/auth/register...")
    res = requests.post(
        "http://127.0.0.1:8000/api/v1/auth/register",
        json={"email": "newuser@test.com", "password": "password123"}
    )
    print(f"Register Status: {res.status_code}")
    print(f"Register Body: {res.text}")
except Exception as e:
    print(f"Request failed: {e}")
