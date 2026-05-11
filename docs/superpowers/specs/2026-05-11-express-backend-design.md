# Express Backend Design

## Goal

Create a Node.js Express backend inside the `server/` folder of the `react-tutien` monorepo root. The backend must run locally, return JSON responses, expose a health check endpoint, support CORS for mobile clients, and keep deployment configuration in environment variables.

## Architecture

The project uses a lightweight Express structure:

- `routes/` defines HTTP paths.
- `controllers/` adapts requests and responses.
- `services/` contains application logic and response payload creation.
- `config/` reads environment variables and centralizes defaults.
- `middlewares/` contains shared error handling.

The Express app is exported from `src/app.js` for tests and imported by `src/server.js` for local or deployed runtime.

## Endpoints

- `GET /health`: returns server health and runtime metadata.
- `GET /api/v1/status`: returns API status metadata through the route-controller-service flow.

All responses use JSON.

## Configuration

Configuration comes from environment variables loaded through `dotenv`:

- `PORT`
- `NODE_ENV`
- `APP_NAME`
- `API_PREFIX`
- `CORS_ORIGIN`

A `.env.example` file documents local values. The committed code does not require a checked-in `.env` file.

## Error Handling

Unknown routes return a JSON 404 response. Unexpected errors pass through a JSON error middleware. Production responses hide implementation details while development/test can expose error details.

## Testing

Tests use `jest` and `supertest`. Tests cover:

- health endpoint JSON response
- API status endpoint JSON response
- unknown route JSON 404 response

The tests import `src/app.js` so they do not bind a network port.
