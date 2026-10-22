# Lounge Booking

A full-stack study project simulating airport lounge reservations. Customers can
browse lounges, filter by airport, and book visits with date and daily capacity
validation. The UI shows booking confirmations and domain errors in English.

Built with Node.js, TypeScript, Express, Prisma 7, PostgreSQL, React, Vite,
TanStack Query, and Tailwind CSS. This is an independent study exercise with no
official affiliation with Collinson.

## Requirements

- Node.js 22.23.2 (`nvm use` reads `.nvmrc`) and npm.
- Docker Engine with the Docker Compose plugin.
- Free ports: `3000` (API), `5173` (frontend), and `15432` (PostgreSQL).

## Run locally

From the project root:

```bash
nvm use
npm run setup
cp backend/.env.example backend/.env
npm run db:up
npm run db:status
```

Create `.env` only on the first setup; preserve an existing local configuration.
Wait until PostgreSQL is `healthy`. On Linux, if Docker reports permission denied,
run `sudo docker compose up -d` and `sudo docker compose ps` directly.
If the Docker daemon is stopped, start it with `sudo systemctl start docker`.

Prepare the database:

```bash
npm --prefix backend run db:migrate
npm --prefix backend run db:generate
npm --prefix backend run db:seed
```

Migrations create the schema. Client generation creates the typed Prisma API.
The seed creates or updates three lounges without duplicating them:

| Airport | Lounge | Daily capacity | Price (BRL) |
| --- | --- | ---: | ---: |
| GRU | Guarulhos Lounge | 30 | 150.00 |
| GIG | Galeão Lounge | 20 | 120.00 |
| BSB | Brasília Lounge | 15 | 100.00 |

In separate terminals, from the project root:

```bash
npm run dev:backend
```

```bash
npm run dev:frontend
```

Open [the frontend](http://localhost:5173). Use **Book lounge** to open a booking
form. The API runs at `http://localhost:3000`; `/health` returns `{"status":"ok"}`.
The Vite development proxy forwards `/api/*` requests to the backend.

Stop PostgreSQL with `npm run db:stop` (or `sudo docker compose stop`). The named
Docker volume preserves database data. API and frontend processes stop with
Ctrl+C in their respective terminals.

## Quality checks

Run from the project root:

```bash
npm run check
```

This runs lint for both projects, builds and tests the backend, and builds the
frontend. Individual commands are also available:

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint for both projects; warnings fail the check |
| `npm run typecheck` | Check types in both projects (generate Prisma Client first on a fresh checkout) |
| `npm test` | Build backend, then run Jest and Supertest |
| `npm run build` | Build backend and frontend |
| `npm --prefix backend run db:validate` | Validate Prisma schema |
| `npm --prefix backend run db:studio` | Inspect database records in Prisma Studio |

Backend tests use mocked persistence/services, require no running API or database,
and do not write data. They cover booking rules, transaction retries, HTTP
validation, serialization, and standardized errors. Jest may print an experimental
VM Modules warning because the project uses ESM. Automated frontend tests are not
yet configured; the frontend currently has lint, type checking, build checks,
and manual flow validation.

To manually check real PostgreSQL concurrency, start the database and API, choose
an unused future date in the script, then run:

```bash
node backend/scripts/check-booking-concurrency.mjs
```

For Brasília's seeded capacity of 15, two requests for 10 guests should yield one
`201` and one `409 CAPACITY_EXCEEDED`. This script writes a real booking. Repeating
it on the same date may correctly reject both requests because capacity is
already occupied. Keep the seeded capacity unchanged for this scenario.

## API

| Method | Endpoint | Behavior |
| --- | --- | --- |
| GET | `/health` | API liveness; does not check database connectivity |
| GET | `/lounges` | List lounges, ordered by name |
| GET | `/lounges?airportCode=GRU` | Filter by airport; trims and uppercases the filter |
| GET | `/lounges/:id` | Retrieve a lounge by UUID |
| POST | `/bookings` | Create a booking |

Examples:

```bash
curl -i 'http://localhost:3000/lounges?airportCode=GRU'
curl -i http://localhost:3000/lounges/11111111-1111-4111-8111-111111111111
curl -i http://localhost:3000/bookings -H 'Content-Type: application/json' -d '{"loungeId":"11111111-1111-4111-8111-111111111111","customerName":"Arthur","guests":2,"bookingDate":"2099-12-20"}'
```

The POST example creates a real reservation. Dates use `YYYY-MM-DD`; guest counts
must be positive integers. Prices are decimal strings in BRL; changing the UI
language does not change their currency. Successful booking creation returns `201`
with the booking ID, lounge ID, customer name, guests, booking date, and creation
timestamp.

Errors consistently use this shape:

```json
{
  "error": {
    "code": "LOUNGE_NOT_FOUND",
    "message": "Lounge not found"
  }
}
```

| Status | Codes |
| --- | --- |
| 400 | `VALIDATION_ERROR`, `INVALID_JSON` |
| 404 | `LOUNGE_NOT_FOUND`, `ROUTE_NOT_FOUND` |
| 409 | `CAPACITY_EXCEEDED`, `BOOKING_CONFLICT` |
| 413 | `PAYLOAD_TOO_LARGE` (JSON bodies over 100 KB) |
| 422 | `INVALID_BOOKING_DATE` |
| 500 | `INTERNAL_SERVER_ERROR` |

Unexpected errors are logged on the server; internal details are not sent to
clients. If Prisma reports `P1001`, check that PostgreSQL is healthy and that
`DATABASE_URL` uses port `15432`. A running `/health` endpoint alone does not prove
the database is available.

## Structure and decisions

- Controllers translate HTTP, services apply business rules, and repositories
  access persistence. Express app creation is separate from server startup.
- Zod validates HTTP input. Dates are stored as PostgreSQL `date`; "today" is
  calculated in UTC. A production system should define airport-specific time zones.
- PostgreSQL sums occupancy per lounge and booking date using a compound index.
- Booking creation reads capacity, sums occupancy, and inserts within one
  Serializable transaction. It retries the entire transaction up to three total
  attempts on Prisma `P2034` or adapter `TransactionWriteConflict` errors with
  PostgreSQL codes `40001`/`40P01`, with a short delay between attempts.
- Retry attempts recalculate occupancy. Insufficient capacity returns
  `CAPACITY_EXCEEDED`; exhausted retries return `BOOKING_CONFLICT`.
- TanStack Query owns remote data. Frontend components use `index.tsx`, Tailwind
  class maps in `styles.ts`, `type` definitions in `types.ts`, and exports at the
  end of files. Shared API types live in `frontend/src/types`.
- The root package only coordinates commands. Backend and frontend retain
  separate dependency manifests and lockfiles; the generated Prisma Client is
  excluded from Git and regenerated during backend builds.
- TypeScript 5.9 is used in both packages for compatibility with the configured
  TypeScript ESLint tooling.

## Remaining scope and limitations

- Booking listing (`GET /bookings` and a reservations screen) is still pending.
- There is no authentication, cancellation, payment flow, or request idempotency.
  Repeating a successful POST can create another booking when capacity allows.
- Concurrency protection applies to this booking creation flow; direct database
  writes or future capacity-changing operations must preserve the same invariant.
- Cards show total daily capacity, not date-specific remaining availability.
- Vite's API proxy is for development. A production deployment needs an API
  routing strategy and environment-specific configuration.
- CI, production container images, and observability enhancements remain optional
  follow-up work.
- Dependency audit: compatible updates removed the reported high-severity issues.
  The backend still reports moderate advisories in Jest's transitive development
  dependencies. `npm --prefix backend audit` shows the current report. A forced
  fix would change Jest's major version and was not applied. The backend audit
  with `--omit=dev` and the frontend audit reported no vulnerabilities at this check.
