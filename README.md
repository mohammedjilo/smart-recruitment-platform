# Smart Recruitment Platform (SRB)

SRB is a recruitment platform with separate experiences for candidates,
companies, and administrators. The repository is an npm workspace containing a
React frontend, an Express/TypeScript backend, and shared packages.

## Project layout

- `front/` — React, TypeScript, and Vite application.
- `back/` — Express and TypeScript API with Prisma persistence.
- `packages/validation/` — shared, serializable Zod request schemas.

## Getting started

Install dependencies from the repository root:

```sh
npm install
```

Create `front/.env` from `front/.env.example` and set `VITE_API_BASE_URL` when
the API is not available at `http://localhost:3000`. `VITE_*` variables are
included in the browser bundle and must not contain secrets. Configure the
backend's required environment variables locally; never commit credentials.

Run the frontend and backend in separate terminals:

```sh
npm run dev --workspace front
npm run dev --workspace back
```

## Validation and checks

Frontend forms use React Hook Form and Zod where appropriate. Shared request
schemas validate serializable data at the API boundary; business rules and
authorization remain server-side, and Prisma owns persistence constraints.
Validation errors use the API error contract and can be mapped back to form
fields.

The request path is:

`User input -> frontend validation -> API -> backend validation -> business rules and authorization -> Prisma`

Useful root-level commands:

```sh
npm run build
npm run lint
npm run typecheck:front
npm run typecheck:back
npm test --workspace front
npm test --workspace back
```

The validation package's inventory and unresolved decisions are documented in
[`docs/validation-inventory.md`](./docs/validation-inventory.md) and
[`docs/validation-reconciliation-matrix.md`](./docs/validation-reconciliation-matrix.md).
