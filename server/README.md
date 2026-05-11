# React TuTien Server

Express backend for the `react-tutien` project.

## Structure

```text
server/
  src/
    app.js
    server.js
    config/
    controllers/
    data/
    middlewares/
    repositories/
    routes/
    services/
    utils/
  tests/
```

## Local Setup

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
```

## Environment Variables

```text
PORT=3000
NODE_ENV=development
APP_NAME=react-tutien-api
API_PREFIX=/api/v1
CORS_ORIGIN=*
JSON_BODY_LIMIT=1mb
DATABASE_URL=postgres://user:password@host.neon.tech/database?sslmode=require
JWT_SECRET=change-this-local-development-secret
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```

Use a comma-separated `CORS_ORIGIN` value when you want to allow specific origins:

```text
CORS_ORIGIN=http://localhost:5173,https://example-client.com
```

## Scripts

```bash
npm run dev
npm start
npm run start:prod
npm test
```

## Endpoints

```text
GET /health
GET /api/v1/status
POST /auth/register
POST /auth/login
```

## Auth Requests

Register:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"player@example.com\",\"password\":\"password123\"}"
```

Login:

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"player@example.com\",\"password\":\"password123\"}"
```

## Deploy Notes

Recommended free deployment:

- API hosting: Koyeb Free Web Service
- Database: Neon Postgres
- Work directory: `server`
- Run command: `npm run start:prod`
- Exposed port: `8080`
- Route: `/ -> 8080`
- Health check path: `/health`

Koyeb Free scales to zero after idle time. The first request after sleep can have cold-start latency.

See [koyeb.md](./koyeb.md) for exact deployment settings.
