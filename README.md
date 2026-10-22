# Resolve — Enterprise IT Service Desk

A React-based service operations dashboard for enterprise IT support, focused on SAP, workplace hardware, network access, and software requests.

## Current milestone

The client currently runs as an interactive demo with realistic sample tickets. Ticket creation, category suggestions, ticket search, status filters, and ticket detail are client-side only. The next milestone will connect the Express API, PostgreSQL/Prisma, and AI endpoints.

## Run the client

```bash
npm run dev
```

Build the client for production:

```bash
npm run build
```

## Stack

- React + Vite
- Tailwind CSS
- Lucide icons
- Express, Prisma, PostgreSQL, and OpenAI integration planned for the API milestone

## Git workflow

The app is its own Git repository. Each milestone is committed and pushed independently so the surrounding workspace's unrelated projects remain untouched.
