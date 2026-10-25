# Smart Recruitment Platform

## 1. Project Overview

Smart Recruitment Platform is a TypeScript-based web application for recruitment workflows. The checked-in source currently contains user, company, and admin areas, with API domains for jobs, applications, profiles, notifications, messaging, recommendations, and support.

This report describes the repository as inspected on 2026-10-24. It documents code and configuration present in the working tree; it does not claim that the application has been deployed or that every workflow has been manually exercised.

## 2. Technology Stack

- **Frontend:** React 19, TypeScript 6, Vite 8, Redux Toolkit / RTK Query, React Router, React Hook Form, Zod, and Material UI.
- **Backend:** Node.js, TypeScript, Express 5, Prisma 7, PostgreSQL, Zod, and JSON Web Tokens.
- **Shared tooling:** npm workspaces, TypeScript, ESLint, Vitest, and Node's test runner.
- **Additional integrations declared in the backend:** Cloudinary and Google's GenAI SDK. Their presence in the dependency manifest does not by itself establish production configuration or availability.

## 3. Repository Structure

```text
.
|-- front/                    React/Vite application, tests, and scripts
|-- back/                     Express API, Prisma schema/migrations, and tests
|-- packages/
|   |-- validation/           Shared Zod schemas and tests
|   `-- eslint-config/        Shared lint configuration package
|-- package.json              npm workspace and root build/test scripts
|-- package-lock.json         npm dependency lockfile
|-- .gitignore                Repository-level generated/local-file rules
`-- PROJECT_REPORT.md         This project report
```

The repository also contains local root-level directories named `1` and `2`; the root ignore file identifies them as duplicate snapshots, and no files under them are tracked by Git.

## 4. Frontend Architecture

The frontend is organized under `front/src` into `features`, `components`, `layouts`, `routes`, `redux`, `services`, `schema`, `theme`, `types`, `constants`, and `utils`. Redux Toolkit's RTK Query is configured in the shared API layer, with credentialed requests, a configurable API base URL, refresh/retry handling, and normalized API errors.

Vite is the development/build tool. Vitest is configured for characterization tests under `front/tests/characterization`, using a jsdom environment. Additional Node-based tests and a responsive audit script are available under `front/scripts`.

## 5. Backend Architecture

The backend is organized under `back/src` into routes, controllers, services, authorization, middleware, DTOs, validation, infrastructure, configuration, shared code, types, and utilities. `back/src/index.ts` composes middleware and mounts the API routers; service and controller code is separated from that composition layer.

The API includes route groups for authentication, users, companies, jobs, applications, professional profiles, education, experience, projects, certificates, skills, languages, admin operations, notifications, messages, recommendations, support, and locations.

## 6. Shared Validation Package

`packages/validation` is present and is a workspace dependency of both frontend and backend. It exports Zod schemas for authentication, jobs, applications, support, messaging, admin input, company profiles, and professional profiles. The package has independent TypeScript build and Node test scripts. It must remain in the repository because both applications depend on it.

## 7. Database Design and Prisma Migrations

The Prisma schema is at `back/prisma/schema.prisma`; its datasource is PostgreSQL. The schema defines recruitment entities including users, companies, jobs, applications, profiles, skills, notifications, messages/conversations, support tickets, and admin permissions/roles.

Versioned SQL migrations and the migration lock file are under `back/prisma/migrations`. Prisma configuration in `back/prisma.config.ts` resolves the database URL from `DIRECT_URL` or `DATABASE_URL`; backend runtime database access also uses PostgreSQL through Prisma's PostgreSQL adapter. The migrations and their supporting data are source/deployment assets and are not ignored.

## 8. Authentication and Authorization

The backend signs and verifies access, refresh, and scoped support-only JWTs. Authentication is wired through API middleware and route-level authorization; the schema and authorization code also define permission-oriented admin roles. The backend uses cookie parsing, and the frontend sends credentialed requests.

JWT secrets are required in production; token utilities contain a development fallback when secrets are absent. Production environments must supply the configured secrets rather than relying on that fallback.

## 9. API Structure and Error Handling

API routes are mounted beneath `/api` in the backend composition root. The `apiContract` middleware normalizes successful responses, and the global error middleware maps validation, upload, database, parser, and application errors to a structured response that can include an error code, field errors, and request ID. Unexpected failures are written through the structured logger, which redacts several common secret/token/connection-string patterns.

## 10. Testing and Quality Assurance

The repository defines:

- Shared validation tests: `npm run test:validation`.
- Frontend characterization tests: `npm test --workspace front`.
- Additional frontend Node tests in `front/scripts`.
- Backend tests: `npm test --workspace back`.
- Frontend linting: `npm run lint`.
- Frontend and backend type-check scripts at the root.

Checks run while preparing this report:

- Shared validation tests: **passed (9 tests)**.
- Backend test suite: **completed successfully (exit code 0)**.
- Frontend test suite and root build: results will be recorded after their current runs finish.

No deployment verification, live-database migration, or manual end-to-end browser test was performed for this report.

## 11. Build and Development Commands

From the repository root:

```bash
npm run build
npm run build:validation
npm run test:validation
npm run typecheck:front
npm run typecheck:back
npm run lint
```

Application-specific commands:

```bash
npm run dev --workspace front
npm run dev --workspace back
npm test --workspace front
npm test --workspace back
```

The frontend also provides `preview` and `audit:responsive` scripts. The backend build generates the Prisma client and compiles TypeScript; its start script runs `dist/index.js`.

## 12. Environment Variables and Secrets Management

The frontend's tracked `front/.env.example` documents `VITE_API_BASE_URL`. No backend `.env.example` was present during inspection. Backend code references `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES`, `JWT_REFRESH_EXPIRES`, `JWT_REFRESH_EXPIRES_MS`, `FRONTEND_URL`, `PORT`, `NODE_ENV`, Cloudinary credentials, `GEMINI_API_KEY`, and `AI_TIMEOUT_MS`.

Actual secret values are intentionally not included here. The local `back/.env` file is ignored by Git. Keep production credentials in the deployment environment or a secrets manager; do not commit real `.env` files.

## 13. Deployment Architecture and Railway Configuration

The backend package defines a production start command and listens on `PORT` (falling back to a local default). Vite's preview configuration allows a Railway-hosted frontend hostname. No Railway service configuration, Dockerfile, Compose file, or other deployment manifest was found in the repository during inspection. Therefore, the actual production topology, deployment settings, and deployment status could not be verified.

## 14. Security Considerations

- Keep database credentials, JWT secrets, and third-party API credentials outside version control.
- Configure strong production access and refresh secrets; the development fallback is not suitable for production.
- Restrict `FRONTEND_URL` to trusted origins in deployed environments; CORS credentials are enabled.
- Shared Zod schemas and backend error normalization provide input/error handling paths, but this report is not a security audit.
- The tracked-file scan found the safe frontend environment template and no tracked `.env` or similarly named private-key/credential file. `.gitignore` cannot remove secrets already committed in earlier history.

## 15. Current Project Status

The inspected working tree contains frontend, backend, shared validation, test, Prisma migration, and application configuration source. The validation test suite and backend test suite passed in the checks recorded above; remaining build/frontend test results are to be added once those commands finish.

At the start of this documentation task, the working tree already had extensive local changes (406 modified, 114 deleted, and 23 untracked paths reported by `git status --short`). Those changes were not staged, reverted, or otherwise cleaned up. `README.md` and `back/ERROR-CONTRACT.md` were marked deleted in that pre-existing status and have not been restored.

## 16. Known Issues and Outstanding Tasks

- Confirm whether the pre-existing deletions of `README.md` and `back/ERROR-CONTRACT.md` are intentional before preparing a release.
- Add a backend environment template if maintainers want a safe, explicit setup checklist; document variable names only, never values.
- Deployment configuration and live deployment status are not represented by a checked-in Railway manifest and remain unverified.
- Review the extensive pre-existing worktree changes and deletions separately; this report task did not audit or alter their application behavior.
- The Git ignore file covers generated outputs, but ignored files that were already tracked would remain tracked until explicitly handled. No bulk index removal was performed.

## 17. Recommended Next Steps

1. Review the full pre-existing `git status --short` output and confirm the intent of deleted files before staging anything.
2. Review the build and test results recorded in this report, then run any additional environment-dependent checks in a controlled environment.
3. Document required backend environment variable names in a safe template and update setup documentation when the deployment process is known.
4. Add or document the deployment configuration only after confirming the actual hosting topology and release workflow.
5. Review the final diff, then stage and commit only the intended files through the project's normal review process.
