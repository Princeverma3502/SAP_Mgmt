# Resolve — Enterprise IT Service Desk

A React-based service operations dashboard for enterprise IT support, focused on SAP, workplace hardware, network access, and software requests.

## Current milestone

The client connects to the API when it is available and clearly labels its sample-data mode otherwise. PostgreSQL-backed ticket routes and AI agent endpoints are implemented. Database persistence and real model responses require your own PostgreSQL connection and OpenAI API key.

## Configure the API

```powershell
Copy-Item server/.env.example server/.env
```

On macOS/Linux, use `cp server/.env.example server/.env`.

Set `DATABASE_URL` and `OPENAI_API_KEY` in `server/.env`. The OpenAI key is used only by the server. Ticket descriptions and engineer notes sent to AI endpoints are transmitted to OpenAI; use approved, non-sensitive demo data unless your organization has reviewed its data-handling requirements.

Initialize the database and load the five sample tickets:

```bash
npm run db:push --prefix server
npm run db:seed --prefix server
```

## Run locally

In one terminal, start the API:

```bash
npm run dev:api
```

In another terminal, start the client:

```bash
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:4000`.

## Verify

```bash
npm run build
npm test
```

## Stack

- React + Vite
- Tailwind CSS
- Lucide icons
- Express + Prisma + PostgreSQL
- OpenAI `gpt-4o-mini` triage, resolution co-pilot, and UAT summary routes

## Git workflow

The app is its own Git repository. Each milestone is committed and pushed independently so the surrounding workspace's unrelated projects remain untouched.

## Prototype boundaries

Authentication, role-based authorization, a persisted asset inventory, real email delivery, and production deployment configuration are not included in this interview MVP. The Assets page and knowledge articles use clearly labeled local demonstration data. The demo user is not an authentication mechanism; do not expose the API publicly or use real employee data until access control and organizational privacy requirements are addressed. Dashboard chart values are illustrative sample metrics.
