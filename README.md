# Lounge Booking

A full-stack study project that simulates airport lounge reservations. The planned flow lets customers browse lounges, filter by airport, and book visits subject to date and capacity rules.

Currently, the project includes the application setup, a health endpoint, PostgreSQL models, and three seeded lounges. Booking endpoints and screens will be added in later steps.

Built with Node.js, TypeScript, Express, Prisma, PostgreSQL, React, Vite, and TanStack Query. This is an independent study exercise with no official affiliation with Collinson.

## Run locally

Requirements: Node.js 22.12+ (22.x), npm, and Docker with Docker Compose.

From the project root, start PostgreSQL:

```bash
docker compose up -d
docker compose ps
```

Wait until PostgreSQL is `healthy`. On Linux, use `sudo` for Docker commands if your user requires it. The database is exposed at `localhost:15432`.

Set up and start the backend:

```bash
cd backend
npm ci
cp .env.example .env
npm run db:migrate
npm run db:generate
npm run db:seed
npm run dev
```

The API runs at http://localhost:3000. Visit http://localhost:3000/health to check its status.

In a separate terminal, start the frontend from the project root:

```bash
cd frontend
npm ci
npm run dev
```

Open http://localhost:5173. The page should display the API status as `ok`.

To verify compilation, run `npm run build` separately in `backend` and `frontend`.

## Booking concurrency

Booking creation reads lounge capacity, calculates daily occupancy, and
inserts the reservation in a single Serializable transaction.

Prisma P2034 conflicts retry the entire transaction up to three total
attempts, with a short delay between attempts. Each retry recalculates
occupancy. Exceeding capacity returns CAPACITY_EXCEEDED; exhausted
transaction retries return BOOKING_CONFLICT.

This protects booking creation through this application flow. It does
not provide request idempotency: repeating a successful POST creates
another reservation if capacity remains available.

## API errors

Errors use a consistent response format:

    {
      "error": {
        "code": "LOUNGE_NOT_FOUND",
        "message": "Lounge not found"
      }
    }

The API returns 400 for invalid input, 404 for missing resources or
routes, 409 for booking conflicts, 413 for oversized request bodies,
and 422 for past booking dates.

Unexpected failures return 500 with a generic message. Technical
details are logged on the server.

## Backend tests

From the backend directory:

```bash
npm test
```

The command builds the backend before running Jest. Tests use the compiled
JavaScript with ESM support; Node may print an experimental VM Modules warning.

Service tests cover booking rules, Serializable transactions, Prisma and
PostgreSQL adapter conflicts, retries, and retry exhaustion. HTTP integration
tests use Supertest with mocked services to verify routes, validation,
serialization, and error handling.

These tests do not require a running API or PostgreSQL and do not write to the
database. Real database concurrency is checked separately with
`backend/scripts/check-booking-concurrency.mjs`, which creates a booking and
requires an unused date for each run.
