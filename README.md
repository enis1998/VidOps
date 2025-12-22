# VidOps (Monorepo)

This repository contains a small microservice setup plus your existing Thymeleaf UI.

## Services
- **api-gateway** (Spring Cloud Gateway) — `:8080`
- **auth-service** — `:8081`
- **user-service** — `:8082`
- **webapp** (Thymeleaf UI) — `:8090` (served via the gateway as well)

## Run locally (Docker)
1. Copy env file:
   ```bash
   cp .env.example .env
   ```
   Set `JWT_SECRET_BASE64` to a Base64-encoded 32-byte random value.

2. Start:
   ```bash
   docker compose up --build
   ```

3. Open UI:
   - `http://localhost:8080`

## How UI auth works
- UI calls `.../api/auth/*` via the gateway.
- `accessToken` is stored in `localStorage`.
- `refreshToken` is an **HttpOnly cookie** set by `auth-service` (so the UI cannot read it).

## Quick flow
- Go to **Register** → create user
- Login → go to **/app**
