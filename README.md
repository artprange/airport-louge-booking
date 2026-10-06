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
