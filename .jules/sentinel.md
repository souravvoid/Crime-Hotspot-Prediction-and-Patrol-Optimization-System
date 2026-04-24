## 2024-04-24 - Overly Permissive CORS Configuration
**Vulnerability:** CORS was configured with `allow_origins=["*"]` in the FastAPI backend, which is overly permissive and allows any domain to make cross-origin requests to the API.
**Learning:** This is a common misconfiguration that can lead to Cross-Site Request Forgery (CSRF) and other cross-origin attacks if an attacker hosts a malicious website that users visit while authenticated.
**Prevention:** Always restrict `allow_origins` to the specific domains that are expected to access the API, such as the frontend application's origin (e.g., `http://localhost:5173` for development).
