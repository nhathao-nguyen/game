# Koyeb Neon Auth Deploy Design

## Goal

Prepare the `server/` Express backend for Koyeb Free deployment with Neon Postgres as the persistent database. The backend must support health checks, user registration, user login, password hashing, JWT issuance, production environment validation, and cloud-safe startup behavior.

## Hosting Approach

The backend remains a standard Node.js Express service deployed from GitHub to Koyeb as a Web Service. Koyeb provides the runtime port through `process.env.PORT`; the server must not hardcode cloud port values. Neon provides the Postgres database through `DATABASE_URL`, avoiding local filesystem persistence problems on free hosting.

## Architecture

The backend keeps a layered structure:

- `routes/`: HTTP endpoint definitions.
- `controllers/`: request/response adapters.
- `services/`: auth, token, password, and health business logic.
- `data/`: Postgres connection and schema initialization.
- `repositories/`: user persistence operations.
- `middlewares/`: 404, error, and async request handling.
- `config/`: environment parsing and production validation.

The Express app is created through `createApp(dependencies)` so tests can inject a fake user repository while production uses Neon Postgres.

## API

- `GET /health`: returns JSON server status.
- `POST /auth/register`: creates a user with a hashed password and returns a JWT.
- `POST /auth/login`: verifies credentials and returns a JWT.

Registration and login accept JSON:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Successful auth responses return:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "generated-user-id",
      "email": "user@example.com"
    },
    "token": "jwt-token"
  }
}
```

## Database

Neon Postgres stores users in a `users` table:

- `id TEXT PRIMARY KEY`
- `email TEXT UNIQUE NOT NULL`
- `password_hash TEXT NOT NULL`
- `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`
- `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`

The server runs a small idempotent schema initialization on startup. This keeps first deploy simple without adding a heavy migration framework.

## Environment

Production requires:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `CORS_ORIGIN`

Optional variables:

- `APP_NAME`
- `API_PREFIX`
- `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `JSON_BODY_LIMIT`

Development and test can use safe defaults for non-secret values, but production fails fast if required variables are missing.

## Error Handling

Validation errors return `400`, duplicate email returns `409`, invalid credentials return `401`, missing routes return `404`, and unexpected errors return `500`. Responses are JSON. Production hides stack traces.

## Deployment

Koyeb deployment uses:

- Service type: Web Service
- Repository: GitHub repository on branch `main`
- Root directory: `server`
- Build command: `npm ci`
- Run command: `npm run start:prod`
- Health check path: `/health`

Koyeb and Neon credentials are not committed. They must be configured as environment variables in Koyeb.
