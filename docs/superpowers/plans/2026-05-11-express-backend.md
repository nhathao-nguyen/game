# Express Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deploy-ready Express backend in `server/` with health/status endpoints, JSON responses, CORS, environment-based config, and tests.

**Architecture:** `src/app.js` creates the Express app and wires middleware/routes/errors. `src/server.js` only starts the listener. Route files call controllers, controllers call services, and services build runtime/config-driven JSON payloads.

**Tech Stack:** Node.js, Express, CORS, dotenv, Jest, Supertest, Nodemon.

---

## File Structure

- Create: `server/package.json` for scripts and dependencies.
- Create: `server/.env.example` for runtime configuration.
- Create: `server/.gitignore` for Node artifacts and local env files.
- Create: `server/src/config/env.js` for environment parsing.
- Create: `server/src/app.js` for Express setup.
- Create: `server/src/server.js` for local/deploy entrypoint.
- Create: `server/src/routes/index.js` for route aggregation.
- Create: `server/src/routes/healthRoutes.js` for health/status routes.
- Create: `server/src/controllers/healthController.js` for HTTP handlers.
- Create: `server/src/services/healthService.js` for payload creation.
- Create: `server/src/middlewares/notFound.js` for JSON 404.
- Create: `server/src/middlewares/errorHandler.js` for JSON errors.
- Create: `server/tests/health.test.js` for endpoint behavior.

## Tasks

### Task 1: Project Package And Tests

**Files:**
- Create: `server/package.json`
- Create: `server/tests/health.test.js`

- [ ] **Step 1: Create package scripts and dependency declarations**

Use `npm test`, `npm start`, and `npm run dev` scripts. Use CommonJS modules for a minimal Express backend.

- [ ] **Step 2: Write failing endpoint tests**

Create tests for `GET /health`, `GET /api/v1/status`, and an unknown route. Tests should import `../src/app`, which does not exist yet, so the first test run must fail.

- [ ] **Step 3: Run tests to verify RED**

Run: `npm test`

Expected: fail because `../src/app` cannot be found.

### Task 2: Config And Express App

**Files:**
- Create: `server/.env.example`
- Create: `server/.gitignore`
- Create: `server/src/config/env.js`
- Create: `server/src/app.js`
- Create: `server/src/server.js`

- [ ] **Step 1: Implement environment config**

Parse `PORT`, `NODE_ENV`, `APP_NAME`, `API_PREFIX`, and `CORS_ORIGIN`, with deploy-safe defaults.

- [ ] **Step 2: Implement Express app setup**

Load dotenv, enable CORS, enable `express.json()`, mount routes, and attach JSON error middlewares.

- [ ] **Step 3: Implement server entrypoint**

Import app/config and listen on `PORT`.

### Task 3: Routes, Controllers, Services, Errors

**Files:**
- Create: `server/src/routes/index.js`
- Create: `server/src/routes/healthRoutes.js`
- Create: `server/src/controllers/healthController.js`
- Create: `server/src/services/healthService.js`
- Create: `server/src/middlewares/notFound.js`
- Create: `server/src/middlewares/errorHandler.js`

- [ ] **Step 1: Implement health and status services**

Return runtime/config-derived JSON payloads.

- [ ] **Step 2: Implement controllers**

Return service payloads using `res.status(200).json(...)`.

- [ ] **Step 3: Implement routes**

Mount `GET /health` at root and `GET /status` under `API_PREFIX`.

- [ ] **Step 4: Implement JSON 404 and error middlewares**

Return structured JSON responses for missing routes and unexpected errors.

### Task 4: Verification

**Files:**
- Use all files above.

- [ ] **Step 1: Install dependencies**

Run: `npm install`

- [ ] **Step 2: Run tests**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Smoke-check local server**

Run the server and request `GET /health`.

Expected: JSON response with `success: true`, `data.status: "ok"`, and runtime metadata.
