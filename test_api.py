from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

print("--- 1. Testing GET /api/messages without auth ---")
res = client.get("/api/messages")
print("Status:", res.status_code, "Body:", res.text)

print("\n--- 2. Testing POST /api/login ---")
res = client.post("/api/login", json={"password": "caromilu"})
print("Status:", res.status_code, "Body:", res.text)
token = res.json().get("token")

print("\n--- 3. Testing GET /api/messages with auth ---")
res = client.get("/api/messages", headers={"Authorization": f"Bearer {token}"})
print("Status:", res.status_code, "Body:", res.text)

print("\n--- 4. Testing POST /api/contact ---")
res = client.post("/api/contact", json={
    "name": "Doubt Test",
    "email": "doubt@test.com",
    "phone": "+123456789",
    "message": "Testing resilience under doubt"
})
print("Status:", res.status_code, "Body:", res.text)
msg_id = res.json().get("id")

print("\n--- 5. Testing DELETE /api/messages/{id} ---")
res = client.delete(f"/api/messages/{msg_id}", headers={"Authorization": f"Bearer {token}"})
print("Status:", res.status_code, "Body:", res.text)

print("\n--- 6. Testing Static Files (admin.html) ---")
res = client.get("/admin.html")
print("Status:", res.status_code, "Length:", len(res.text))
