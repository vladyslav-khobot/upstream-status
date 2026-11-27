# Upstream

One dashboard for the status pages of the services you depend on: GitHub, npm, Cloudflare,
Vercel, OpenAI and others. Instead of opening a dozen status pages during an incident, you see
which providers are degraded, what is broken and what they last said about it.

- **Dashboard** with every tracked service, sorted so problems are always on top.
- **Filter and search** stored in the URL, so a filtered view can be shared.
- **Service page** with components, active incidents, scheduled maintenance and incident history.
- **Auto-refresh** every minute, with a manual refresh button.

All data comes from each provider's public [Statuspage](https://www.atlassian.com/software/statuspage)
JSON API. No API keys or accounts are needed.

## Tech stack

| Part     | Tools                                                                                    |
| -------- | ---------------------------------------------------------------------------------------- |
| Web      | React 19, TypeScript, TanStack Query, TanStack Router (file-based), Tailwind CSS 4, Vite |
| API      | Node.js, Express 5, TypeScript (run directly by Node, no build step), Zod                |
| Quality  | ESLint (typescript-eslint strict, React Hooks, TanStack Query plugin), Prettier          |
| Tests    | Vitest (web), `node:test` (API)                                                          |
| Delivery | Docker, docker-compose, GitHub Actions, Terraform (AWS ECS, reference only)              |

## How it works

```
Browser ──/api──▶ Express API ──HTTPS──▶ githubstatus.com, status.npmjs.org, ...
  │                  │
  │                  └─ caches each status page for 60 s, 5 s timeout per request
  └─ TanStack Query: caches responses, polls every 60 s, cancels requests on navigation
```

Why there is a backend at all: browsers cannot call most status pages directly (CORS), every
provider's payload is slightly different, and one shared cache means the providers get one request
per minute instead of one per open browser tab.

The API normalizes all providers into one small contract (`apps/api/src/contract.ts`). The web app
validates every response against its own copy of that contract (`apps/web/src/api/schemas.ts`), so a
mismatch shows up as a clear error instead of `undefined` deep in a component.

## Getting started

### Requirements

- **Node.js 22.18 or newer** (the API relies on Node running TypeScript files directly).
  With [nvm](https://github.com/nvm-sh/nvm): `nvm use` picks the version from `.nvmrc`.
- npm 10 or newer (comes with Node).
- Optional: Docker, to run the production build.

### Run in development

```bash
npm install
npm run dev
```

This starts both apps:

- Web: http://localhost:5173 (open this one)
- API: http://localhost:3001 (Vite forwards `/api` requests here)

Both reload on file changes. In development you also get the TanStack Query devtools (bottom left)
and TanStack Router devtools (bottom right).

To run only one app: `npm run dev -w @upstream/api` or `npm run dev -w @upstream/web`.

### Run the production build with Docker

```bash
docker compose up --build
```

Open http://localhost:8080. nginx serves the built web app and forwards `/api` to the API
container. Stop it with `docker compose down`.

### Configuration

Nothing needs configuring to run locally. To change defaults, copy the example file and edit it:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable              | Default                 | Description                                   |
| --------------------- | ----------------------- | --------------------------------------------- |
| `PORT`                | `3001`                  | Port the API listens on                       |
| `CORS_ORIGIN`         | `http://localhost:5173` | Origin allowed to call the API from a browser |
| `CACHE_TTL_MS`        | `60000`                 | How long a status page response is reused     |
| `UPSTREAM_TIMEOUT_MS` | `5000`                  | Timeout for one request to a status page      |

The web app reads `VITE_API_URL` (empty by default, meaning same-origin `/api`) and the dev server
reads `API_PROXY_TARGET` (default `http://localhost:3001`). See `apps/web/.env.example`.

## Scripts

Run from the repository root:

| Command             | What it does                                      |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start API and web in watch mode                   |
| `npm run build`     | Production build of the web app                   |
| `npm run lint`      | ESLint for the whole repo (`lint:fix` to autofix) |
| `npm run format`    | Format with Prettier (`format:check` only checks) |
| `npm run typecheck` | TypeScript checks for both apps                   |
| `npm test`          | Unit tests for both apps                          |
| `npm run check`     | Everything CI runs: lint, format, types and tests |

## Code conventions

Enforced by ESLint and Prettier (`npm run lint`, `npm run format:check`):

- Semicolons, single quotes, 100-character lines.
- Arrow functions instead of `function` declarations.
- Destructuring instead of property access: `({ id, name }) => ...`, `const { data } = ...`.
- No classes: factories and plain objects (errors are `Error` objects with extra fields plus an
  `isXxxError` guard).
- Types live in `types.ts` next to the code that uses them (the API contract is in `contract.ts`).
- Type imports are separate statements: `import type { A } from '...'`.
- Imports are sorted: libraries first, then local modules, with an empty line between the groups.

## API

| Endpoint                                 | Returns                                                |
| ---------------------------------------- | ------------------------------------------------------ |
| `GET /api/health`                        | `{ "ok": true }`, used by Docker and the load balancer |
| `GET /api/services`                      | Summary of every tracked service                       |
| `GET /api/services/:serviceId`           | Components, active incidents, scheduled maintenance    |
| `GET /api/services/:serviceId/incidents` | Last 25 incidents                                      |

If a status page is down, `/api/services` still answers: that service gets `status: "unknown"` and an
`error` message. Unknown service ids return 404, upstream failures on a single service return 502.

Try it: `curl http://localhost:3001/api/services/github`.

To track another service, add it to `apps/api/src/catalog.ts`. Any page that serves
`/api/v2/summary.json` works.

## Project structure

```
apps/
  api/                       Express API
    src/
      server.ts              Entry point: config, listen, graceful shutdown
      app.ts                 Express app: routes, CORS, error handling
      config.ts              Environment variables, validated with Zod
      contract.ts            Response types of the API
      catalog.ts             Tracked status pages
      routes/services.ts     /api/services endpoints
      statuspage/            Upstream client, payload schemas, normalization
      lib/                   TTL cache, HTML-to-text, HTTP error
    test/                    node:test unit tests
  web/                       React app
    src/
      main.tsx               QueryClient, router, providers
      routes/                File-based routes (TanStack Router)
      api/                   Fetch client, response schemas, query options
      components/            UI components
      lib/                   Status helpers, date formatting
infra/terraform/             Reference AWS deployment (not applied)
```

## Infrastructure

`infra/terraform` describes how the API would run on AWS ECS Fargate behind a load balancer. It is not
deployed and not needed for local work. See [infra/terraform/README.md](infra/terraform/README.md).
