# Koyeb Deployment

This backend is ready for Koyeb Web Service deployment with Neon Postgres.

## Required Services

- Koyeb account
- Neon Postgres database
- GitHub repository connected to Koyeb

## Koyeb Dashboard Settings

Use these settings when creating the Web Service:

```text
Deployment method: GitHub
Repository: nhathao-nguyen/tutien-game
Branch: main
Builder: Buildpack
Work directory: server
Run command: npm run start:prod
Instance: Free
Exposed port: 8080 HTTP
Route: / -> 8080
Health check path: /health
```

Set these environment variables:

```text
NODE_ENV=production
PORT=8080
APP_NAME=tutien-game-api
API_PREFIX=/api/v1
CORS_ORIGIN=*
DATABASE_URL=<your-neon-connection-string>
JWT_SECRET=<long-random-secret>
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
JSON_BODY_LIMIT=1mb
```

## Koyeb CLI Option

After installing and authenticating the Koyeb CLI, deploy from GitHub with:

```bash
koyeb app init tutien-game-api \
  --git github.com/nhathao-nguyen/tutien-game \
  --git-branch main \
  --git-workdir server \
  --git-buildpack-run-command "npm run start:prod" \
  --ports "8080:http" \
  --routes "/:8080" \
  --env "NODE_ENV=production" \
  --env "PORT=8080" \
  --env "APP_NAME=tutien-game-api" \
  --env "API_PREFIX=/api/v1" \
  --env "CORS_ORIGIN=*" \
  --env "DATABASE_URL=<your-neon-connection-string>" \
  --env "JWT_SECRET=<long-random-secret>" \
  --env "JWT_EXPIRES_IN=7d" \
  --env "BCRYPT_SALT_ROUNDS=10" \
  --env "JSON_BODY_LIMIT=1mb"
```

The public API URL is available in the Koyeb service page after deployment and ends with `.koyeb.app`.

## Smoke Test

```bash
curl https://<your-koyeb-domain>/health
```

```bash
curl -X POST https://<your-koyeb-domain>/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"player@example.com","password":"password123"}'
```
