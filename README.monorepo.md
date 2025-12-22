# VidOps — Microservices Auth MVP (Spring Boot 4 + Spring Cloud 2025.1)

This repo gives you a **production-style starting point** for **Login / Register** with a microservice setup:

- `auth-service`: credentials, JWT access tokens, refresh-token rotation, publishes `user.registered.v1` events to Kafka
- `user-service`: user profile (name/plan/credits), consumes `user.registered.v1`, exposes `GET /api/users/me`
- `api-gateway`: Spring Cloud Gateway routes `/api/auth/**` and `/api/users/**`
- `frontend`: static `app.html`, `login.html`, `register.html` served by Nginx, proxies `/api/*` to gateway (same-origin)

## Tech choices (current, boring-in-a-good-way)
- Spring Boot **4.0.1** (requires Java 17+, tested with Java 21) citeturn0search5turn0search2
- Spring Cloud **2025.1.0 (Oakwood)** for Boot 4.0.x citeturn1view0turn2search0
- Postgres per service, Flyway migrations
- Kafka for domain events (register -> profile create)
- Docker Compose for local dev, plus starter Kubernetes manifests

## Quick start (local)
### 1) Requirements
- Java 21 (or Java 17+)
- Docker + Docker Compose
- Maven 3.9+ recommended

### 2) Run everything
```bash
cp .env.example .env
docker compose up --build
```

### 3) Open UI
- App: http://localhost:8080/
- Login: http://localhost:8080/login.html
- Register: http://localhost:8080/register.html

### 4) Test APIs (via gateway)
```bash
# register
curl -i -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"enis@example.com","password":"StrongPass123!","fullName":"Enis Kaan"}'

# login
curl -i -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"enis@example.com","password":"StrongPass123!"}'
```

> Notes
> - Access token is returned in JSON. Refresh token is stored in an **HttpOnly cookie** (same-origin behind Nginx).
> - For the browser, `login.html` stores the access token in `localStorage` (simple MVP). In production, prefer **BFF** + cookies.

## Project layout
```
services/
  auth-service/
  user-service/
  api-gateway/
frontend/
k8s/
docker-compose.yml
```

## Next “Google/Tesla-grade” steps (roadmap)
- **Outbox pattern** for Kafka (exactly-once-ish event delivery)
- **Key rotation / JWKS** (RSA keys) instead of shared HS secret
- **API versioning** (`/api/v1/...`)
- **Rate limiting** at gateway (Redis)
- **Centralized config** (Spring Cloud Config) or K8s ConfigMaps
- **Observability**: OpenTelemetry + logs correlation + dashboards
- **CI/CD**: build, test, SBOM, container scan, deploy to K8s

