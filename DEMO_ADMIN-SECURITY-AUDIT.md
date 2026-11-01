# DEMO_ADMIN Security Audit (Historical)

> **Historical report:** The detailed matrix below documents the earlier, `isDemo`-scoped DEMO_ADMIN design and is no longer an accurate description of the current implementation. That design has been replaced with global read-only administrative access for DEMO_ADMIN. Current source grants a fixed read-permission set in [`back/src/authorization/permissions.ts`](./back/src/authorization/permissions.ts) and [`back/src/authorization/permission.service.ts`](./back/src/authorization/permission.service.ts), permits only explicitly listed GET routes in [`back/src/middlewares/demoAdminAccess.ts`](./back/src/middlewares/demoAdminAccess.ts), removes the `isDemo` fields via a forward migration, and continues redacting CV references. The migration is not applied by this change. Review those files and the current worktree before relying on any older route matrix below. External Cloudinary CV delivery/access behavior remains unverified.

**Audit date:** 2026-10-29  
**Scope:** Direct source review of the current worktree implementation, followed by the narrowly scoped fixes and isolated verification recorded below. No database, migration, Railway, or fixture-marking operation was performed.
**Overall conclusion:** The inspected backend allowlist, role resolution, and demo-scoped Prisma queries support the intended read-only demo boundary. Follow-up source changes add an approved-target guard for fixture marking and centralized CV-reference redaction on DEMO_ADMIN JSON responses. Do not treat this implementation as production-ready until external CV URL access behavior is independently proven safe.

## Findings

### BLOCKER

None confirmed in the inspected API routes and database-query paths.

### HIGH

| # | Finding | Evidence | Confidence |
|---|---|---|---:|
| 1 | **UNVERIFIED external CV access control.** Demo API responses suppress CV references, but the code uploads CVs as Cloudinary `raw` assets without source-visible private/authenticated delivery settings, then stores the returned secure URL. Source review cannot establish whether a previously obtained production URL itself requires authorization. Do not expose CV links to DEMO_ADMIN until delivery control is independently verified or downloads are served through authenticated, record-scoped access. | [`back/src/utils/cloudinary.ts:57-62`](./back/src/utils/cloudinary.ts); response redaction: [`back/src/services/admin/adminApplication.service.ts:68-69`](./back/src/services/admin/adminApplication.service.ts), [`back/src/services/application.service.ts:614-619`](./back/src/services/application.service.ts), [`back/src/services/adminUserDetails.service.ts:109`](./back/src/services/adminUserDetails.service.ts) | 9/10 |

This is an external-resource verification gap, **not** evidence that an allowed API route returns a production CV URL.

### MEDIUM

The fixture marker’s target-database guard is **addressed and covered by isolated tests**. The script requires `DEMO_FIXTURE_MARKING_ENABLED=true` and `DEMO_FIXTURE_DATABASE_URL`, validates the exact approved Neon hostname and `neondb` name, connects its own Prisma client using that URL, and checks `current_database()` before opening the fixture transaction. See [`back/scripts/mark-demo-fixtures.ts`](./back/scripts/mark-demo-fixtures.ts) and [`back/src/services/demoFixtureMarker.ts`](./back/src/services/demoFixtureMarker.ts). No database connection or script execution was performed.

### LOW

- [`ADMIN-AUTHORIZATION-REVIEW.md:5-9`](./ADMIN-AUTHORIZATION-REVIEW.md) is now explicitly labeled as a historical baseline and points to this audit as the current review.
- `front/.env.example` was restored with its `HEAD` content, `VITE_API_BASE_URL=http://localhost:3000`; it contains no secret. The template is available again, and the API client also has development/test fallback behavior ([`front/src/services/api/baseApi.ts:17-23`](./front/src/services/api/baseApi.ts)).
- `back/fix-prisma-checksum.js` was deleted. The historical script loads a named migration, computes its SHA-256 checksum, and updates `_prisma_migrations.checksum` using `DATABASE_URL`. Its deletion removes that one-off checksum-repair utility, not ordinary Prisma migration functionality. It is not referenced by package scripts; removing a utility that directly edits migration metadata appears safety-positive, but intent cannot be proven.
- The frontend allows a static `/admin/about` page but does not allow `/admin/operations` as a DEMO_ADMIN browser path, while the backend allows the scoped operations-dashboard API. The workspace redirects DEMO_ADMIN to the general dashboard, so this is a navigation mismatch rather than a data-scope bypass. See [`front/src/features/admin/authorization/demoAdmin.ts:21-35`](./front/src/features/admin/authorization/demoAdmin.ts) and [`front/src/features/admin/components/AdminWorkspaceRedirect.tsx:32-37`](./front/src/features/admin/components/AdminWorkspaceRedirect.ts).

### PASS

- The boundary is mounted before all API routers at [`back/src/index.ts:57-76`](./back/src/index.ts). It verifies bearer access tokens, looks up an active ADMIN with an active DEMO_ADMIN assignment, marks the request as demo, and rejects non-allowlisted paths/methods with 404 ([`back/src/middlewares/demoAdminAccess.ts:43-79`](./back/src/middlewares/demoAdminAccess.ts), [`back/src/authorization/permission.service.ts:109-129`](./back/src/authorization/permission.service.ts)).
- The admin router independently applies `onlyAdminMiddleware` ([`back/src/routes/admin.ts:72`](./back/src/routes/admin.ts); [`back/src/middlewares/auth.ts:68-112`](./back/src/middlewares/auth.ts)).
- Role resolution combines active role permissions, but if any active role assignment is DEMO_ADMIN, filters the effective set to `DEMO_ADMIN_PERMISSION_CODES`. Mapped general read permissions are granted only via their demo permission counterpart ([`back/src/authorization/permission.service.ts:20-54`](./back/src/authorization/permission.service.ts), [`back/src/authorization/permission.service.ts:63-101`](./back/src/authorization/permission.service.ts), [`back/src/authorization/permissions.ts:62-84`](./back/src/authorization/permissions.ts)). Thus another active assignment, including an otherwise broader admin role, does not confer extra effective permissions while DEMO_ADMIN is present. If there is no active DEMO_ADMIN assignment, the existing union behavior remains.
- Unknown/new routes default to denial because the middleware uses a positive method-and-path allowlist, not a denylist ([`back/src/middlewares/demoAdminAccess.ts:7-40`](./back/src/middlewares/demoAdminAccess.ts)). Existing route-level permission checks remain in place.
- The shared query scopes require both a candidate marked demo with role `USER` and a job whose company is marked demo; company and job scopes are also explicit ([`back/src/services/admin/demoAdminScope.ts:3-19`](./back/src/services/admin/demoAdminScope.ts)). The inspected lists, totals, nested counts, and direct-ID lookups preserve those constraints.
- A response middleware installed after the DEMO_ADMIN boundary recursively removes CV/resume/file-storage reference fields and raw/PDF download URLs from all JSON responses for marked DEMO_ADMIN requests ([`back/src/middlewares/demoAdminResponse.ts`](./back/src/middlewares/demoAdminResponse.ts), [`back/src/index.ts`](./back/src/index.ts)). Ordinary users/admins are not redacted by that middleware. This is application-level response protection, not proof of external Cloudinary access controls.
- A production ID cannot bypass an allowlisted lookup: the ID is combined with the relevant demo scope in the Prisma `where`. Admin endpoints use IDs rather than a separate production-slug lookup. Search/filter predicates are combined with scoped `where` inputs; counts use those scoped inputs.
- No backend export or CV-download endpoint was found. Other application submission, profile, upload, update, and notification routes are not on the DEMO_ADMIN allowlist.

## Route inventory and security matrix

The central boundary is [`back/src/middlewares/demoAdminAccess.ts:7-40`](./back/src/middlewares/demoAdminAccess.ts). Every `/api/admin` endpoint also passes the admin middleware at [`back/src/routes/admin.ts:72`](./back/src/routes/admin.ts). "Allowed" below means allowed by that boundary; route-level permissions still apply. The conclusion traces service query scope rather than relying on permissions or tests alone.

### Allowed business-data routes

| Method and route | Route/controller/service evidence | Auth and permission | Query, nested resources, and direct-ID scope | Result |
|---|---|---|---|---|
| `GET /api/admin/dashboard` | [`admin.ts:74-78`](./back/src/routes/admin.ts); [`adminDashboardControllers.ts:15-20`](./back/src/controllers/admin/adminDashboardControllers.ts); [`adminDashboard.service.ts:14-120`](./back/src/services/admin/adminDashboard.service.ts) | Admin guard; `VIEW_ADMIN_DASHBOARD` maps to the demo dashboard permission. Allowed. | Demo branch scopes company/user/job/application counts and dashboard lists. Nested application counts filter demo candidates under demo-company jobs; support counts are zero and company requests are empty. | **PASS** |
| `GET /api/admin/operations/dashboard` | [`admin.ts:79-83`](./back/src/routes/admin.ts); [`adminDashboardControllers.ts:28-33`](./back/src/controllers/admin/adminDashboardControllers.ts); [`adminDashboard.service.ts:246-260`](./back/src/services/admin/adminDashboard.service.ts) | Admin guard; operations-dashboard permission maps to the demo dashboard permission. Allowed. | Counts use demo candidate, company, demo-company-job, and two-sided application scopes. | **PASS** |
| `GET /api/admin/me/permissions` | [`admin.ts:84`](./back/src/routes/admin.ts); [`adminAuthorizationControllers.ts:27-31`](./back/src/controllers/adminAuthorizationControllers.ts); [`adminAuthorization.service.ts:29-47`](./back/src/services/adminAuthorization.service.ts) | Admin guard; self-only. Allowed. | No business-record query. Returns filtered effective permissions and assigned role names for the current admin. | **PASS** |
| `GET /api/admin/companies` | [`admin.ts:145-149`](./back/src/routes/admin.ts); [`adminCompanyControllers.ts:79-97`](./back/src/controllers/admin/adminCompanyControllers.ts); [`adminCompany.service.ts:44-155`](./back/src/services/admin/adminCompany.service.ts) | Admin guard; `VIEW_COMPANIES` maps to its demo permission. Allowed. | List and total/status counts require `isDemo: true`; search, location, and status filters are added to the scoped query. | **PASS** |
| `GET /api/admin/companies/:companyId` | [`admin.ts:157-160`](./back/src/routes/admin.ts); [`adminCompanyControllers.ts:100-110`](./back/src/controllers/admin/adminCompanyControllers.ts); [`adminCompany.service.ts:336-400`](./back/src/services/admin/adminCompany.service.ts) | Admin guard; company-detail permission maps to its demo permission. Allowed. | Direct lookup requires a demo company. Job totals/recent jobs use its demo-company relation; application totals also require a demo candidate; nested application counts are candidate-scoped. | **PASS** |
| `GET /api/admin/companies/:companyId/jobs` | [`admin.ts:179-183`](./back/src/routes/admin.ts); [`adminJobControllers.ts:41-58`](./back/src/controllers/admin/adminJobControllers.ts); [`adminJob.service.ts:98-171`](./back/src/services/admin/adminJob.service.ts) | Admin guard; `VIEW_JOBS` maps to its demo permission. Allowed. | Verifies company ID is demo before listing. Job list/counts require a demo-company relation; nested application counts require a demo candidate. | **PASS** |
| `GET /api/admin/companies/:companyId/applications` | [`admin.ts:185-189`](./back/src/routes/admin.ts); [`adminApplicationControllers.ts:21-46`](./back/src/controllers/admin/adminApplicationControllers.ts); [`application.service.ts:504-635`](./back/src/services/application.service.ts) | Admin guard; `VIEW_APPLICATIONS` maps to its demo permission. Allowed. | `companyWhere` requires both a demo candidate and a job belonging to the requested demo company. Lists, totals, grouped status counts, search, pagination, and sorting use that scope. Demo response nulls `cvId`/`cvUrl`. | **PASS** |
| `GET /api/admin/users` | [`admin.ts:122-126`](./back/src/routes/admin.ts); [`adminUserControllers.ts:18-36`](./back/src/controllers/admin/adminUserControllers.ts); [`adminUser.service.ts:15-113`](./back/src/services/admin/adminUser.service.ts) | Admin guard; `VIEW_USERS` maps to its demo permission. Allowed. | Query requires `isDemo: true` and `role: USER`. Search, location/status filters, pagination, and totals preserve the scope. | **PASS** |
| `GET /api/admin/users/:userId` | [`admin.ts:128-131`](./back/src/routes/admin.ts); [`adminUserControllers.ts:39-51`](./back/src/controllers/admin/adminUserControllers.ts); [`adminUser.service.ts:116-163`](./back/src/services/admin/adminUser.service.ts) | Admin guard; user-detail permission maps to its demo permission. Allowed. | Direct lookup combines requested ID with demo-candidate scope. Application/saved-job counts are scoped to demo-company jobs; message/notification counts are omitted. | **PASS** |
| `GET /api/admin/users/:userId/professional-profile` | [`admin.ts:133-136`](./back/src/routes/admin.ts); [`adminUserDetailsControllers.ts:12-20`](./back/src/controllers/adminUserDetailsControllers.ts); [`adminUserDetails.service.ts:5-112`](./back/src/services/adminUserDetails.service.ts) | Admin guard; user-detail permission maps to its demo permission. Allowed. | User lookup requires demo candidate and `USER`; nested profile data belongs to that candidate. `cvPath` is nulled in demo mode. | **PASS** |
| `GET /api/admin/jobs` | [`admin.ts:192-196`](./back/src/routes/admin.ts); [`adminJobControllers.ts:24-37`](./back/src/controllers/admin/adminJobControllers.ts); [`adminJob.service.ts:24-96`](./back/src/services/admin/adminJob.service.ts) | Admin guard; `VIEW_JOBS` maps to its demo permission. Allowed. | List, filtered totals, and status counts share demo-company job scope; nested application counts filter demo candidates. | **PASS** |
| `GET /api/admin/jobs/:jobId` | [`admin.ts:198-201`](./back/src/routes/admin.ts); [`adminJobControllers.ts:63-75`](./back/src/controllers/admin/adminJobControllers.ts); [`adminJob.service.ts:175-218`](./back/src/services/admin/adminJob.service.ts) | Admin guard; `VIEW_JOBS` maps to its demo permission. Allowed. | Direct ID is combined with demo-company job scope; nested application count is candidate-scoped. | **PASS** |
| `GET /api/admin/jobs/:jobId/questions` | [`admin.ts:203-206`](./back/src/routes/admin.ts); [`adminJobControllers.ts:79-91`](./back/src/controllers/admin/adminJobControllers.ts); [`adminJob.service.ts:220-257`](./back/src/services/admin/adminJob.service.ts) | Admin guard; `VIEW_JOBS` maps to its demo permission. Allowed. | Questions are returned only after parent job lookup matches the ID and demo-company scope. | **PASS** |
| `GET /api/admin/jobs/:jobId/applications` | [`admin.ts:208-212`](./back/src/routes/admin.ts); [`adminJobControllers.ts:95-113`](./back/src/controllers/admin/adminJobControllers.ts); [`adminJob.service.ts:262-425`](./back/src/services/admin/adminJob.service.ts) | Admin guard; `VIEW_APPLICATIONS` maps to its demo permission. Allowed. | Verifies job is demo; list and grouped status counts require both demo-candidate and demo-company-job scopes. Search and filters apply on that query. | **PASS** |
| `GET /api/admin/applications` | [`admin.ts:214-218`](./back/src/routes/admin.ts); [`adminApplicationControllers.ts:84-97`](./back/src/controllers/admin/adminApplicationControllers.ts); [`adminApplication.service.ts:98-270`](./back/src/services/admin/adminApplication.service.ts) | Admin guard; `VIEW_APPLICATIONS` maps to its demo permission. Allowed. | List and status counts share the two-sided application scope; search, status, match-score, experience filters, and pagination operate on scoped rows. | **PASS** |
| `GET /api/admin/applications/:applicationId` | [`admin.ts:220-223`](./back/src/routes/admin.ts); [`adminApplicationControllers.ts:50-63`](./back/src/controllers/admin/adminApplicationControllers.ts); [`adminApplication.service.ts:10-70`](./back/src/services/admin/adminApplication.service.ts) | Admin guard; `VIEW_APPLICATIONS` maps to its demo permission. Allowed. | Direct application ID is combined with both scopes; demo response nulls CV ID and URL. | **PASS** |
| `GET /api/admin/applications/:applicationId/profile-snapshot` | [`admin.ts:225-228`](./back/src/routes/admin.ts); [`adminApplicationControllers.ts:67-80`](./back/src/controllers/admin/adminApplicationControllers.ts); [`adminApplication.service.ts:73-95`](./back/src/services/admin/adminApplication.service.ts) | Admin guard; `VIEW_APPLICATIONS` maps to its demo permission. Allowed. | Snapshot lookup requires both demo candidate and demo-company job; it returns only the scoped application’s snapshot. | **PASS** |

### Allowed auth/session routes

| Method and route | Evidence | Auth/policy and query scope | Result |
|---|---|---|---|
| `POST /api/auth/refresh` | [`auth.ts:53`](./back/src/routes/auth.ts); [`authControllers.ts:147-164`](./back/src/controllers/authControllers.ts); [`demoAdminAccess.ts:31-33`](./back/src/middlewares/demoAdminAccess.ts) | Explicit allowlist exception; trusted-origin check and refresh cookie; no business-resource data query. | **PASS** |
| `POST /api/auth/logout` | [`auth.ts:54`](./back/src/routes/auth.ts); [`authControllers.ts:133-143`](./back/src/controllers/authControllers.ts); [`demoAdminAccess.ts:31-33`](./back/src/middlewares/demoAdminAccess.ts) | Explicit allowlist exception; trusted-origin check; clears refresh cookie and performs no business-resource query. | **PASS** |

### Registered `/api/admin` endpoints denied to DEMO_ADMIN

Each route below is registered in [`back/src/routes/admin.ts`](./back/src/routes/admin.ts), but is not in the middleware allowlist. It is denied before controller/service execution. This is the intended safe default; these are not endpoint failures.

| Method and route | Registration evidence | Result for DEMO_ADMIN |
|---|---|---|
| `POST /api/admin/admins` | [`admin.ts:85-89`](./back/src/routes/admin.ts) | **DENY** |
| `GET /api/admin/admins` | [`admin.ts:91-98`](./back/src/routes/admin.ts) | **DENY** |
| `GET /api/admin/admins/:userId/permissions` | [`admin.ts:100-103`](./back/src/routes/admin.ts) | **DENY** |
| `GET /api/admin/roles` | [`admin.ts:105-108`](./back/src/routes/admin.ts) | **DENY** |
| `PATCH /api/admin/admins/:userId/role` | [`admin.ts:110-114`](./back/src/routes/admin.ts) | **DENY** |
| `PATCH /api/admin/admins/:userId/status` | [`admin.ts:116-120`](./back/src/routes/admin.ts) | **DENY** |
| `PATCH /api/admin/users/:userId/status` | [`admin.ts:138-142`](./back/src/routes/admin.ts) | **DENY** |
| `GET /api/admin/company-requests` | [`admin.ts:151-155`](./back/src/routes/admin.ts) | **DENY** |
| `PATCH /api/admin/companies/:companyId/approve` | [`admin.ts:162-165`](./back/src/routes/admin.ts) | **DENY** |
| `PATCH /api/admin/companies/:companyId/reject` | [`admin.ts:167-171`](./back/src/routes/admin.ts) | **DENY** |
| `PATCH /api/admin/companies/:companyId/status` | [`admin.ts:173-177`](./back/src/routes/admin.ts) | **DENY** |
| `PATCH /api/admin/jobs/:jobId/status` | [`admin.ts:230-234`](./back/src/routes/admin.ts) | **DENY** |

### Other registered API routes denied to DEMO_ADMIN

The following inventory enumerates the non-admin routes registered in the current route files and mounted at [`back/src/index.ts:59-78`](./back/src/index.ts). None is on the DEMO_ADMIN allowlist. A request using the DEMO_ADMIN bearer token is denied by the global boundary, even if the route has its own user/company ownership checks.

| Methods and paths | Route-file evidence | Result for DEMO_ADMIN bearer request |
|---|---|---|
| `POST /api/auth/register`, `/api/auth/login`, `/api/auth/support-access`, `/api/auth/support-access/logout` | [`auth.ts:34-51`](./back/src/routes/auth.ts) | **DENY** |
| `GET /api/company/dashboard`, `/api/company/profile`, `/api/company/users`, `/api/company/jobs`, `/api/company/jobs/:id/:slug`; `PUT /api/company/profile`, `/api/company/jobs/:id` | [`company.ts:24-69`](./back/src/routes/company.ts) | **DENY** |
| `GET /api/user/profile`, `/api/user/profile/:userId`, `/api/user/companies`, `/api/user/companies/:companyId`, `/api/user/companies/:companyId/jobs`, `/api/user/dashboard`; `PUT /api/user/profile`, `/api/user/professional-profile` | [`user.ts:20-50`](./back/src/routes/user.ts) | **DENY** |
| `GET /api/professional-profile` | [`professionalProfile.ts:9-13`](./back/src/routes/professionalProfile.ts) | **DENY** |
| `GET /api/application/me`, `/api/application/me/:applicationId`, `/api/application/company`; `POST /api/application/:jobId`; `PATCH /api/application/:applicationId/status`, `/api/application/:applicationId/withdraw` | [`application.ts:26-80`](./back/src/routes/application.ts) | **DENY** |
| `GET /api/jobs/`, `/api/jobs/info`, `/api/jobs/saved`, `/api/jobs/:id/questions`, `/api/jobs/:id/:slug`; `POST /api/jobs/`, `/api/jobs/saved/toggle`; `PATCH /api/jobs/:id/status` | [`job.ts:26-62`](./back/src/routes/job.ts) | **DENY** |
| `GET /api/notification/`; `PATCH /api/notification/read-all`, `/api/notification/:notificationId/read` | [`notification.ts:11-20`](./back/src/routes/notification.ts) | **DENY** |
| `POST /api/message/application/:applicationId`, `/api/message/`; `GET /api/message/`, `/api/message/company`, `/api/message/conversation/:conversationId`; `PATCH /api/message/conversation/:conversationId/read` | [`message.ts:18-55`](./back/src/routes/message.ts) | **DENY** |
| `POST /api/support/tickets`, `/api/support/tickets/:ticketId/messages`; `GET /api/support/tickets`, `/api/support/tickets/:ticketId`, `/api/support/categories`, `/api/support/admin/dashboard`, `/api/support/admin/tickets`; `PATCH /api/support/admin/tickets/:ticketId/assign`, `/unassign`, `/status`, `/priority` | [`support.ts:28-76`](./back/src/routes/support.ts) | **DENY** |
| `GET /api/support-only/session`, `/categories`, `/tickets`, `/tickets/:ticketId`; `POST /api/support-only/tickets`, `/tickets/:ticketId/messages` | [`supportOnly.ts:18-33`](./back/src/routes/supportOnly.ts) | **DENY** for a DEMO_ADMIN bearer request; route separately requires support-only cookie authentication. |
| `POST /api/education/`; `PUT /api/education/:educationId` | [`education.ts:15-25`](./back/src/routes/education.ts) | **DENY** |
| `POST /api/experience/`; `PUT /api/experience/:experienceId` | [`experience.ts:15-25`](./back/src/routes/experience.ts) | **DENY** |
| `POST /api/project/`; `PUT /api/project/:projectId` | [`project.ts:15-25`](./back/src/routes/project.ts) | **DENY** |
| `POST /api/certificate/`; `PUT /api/certificate/:certificateId` | [`certificate.ts:15-25`](./back/src/routes/certificate.ts) | **DENY** |
| `POST /api/skill/me`; `PUT /api/skill/me` | [`skill.ts:12-22`](./back/src/routes/skill.ts) | **DENY** |
| `POST /api/user-languages/`; `PUT /api/user-languages/:userLanguageId` | [`user-language.ts:10-14`](./back/src/routes/user-language.ts) | **DENY** |
| `GET /api/recommendation/` | [`recommendation.ts:6-7`](./back/src/routes/recommendation.ts) | **DENY** |
| `GET /api/locations/cities` | [`location.ts:7-12`](./back/src/routes/location.ts) | **DENY** for a request carrying the DEMO_ADMIN bearer token. |

No separate audit-log, export, or CV-download route was found in the inspected route registrations.

**Endpoint FAIL:** none identified.  
**Endpoint UNVERIFIED:** none at the backend API/query-response layer. The Cloudinary direct-URL concern is external to these API routes and remains **UNVERIFIED**.

## Migration review

- Exact migration file: [`back/prisma/migrations/20261026190000_add_demo_admin_data_scope/migration.sql`](./back/prisma/migrations/20261026190000_add_demo_admin_data_scope/migration.sql).
- Exact migration directory: `20261026190000_add_demo_admin_data_scope`.
- Prisma config sets `schema: "prisma/schema.prisma"` and `migrations.path: "prisma/migrations"` ([`back/prisma.config.ts:8-11`](./back/prisma.config.ts)); the migration lock declares PostgreSQL.
- SQL operations:
  1. Adds `"User"."isDemo"` and `"Company"."isDemo"` as `BOOLEAN NOT NULL DEFAULT false`.
  2. Creates indexes `"User_isDemo_role_idx"` and `"Company_isDemo_idx"`.
  3. Upserts six demo permission records, updating resource/action/description and reactivating conflicts.
  4. Upserts the `DEMO_ADMIN` role and reactivates a conflict.
  5. Inserts role-permission links for those six permission codes with `ON CONFLICT DO NOTHING`.
- Existing user/company rows receive `false` via the SQL column defaults. No deletes or unrelated table/data operations were found.
- It is safe to prepare for later review without applying. **It was not applied in this audit.**

## Fixture-marking script review

- Exact candidate allowlist: `candidate.01@demo.example.test`, `candidate.02@demo.example.test`, `candidate.03@demo.example.test`, `candidate.04@demo.example.test` ([`back/src/services/demoFixtureMarker.ts:1-6`](./back/src/services/demoFixtureMarker.ts)).
- Exact company allowlist: `company.bluebird@demo.example.test`, `company.cedar@demo.example.test`, `company.northstar@demo.example.test` ([`back/src/services/demoFixtureMarker.ts:8-12`](./back/src/services/demoFixtureMarker.ts)).
- The validator requires exactly one row for every expected email and rejects missing, duplicate, or unexpected rows; candidates must have `role: USER`; any allowlisted email found under the opposite account model aborts ([`back/src/services/demoFixtureMarker.ts:31-59`](./back/src/services/demoFixtureMarker.ts)).
- The script checks the explicit enablement flag, CLI acknowledgement, and environment acknowledgement before connecting. It performs all four fixture reads and validation before writes, then updates by both IDs and exact email allowlists; candidate writes recheck `role: USER`. Update counts must equal four and three or the transaction throws. Writes occur in a Serializable Prisma transaction ([`back/scripts/mark-demo-fixtures.ts:13-24`](./back/scripts/mark-demo-fixtures.ts), [`back/scripts/mark-demo-fixtures.ts:45-72`](./back/scripts/mark-demo-fixtures.ts), [`back/scripts/mark-demo-fixtures.ts:74-99`](./back/scripts/mark-demo-fixtures.ts)).
- Required acknowledgements: `--confirm-demo-fixture-marking` and `DEMO_FIXTURE_MARKING_ACK=I_CONFIRM_EXPLICIT_DEMO_FIXTURES` ([`back/src/services/demoFixtureMarker.ts:62-69`](./back/src/services/demoFixtureMarker.ts)).
- An additional explicit enablement flag, `DEMO_FIXTURE_MARKING_ENABLED=true`, is required. The fixture script accepts only `DEMO_FIXTURE_DATABASE_URL`; it does not import the shared Prisma client that uses generic `DATABASE_URL`.
- Before any write, the script checks the URL protocol, exact hostname `ep-lucky-dawn-ba1oxqmt.c-8.eu-central-1.aws.neon.tech`, exact database path `neondb`, and rejects URL parameters that could override host/database/socket. It connects a dedicated Prisma client constructed from this validated URL and queries `current_database()` using that same client before opening the transaction. This identity query has not been run against any database.
- No wildcard/domain-wide update, account creation, admin assignment, or password change was found. The script runs only when invoked directly (`require.main === module`); it is not referenced by build, startup, development, or deployment/migration scripts ([`back/scripts/mark-demo-fixtures.ts:89-91`](./back/scripts/mark-demo-fixtures.ts), [`back/package.json:7-13`](./back/package.json)).
- Tests cover acceptance of the exact rows; missing/duplicate rows; wrong account model/admin candidate; and the two acknowledgements ([`back/src/services/demoFixtureMarker.test.ts:19-89`](./back/src/services/demoFixtureMarker.test.ts)). These are helper tests, not database transaction integration tests. The script was **not run**.

## Frontend review

- `AdminGuard` fetches current server permissions and enforces a positive browser-path allowlist before rendering protected routes ([`front/src/routes/guards/AdminGuard.tsx:13-20`](./front/src/routes/guards/AdminGuard.tsx), [`front/src/routes/guards/AdminGuard.tsx:79-97`](./front/src/routes/guards/AdminGuard.tsx)).
- Demo navigation shows only dashboard, companies, users, jobs, and applications; restricted support, company-requests, notification, and admin-management links are hidden ([`front/src/features/admin/components/Sidebar.tsx:233-287`](./front/src/features/admin/components/Sidebar.tsx)).
- Dashboard hides the company-requests widget in demo mode ([`front/src/features/admin/pages/DashboardPage.tsx:82-98`](./front/src/features/admin/pages/DashboardPage.tsx)).
- User/company status controls require write permissions that the demo resolver does not grant ([`front/src/features/admin/components/users/UsersTable.tsx:43-45`](./front/src/features/admin/components/users/UsersTable.tsx), [`front/src/features/admin/components/userDetails/UserDetailsHeader.tsx:29-31`](./front/src/features/admin/components/userDetails/UserDetailsHeader.tsx), [`front/src/features/admin/components/AdminCompanyDetails/CompanyDetailsHeader.tsx:70-72`](./front/src/features/admin/components/AdminCompanyDetails/CompanyDetailsHeader.tsx)).
- The create-admin form omits DEMO_ADMIN from its role options ([`front/src/features/admin/pages/CreateAdminPage.tsx:154-169`](./front/src/features/admin/pages/CreateAdminPage.tsx)).
- These frontend checks are UX controls only; the backend allowlist and query scopes are the security boundary. Service-level redactions null CV references, and the response middleware additionally redacts nested/aliased file references before JSON serialization. This does not verify external Cloudinary URL access controls ([`back/src/middlewares/demoAdminResponse.ts`](./back/src/middlewares/demoAdminResponse.ts), [`front/src/features/admin/components/applicationDetails/ApplicationMetaInfo.tsx:69-90`](./front/src/features/admin/components/applicationDetails/ApplicationMetaInfo.ts)).
- The `/admin/operations` route is not admitted by the frontend demo-path list, and the current redirect sends DEMO_ADMIN to `/admin/dashboard`. Backend operations dashboard queries remain demo-scoped; this is a frontend route-parity issue, not an API access bypass.

## Working-tree state and deletions

The audit observed the following relevant files before creating this report:

- Added: migration `back/prisma/migrations/20261026190000_add_demo_admin_data_scope/migration.sql`; fixture script `back/scripts/mark-demo-fixtures.ts`; `back/src/services/demoFixtureMarker.ts` and its test; demo scope module and tests; demo middleware and its test; frontend `demoAdmin.ts` and characterization tests; `back/src/utils/trustedOrigin.ts`; and `ADMIN-AUTHORIZATION-REVIEW.md`.
- Modified: backend package/config-adjacent and demo-related auth, permission, controller, service, and type files; frontend admin permission/guard/navigation/page-related files; and unrelated profile/job-form files.
- `front/.env.example` was restored from `HEAD`; `back/fix-prisma-checksum.js` remains deleted. The latter is not referenced by package scripts, and its historical purpose is described in LOW findings.
- Other unrelated changed files in the initial worktree included `front/src/features/company/components/JobForm/steps/JobDetailsStep/JobRequirementsFields.tsx`, `front/src/features/company/components/JobForm/types.ts`, `front/src/features/user/components/complete/BasicInformationForm.tsx`, and `front/src/features/user/components/myProfile/ProfileEditForm.tsx`.
- No unrelated pre-existing worktree change was restored or overwritten. The only intentional restoration was `front/.env.example`; the checksum helper deletion and all other pre-existing changes remain untouched.

## Validation performed

- Focused backend isolated DEMO_ADMIN tests, including the response-redaction regression test: `node --import tsx --test src/middlewares/demoAdminAccess.integration.test.ts src/middlewares/demoAdminResponse.test.ts src/services/demoFixtureMarker.test.ts src/services/admin/demoAdminScope.test.ts src/services/admin/demoAdminScope.integration.test.ts` — **21/21 passed**.
- Frontend focused tests: `npm test -- tests/characterization/DemoAdminAccess.test.ts tests/characterization/DemoAdminSidebar.test.tsx tests/characterization/AdminWorkspaceRouting.test.tsx` — **20/20 passed**.
- Backend source typecheck — **passed**. Fixture-marker script typecheck with TypeScript 6 `--ignoreConfig` and explicit options — **passed**.
- `git diff --check` — **passed**.
- No database-dependent command, migration, fixture-marking execution, file formatting, or Railway operation was run.

## Required fixes and deployment checks

1. Verify Cloudinary’s actual delivery/access settings for raw CV assets. If public or not provably protected, move delivery behind authenticated, record-scoped access or use private/authenticated assets; keep CV references unavailable to DEMO_ADMIN until then.
2. The fixture-marker target safeguard is present in source. Keep the script unexecuted until a future operator explicitly confirms the intended database, enablement flag, and acknowledgements.
3. Keep `ADMIN-AUTHORIZATION-REVIEW.md` identified as a historical baseline; `front/.env.example` has been restored. The deletion of `back/fix-prisma-checksum.js` remains under review as an unrelated change and must not be reintroduced as a migration workaround.
4. Before release, test the reviewed changes in a non-production environment, including attempts with production IDs, unrelated slugs, and mismatched application candidate/job scopes.
5. Confirm no unintended permission or route behavior changes for SUPER_ADMIN, SUPPORT_ADMIN, and OPERATIONS_ADMIN in the target staging environment.

## Checks not provable from current source

- Actual Cloudinary delivery policy and accessibility of previously issued CV URLs.
- Whether a future operator supplies the correct dedicated fixture URL and acknowledgements. The code guard validates URL and connected database identity, but the script has not been executed.
- Whether all seven fixture rows exist uniquely and consistently in any target database; no database was queried.
- Railway environment variables, deployment commands, migration execution, and production database state; none were inspected or changed.

## Safe future deployment order

1. Resolve CV delivery uncertainty. The fixture-script target guard is present in source; keep it unexecuted until a future operator explicitly confirms the intended target and acknowledgements.
2. Review and test the migration and code in a non-production environment. Verify production IDs return not-found and only valid demo candidate/company application combinations are returned.
3. Back up and review the intended target database; apply the migration only through the approved deployment process.
4. Verify migration completion and that pre-existing rows defaulted to `isDemo=false`.
5. Independently confirm the database target and fixture identities, then run the fixture marker with both acknowledgements; verify only the seven approved accounts changed.
6. Assign DEMO_ADMIN through the approved admin-management process—not through the fixture script—and confirm deployed backend/frontend behavior.
7. Do not declare production-ready until the external CV-access check is resolved.
