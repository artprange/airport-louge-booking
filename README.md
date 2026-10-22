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
The seed creates or updates 23 demo lounges without duplicating them. The original
Brazilian locations keep their IDs and values:

| Airport | Lounge | Daily capacity | Price (BRL) |
| --- | --- | ---: | ---: |
| GRU | Guarulhos Lounge | 30 | 150.00 |
| GIG | Galeão Lounge | 20 | 120.00 |
| BSB | Brasília Lounge | 15 | 100.00 |

Twenty additional locations cover the [ACI World top 20 airports by total
passenger traffic in 2025](https://aci.aero/resources/busiest-airports-in-the-world/):
ATL, DXB, HND, DFW, PVG, ORD, LHR, IST, CAN, DEN, DEL, ICN, LAX, CDG, PEK, SIN,
AMS, MAD, SZX, and KUL. Dubai uses **DXB**; Heathrow uses **LHR**.

All lounge names, prices in BRL, and capacities are fictional study data, not
information supplied by those airports or lounge operators. Definitions live in
`backend/prisma/lounge-seed-data.ts`. Rerunning the seed preserves bookings and
uses fixed lounge IDs to prevent duplicates; it updates the seeded lounge values.
No schema migration is needed to add these locations.

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
| GET | `/airports?q=London` | Search worldwide airports by name, city, country or code; return up to ten results with IATA codes |
| GET | `/openapi.json` | OpenAPI 3.0.3 specification |
| GET | `/docs/` | Interactive Swagger UI |

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
| 503 | `AIRPORT_SEARCH_UNAVAILABLE`, `AIRPORT_SEARCH_RATE_LIMITED`, `AIRPORT_SEARCH_BUSY` |

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
- Lounge rows show total daily capacity, not date-specific remaining availability.
- Vite's API proxy is for development. A production deployment needs an API
  routing strategy and environment-specific configuration.
- CI and container definitions are included. Observability currently consists of
  structured request/error logs and correlation IDs.
- Dependency audit: compatible updates removed the reported high-severity issues.
  The backend still reports moderate advisories in Jest's transitive development
  dependencies. `npm --prefix backend audit` shows the current report. A forced
  fix would change Jest's major version and was not applied. The backend audit
  with `--omit=dev` and the frontend audit reported no vulnerabilities at this check.

## Worldwide airport search — B13.2

The airport filter accepts a name, city, country, or IATA code. Type at least two
characters for suggestions. Use Up/Down and Enter, or click a suggestion, to select
an airport and immediately filter lounges by its IATA code. Escape or Tab dismisses
the suggestions. **Clear** restores all lounges. Direct three-letter IATA input
still works with **Filter** or Enter, even when the provider is unavailable.

Airports come from [FreeAirportDB](https://freeairportdb.com/api), licensed under
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The filter includes source
and license attribution. Our API maps the provider fields to `iata`, `name`, `city`,
and `country`; airports without a valid IATA code are excluded. Choosing an airport
with no locally registered lounges correctly shows an empty lounge list.
The empty state explains this distinction and offers **Show all lounges**, which
clears both the applied filter and the airport search field.

No API key or database migration is required. Browser requests go through
`GET /airports?q=...` on our backend, which queries the provider over HTTPS with a
five-second timeout. Queries must contain 2–80 characters and no control characters.
The frontend debounces typing by 300 ms and caches queries for ten minutes.

The backend normalizes queries, caches successful responses (including empty
results) for ten minutes, limits the cache to 200 entries, and shares concurrent
identical lookups. At most eight distinct lookups run concurrently per server
process. Failures are not cached or automatically retried. Provider failures,
throttling, or local saturation return standardized 503 errors; the UI explains
that direct IATA filtering is still available.

The provider currently documents a free allowance of 1,000 requests/hour per IP
and a burst limit of ten requests/second. Cache and in-flight limits are per process;
they do not enforce a shared hourly budget across replicas. Availability and quota
remain dependent on the external provider. Search returns a bounded suggestion
list, rather than downloading all airports to the browser.

Delivery extras are described in B14 below. Booking listing is still pending.

## Delivery extras — B14

### CI

`.github/workflows/ci.yml` runs on pull requests to `develop`/`main` and pushes to
those branches. The quality job installs locked dependencies, runs lint, builds,
validates OpenAPI, runs Jest/Supertest, migrates and seeds a disposable PostgreSQL
service, then executes the real database concurrency check. A second job builds
and starts the container stack, seeds its database, and smoke-tests the frontend,
API proxy, Swagger assets, and international demo lounges. CI cleans up its own
containers and disposable volume after the run. It does not deploy the app.

### Local container stack

The existing `docker-compose.yml` still starts only the development database on
port `15432`. `compose.app.yml` is a separate project named `lounge-booking-stack`,
with its own database volume. It does not mount or replace the development volume.
Only the web port is published; the container API and database stay on its internal
network. Credentials in this local stack are demonstration values.

From the project root, with Docker available to your user:

```bash
npm run stack:up
npm run stack:seed
npm run stack:smoke
```

On this Ubuntu setup, if Docker requires sudo, use:

```bash
sudo docker compose -f compose.app.yml up --build -d --wait --wait-timeout 180
sudo docker compose -f compose.app.yml run --rm seed
npm run stack:smoke
```

Open [the container app](http://localhost:8080) and
[Swagger UI through the API proxy](http://localhost:8080/api/docs/).
`stack:up` waits for PostgreSQL, applies committed migrations with `migrate deploy`,
and starts the backend and Nginx frontend. Seeding is explicit and idempotent.
The migration/seed image contains development tooling; the API runtime installs
production dependencies and runs as the Node user.

Use `WEB_PORT` to select another web port; pass `STACK_URL` to the smoke test when
using a different address. `npm run stack:stop` stops this stack while retaining
its database. With sudo, use `sudo docker compose -f compose.app.yml stop`.

The Nginx frontend serves the compiled SPA and forwards `/api/*` to Express.
The production path therefore does not rely on Vite's development proxy.
Container health checks are liveness checks; `/health` does not verify an ongoing
database connection after startup.

### API documentation and logs

For native development, Swagger UI is at `http://localhost:3000/docs/` and its
specification at `http://localhost:3000/openapi.json`. Both are self-hosted.
The specification selects `/api` when served through the container reverse proxy.
`npm --prefix backend run docs:validate` validates the compiled contract; `npm test`
runs this automatically after the backend build.

The API emits Pino JSON logs. `LOG_LEVEL` defaults to `info` (`silent` under tests)
and can be configured in the backend environment. Each response includes
`X-Request-ID`. Valid incoming IDs (1–64 letters, digits, dots, underscores, or
hyphens) are preserved; other values are replaced with generated UUIDs. Request
logs include the ID, method, original path, status, and duration, without query
strings, bodies, cookies, or authorization headers. Unexpected errors are logged
with the same request ID and retain a generic public error response. SIGTERM and
SIGINT stop new connections and release Prisma connections, with a ten-second
shutdown deadline.

### Real database concurrency test

After migrating a running local PostgreSQL database:

```bash
npm --prefix backend run test:db
```

This test starts its own API on an ephemeral port, creates a temporary lounge,
sends six simultaneous booking requests, and asserts one success, five capacity
rejections, and persisted occupancy of 10/15. It also checks that another date can
fill 15/15. Its `finally` block deletes only its own lounge and bookings, then
closes the API and Prisma connections. Existing demo records are preserved.
The default Jest tests remain database-independent.
