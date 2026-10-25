# Smart Recruitment Platform

A recruitment platform with separate workflows for candidates, companies, and
administrators. This repository is an npm workspace containing a React
frontend, an Express API, and shared validation and ESLint packages.

## Repository structure

- `front/` — React, TypeScript, and Vite application.
- `back/` — Express and TypeScript API, Prisma schema and migrations, and
  backend tests.
- `packages/validation/` — shared Zod schemas used by the frontend and backend.
- `packages/eslint-config/` — shared ESLint configuration.
- `package.json` — root workspace and orchestration scripts.

## Technology

- **Frontend:** React, TypeScript, Vite, Redux Toolkit and RTK Query, React
  Router, React Hook Form, Zod, and Material UI.
- **Backend:** Node.js, TypeScript, Express, Prisma, PostgreSQL, and JWT-based
  authentication.
- **Shared packages:** Zod request validation and ESLint configuration.

## Getting started

Install dependencies from the repository root:

```sh
npm install
```

The frontend template is `front/.env.example`. Set `VITE_API_BASE_URL` when the
API is not available at `http://localhost:3000`.

Configure backend environment variables for the local environment. The
database must be available and `DATABASE_URL` must point to it before running
the backend.

Run the frontend and backend in separate terminals from the repository root:

```sh
npm run dev --workspace front
npm run dev --workspace back
```

## Environment variables and secrets

The frontend uses `VITE_API_BASE_URL`. **Every `VITE_*` value is exposed in the
browser bundle. Never put credentials, tokens, or other secrets in a `VITE_*`
variable.**

The backend reads `DATABASE_URL`; Prisma configuration uses `DIRECT_URL` when
set and otherwise falls back to `DATABASE_URL`. Production authentication
requires `JWT_SECRET` and `JWT_REFRESH_SECRET`. Other backend configuration
read by the application includes:

- `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`, and
  `JWT_REFRESH_EXPIRES_MS` for token and cookie expiration.
- `FRONTEND_URL`, `PORT`, and `NODE_ENV`.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
  `CLOUDINARY_API_SECRET` for Cloudinary integration.
- `GEMINI_API_KEY` and `AI_TIMEOUT_MS` for AI integration.

The GeoNames dataset update script can optionally read
`GEONAMES_CITIES500_ARCHIVE`.

Do not commit real `.env` files or credentials. Supply secrets through a
protected local environment or deployment secrets manager. Development JWT
fallback behavior is not suitable for production.

## Validation and API behavior

Frontend forms use React Hook Form and Zod where appropriate. Shared request
schemas validate serializable input at API boundaries. Authorization and
business rules remain enforced by the backend, with Prisma handling database
constraints.

The typical request path is:

`User input -> frontend validation -> API -> backend validation -> authorization and business rules -> Prisma`

Successful API responses are normalized to a `success: true` envelope. Errors
handled by the backend global error middleware use a structured
`success: false` envelope with an error code and message. See
[`back/ERROR-CONTRACT.md`](back/ERROR-CONTRACT.md) for the response shape and
normalization behavior.

## Build, tests, and quality checks

Run the root commands from the repository root:

```sh
npm run build
npm run lint
npm run typecheck:front
npm run typecheck:back
npm run test:validation
npm test --workspace front
npm test --workspace back
```

The root build builds the shared validation package and frontend, then runs
Prisma Client generation and compiles the backend. It does not run database
migrations.

The frontend also defines separate Node-based checks:

```sh
npm run test:api-errors --workspace front
npm run test:api-reliability --workspace front
npm run test:mutation-state --workspace front
npm run test:query-state --workspace front
npm run test:presentation-policy --workspace front
npm run test:error-boundary --workspace front
```

## Database and deployment

The Prisma schema and versioned migrations are under `back/prisma/`. Review
migrations before applying them to a database.

Repository configuration alone does not establish that a production deployment
is active or healthy. No deployment health claim is made here.

## Historical verification

In a verification run reported on 2026-10-24, the root build and separate
frontend build succeeded. The shared validation suite passed 9 tests, the
backend suite passed 65 tests, and the frontend suite passed 99 tests across
24 test files. These are historical results, not a guarantee of current
production health or a substitute for verification after later changes.
