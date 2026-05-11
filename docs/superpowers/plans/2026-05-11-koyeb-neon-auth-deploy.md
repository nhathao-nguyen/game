# Koyeb Neon Auth Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Postgres-backed auth and Koyeb-ready production startup to the existing Express backend.

**Architecture:** `createApp(dependencies)` wires routes/controllers/services with injectable dependencies for tests. Production dependencies use Neon Postgres through `pg`, while tests use an in-memory fake repository. `server.js` validates production env, initializes the database, starts on `process.env.PORT`, and shuts down cleanly.

**Tech Stack:** Node.js, Express, pg, bcryptjs, jsonwebtoken, Jest, Supertest.

---

## File Structure

- Modify: `server/package.json`
- Modify: `server/.env.example`
- Modify: `server/README.md`
- Modify: `server/src/app.js`
- Modify: `server/src/server.js`
- Modify: `server/src/config/env.js`
- Modify: `server/src/routes/index.js`
- Create: `server/src/createApp.js`
- Create: `server/src/dependencies.js`
- Create: `server/src/data/database.js`
- Create: `server/src/data/initDatabase.js`
- Create: `server/src/repositories/userRepository.js`
- Create: `server/src/routes/authRoutes.js`
- Create: `server/src/controllers/authController.js`
- Create: `server/src/services/authService.js`
- Create: `server/src/services/passwordService.js`
- Create: `server/src/services/tokenService.js`
- Create: `server/src/utils/asyncHandler.js`
- Create: `server/src/utils/httpError.js`
- Create: `server/tests/auth.test.js`
- Create: `server/tests/env.test.js`
- Create: `server/koyeb.md`
- Create: `.gitignore`

## Tasks

### Task 1: RED Auth Endpoint Tests

- [ ] Write tests for register success, duplicate register, login success, invalid login, and validation errors using `createApp({ userRepository })`.
- [ ] Run `npm test -- auth.test.js` and confirm failure because `createApp` and auth modules are not implemented.

### Task 2: RED Production Env Tests

- [ ] Write tests that production config rejects missing `PORT`, `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`.
- [ ] Run `npm test -- env.test.js` and confirm failure because config validation is not implemented.

### Task 3: Dependencies

- [ ] Install `pg`, `bcryptjs`, and `jsonwebtoken`.
- [ ] Keep production dependencies minimal and avoid ORM/migration frameworks.

### Task 4: Auth Implementation

- [ ] Add HTTP error and async wrapper utilities.
- [ ] Add password and token services.
- [ ] Add auth service validation, register, and login logic.
- [ ] Add auth controller and routes.
- [ ] Refactor app creation to support dependency injection.
- [ ] Run tests and make auth tests pass.

### Task 5: Neon Data Layer

- [ ] Add Postgres pool using `DATABASE_URL`.
- [ ] Add idempotent `users` table initialization.
- [ ] Add user repository for `findByEmail` and `create`.
- [ ] Wire production dependencies to repository.

### Task 6: Koyeb Production Startup

- [ ] Add `start:prod` script.
- [ ] Validate production env before listening.
- [ ] Initialize database before listening.
- [ ] Add graceful shutdown.
- [ ] Add Koyeb deployment docs.

### Task 7: Verification And Deployment Prep

- [ ] Run `npm test`.
- [ ] Run local smoke test against `/health`.
- [ ] Initialize git repository if missing.
- [ ] Add root `.gitignore`.
- [ ] Commit and push to GitHub if credentials are available.
- [ ] Deploy on Koyeb after receiving Neon `DATABASE_URL` and Koyeb access.
