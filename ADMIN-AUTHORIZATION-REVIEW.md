# Admin Authorization Review for a Public Demo

> **Historical baseline, not a current security assessment.** The findings and recommendations below describe the pre-DEMO_ADMIN implementation as it existed when this review was first written. They must not be read as describing the current worktree. DEMO_ADMIN now has a fixed read-only permission set and is allowed to read administrative data without `isDemo` record filtering; mutations and CV access remain excluded by the backend boundary. The current implementation is in [`back/src/authorization/permissions.ts`](./back/src/authorization/permissions.ts), [`back/src/authorization/permission.service.ts`](./back/src/authorization/permission.service.ts), and [`back/src/middlewares/demoAdminAccess.ts`](./back/src/middlewares/demoAdminAccess.ts). The detailed report [`DEMO_ADMIN-SECURITY-AUDIT.md`](./DEMO_ADMIN-SECURITY-AUDIT.md) is also a historical baseline for the earlier scoped design. External Cloudinary CV delivery/access behavior has not been verified.

## Scope and conclusion

This is a read-only source review of the existing Admin authorization model, its backend endpoints and services, frontend routes and controls, Prisma models, migrations, and available authorization tests. No database connection or environment inspection was performed.

**Conclusion:** The existing permission system can restrict operations by permission, but it does not scope data access to a demo tenant or demo account. Most Admin list, detail, dashboard, application, and support queries operate on production-wide records. Assigning a restricted permission set alone therefore cannot provide a broad, safe public Demo Admin experience on the shared production database.

Do not assign an existing `SUPPORT_ADMIN` or `OPERATIONS_ADMIN` role to a public demo account. Their permissions expose sensitive production data and, depending on the role, allow mutations. A narrowly scoped backend data boundary and a dedicated read-only Demo role are needed before opening the data-oriented Admin pages.

## 1. Authorization architecture

- `/api/admin` is protected by `onlyAdminMiddleware`; an active Admin identity is required. Routes then apply permission middleware to individual operations. See [`back/src/routes/admin.ts`](./back/src/routes/admin.ts) and [`back/src/middlewares/auth.ts`](./back/src/middlewares/auth.ts).
- `getUserPermissions` collects active permissions from active roles assigned to the Admin. Multiple role assignments combine permissions; there is no deny/exception mechanism. See [`back/src/authorization/permission.service.ts`](./back/src/authorization/permission.service.ts).
- Permission codes and the three role names are declared in [`back/src/authorization/permissions.ts`](./back/src/authorization/permissions.ts). Roles and their permissions are stored through `Permission`, `AdminRole`, `AdminRolePermission`, and `UserAdminRole` in [`back/prisma/schema.prisma`](./back/prisma/schema.prisma).
- Current Admin role names accepted by validation and service methods are `SUPER_ADMIN`, `SUPPORT_ADMIN`, and `OPERATIONS_ADMIN`. See [`back/src/validation/adminAuthorization.validation.ts`](./back/src/validation/adminAuthorization.validation.ts) and [`back/src/services/adminAuthorization.service.ts`](./back/src/services/adminAuthorization.service.ts).
- The authorization service supports listing and assigning existing roles; there is no API in the reviewed Admin router for creating roles or editing role-permission links. `MANAGE_ADMIN_PERMISSIONS` exists as a code but has no matching permission-management endpoint in the route inventory.
- Migration [`20260916100000_add_admin_authorization`](./back/prisma/migrations/20260916100000_add_admin_authorization/migration.sql) creates roles and permissions; it gives Super Admin all permissions and assigns broad support and operations permissions to their respective roles. Migration [`20260916110000_normalize_initial_super_admin`](./back/prisma/migrations/20260916110000_normalize_initial_super_admin/migration.sql) makes the earliest Admin the Super Admin and normalizes other existing Admin assignments to Support Admin. No application-startup Admin bootstrap was found in the reviewed source.
- Frontend [`AdminGuard`](./front/src/routes/guards/AdminGuard.tsx) fetches server permissions; [`PermissionGuard`](./front/src/features/admin/authorization/PermissionGuard.tsx) gates routes, and the sidebar hides links based on permissions. These are UX controls, not the security boundary. Backend route/service authorization must deny restricted requests regardless of the frontend.

## 2. Admin capability inventory

| Area / page | Endpoint(s) and current permission | Read or mutation; data exposure and risk | Safe for public Demo Admin now? |
|---|---|---|---|
| General Admin dashboard | `GET /api/admin/dashboard` — `VIEW_ADMIN_DASHBOARD`; individual cards/widgets also depend on `VIEW_USERS`, `VIEW_COMPANIES`, `VIEW_JOBS`, `VIEW_APPLICATIONS`, and `VIEW_SUPPORT`. | Read-only, but counts and widgets are computed from production-wide records. With resource permissions, widgets can reveal company contact information, jobs, and other production details. See [`adminDashboard.service.ts`](./back/src/services/admin/adminDashboard.service.ts) and [`DashboardPage.tsx`](./front/src/features/admin/pages/DashboardPage.tsx). | **No** for a useful data-rich dashboard without scoped queries. |
| Operations dashboard | `GET /api/admin/operations/dashboard` — `VIEW_OPERATIONS_DASHBOARD`; each resource count also requires its corresponding `VIEW_*` permission. | Read-only global aggregate counts. No individual records are returned by this endpoint, but counts describe production. Giving a resource permission to populate a count also unlocks that resource's list route. See [`adminDashboard.service.ts`](./back/src/services/admin/adminDashboard.service.ts). | **Limited:** only zero or unscoped production aggregates are possible today; no isolated Demo counts. |
| Support dashboard, ticket list and details | `/api/support/admin/dashboard`, `/api/support/admin/tickets`, `/api/support/tickets/:ticketId`; require `VIEW_SUPPORT_DASHBOARD`, `VIEW_SUPPORT_TICKETS`, or `VIEW_SUPPORT` at service level, depending on the operation. | Reads production support queues, ticket descriptions, requester details, and private messages. The service does not scope Admin access to demo tickets. See [`support.ts`](./back/src/routes/support.ts) and [`support.service.ts`](./back/src/services/support.service.ts). | **No.** Private support content must remain unavailable. |
| Support replies and ticket management | `/api/support/tickets/:id/messages`; `/api/support/admin/tickets/:id/{assign,unassign,status,priority}`. Separate permissions include `REPLY_SUPPORT_TICKETS`, `ASSIGN_SUPPORT_TICKET`, `REASSIGN_SUPPORT_TICKET`, `CHANGE_SUPPORT_STATUS`, `CLOSE_SUPPORT_TICKET`, and `CHANGE_SUPPORT_PRIORITY` (with legacy equivalents for some actions). | Mutates production tickets, can assign/reassign or close them, change status/priority, and send messages to real customers. The backend checks permissions in `support.service.ts`; [`support.authorization.integration.test.ts`](./back/src/middlewares/support.authorization.integration.test.ts) verifies denied Admins cannot perform restricted support actions. | **No.** Hide support data and all actions from the demo. |
| Company registration requests | `GET /api/admin/company-requests` — `VIEW_COMPANIES`; approve — `EDIT_COMPANIES`; reject/status — `SUSPEND_COMPANIES`. | The list contains real company contacts and request information. Approve/reject/status changes affect production accounts. The request page visibly includes action controls; the backend permission checks in [`admin.ts`](./back/src/routes/admin.ts) remain essential regardless of button visibility. See [`CompanyRequestsPage.tsx`](./front/src/features/admin/pages/CompanyRequestsPage.tsx) and [`adminCompany.service.ts`](./back/src/services/admin/adminCompany.service.ts). | **No.** |
| Companies and company details | `GET /api/admin/companies` — `VIEW_COMPANIES`; `GET /api/admin/companies/:companyId` — `VIEW_COMPANY_DETAILS`; associated jobs/applications require `VIEW_JOBS`/`VIEW_APPLICATIONS`. Status/approval endpoints require mutation permissions. | Production-wide records; company details include contact, location, status, and other company information. Status and approval changes affect real companies. Services use global queries or ID lookups, not a Demo scope. See [`adminCompany.service.ts`](./back/src/services/admin/adminCompany.service.ts) and [`CompanyDetailsPage.tsx`](./front/src/features/admin/pages/CompanyDetailsPage.tsx). | **No.** |
| Users and candidate details | `GET /api/admin/users` — `VIEW_USERS`; user and professional-profile detail — `VIEW_USER_DETAILS`; status — `SUSPEND_USERS`. | User lists include names, email, phone, location, and account status. Details may include birth date and contact information; professional profiles include CV path, experience, education, projects, certificates, and skills. Status changes can deactivate production users. See [`adminUser.service.ts`](./back/src/services/admin/adminUser.service.ts) and [`adminUserDetails.service.ts`](./back/src/services/adminUserDetails.service.ts). | **No.** |
| Jobs and job details | `GET /api/admin/jobs`, `/jobs/:jobId`, `/jobs/:jobId/questions` — `VIEW_JOBS`; status mutation — `EDIT_JOBS`. | Reads production job descriptions, company details, job questions, and application counts. Status changes affect live production jobs. The list omits drafts in the reviewed service, but still spans production. See [`adminJob.service.ts`](./back/src/services/admin/adminJob.service.ts). | **No** for global production records; could be enabled after Demo-scoped queries and test records exist. |
| Applications, application details, and profile snapshots | `/api/admin/applications`, `/applications/:applicationId`, `/profile-snapshot`, and per-job/company application endpoints — `VIEW_APPLICATIONS`. | Highly sensitive production data: candidate identity, email, CV references, profile snapshots, recommendation data, and application details. The detail service returns phone and birth date; snapshot endpoint returns the stored profile snapshot. Queries are not Demo-scoped. See [`adminApplication.service.ts`](./back/src/services/admin/adminApplication.service.ts). | **No.** |
| Admin management | `/api/admin/admins`, `/roles`, `/admins/:userId/permissions` — `VIEW_ADMINS`; create — `CREATE_ADMIN`; assign role — `ASSIGN_ADMIN_ROLE`; deactivate — `DISABLE_ADMIN`. | Reveals Admin account details and roles. Creating Admins, changing roles, or disabling accounts are security-sensitive. Assigning Super Admin additionally checks `MANAGE_ADMIN_PERMISSIONS`. See [`admin.ts`](./back/src/routes/admin.ts) and [`adminAuthorization.service.ts`](./back/src/services/adminAuthorization.service.ts). | **No.** |
| Notifications | `GET /api/notification` and notification read endpoints; Admin notification types are filtered based on the current Admin's permissions in the notification service. | Reads notifications for the current Admin account, not all users' notifications. However, support/company-request notifications may expose production events or references. Mark-as-read changes only the current account's notification records. See [`notification.service.ts`](./back/src/services/notification.service.ts) and [`notificationControllers.ts`](./back/src/controllers/notificationControllers.ts). | **Only if** it returns no sensitive types; do not add support/company permissions merely to populate the page. |
| Admin About page and current permissions | `/admin/about` has no resource permission requirement; `GET /api/admin/me/permissions` returns the current Admin's permissions/role names. | Static guide and the current account's authorization metadata. No production user or company records are needed. | **Yes**, subject to normal Admin authentication. This provides little interactive exploration. |

### Distinguish route visibility from action authorization

The frontend gates navigation and sometimes conditionally displays action controls. For example, `CompanyRequestsPage` wires approve/reject mutations, while the route is gated by `VIEW_COMPANIES`; the backend separately checks `EDIT_COMPANIES` or `SUSPEND_COMPANIES`. Similarly, support action buttons are permission-aware, and support service methods enforce permissions server-side. A hidden button is not a security control.

Several permission codes exist without a corresponding Admin mutation route in the reviewed route inventory, including `DELETE_USERS`, `DELETE_COMPANIES`, `DELETE_JOBS`, `APPROVE_JOBS`, `REJECT_JOBS`, and `UPDATE_APPLICATION_STATUS`. Do not interpret their presence as proof of a reachable operation; continue to protect any later endpoint that uses them.

## 3. What can be enabled without application-code changes

- The Admin About page and current Admin permissions view are the clearest safe existing areas.
- Operations dashboard can return aggregate counts, but they are production-wide. Without resource permissions the current implementation returns zero for those resources; granting `VIEW_*` to obtain non-zero values also opens corresponding production list APIs.
- Existing role assignments are not a safe shortcut: `SUPPORT_ADMIN` exposes sensitive support operations; `OPERATIONS_ADMIN` exposes broad production data and mutation permissions. Changing either role's linked permissions would affect every Admin assigned to that role, not only the demo account.

Therefore, **no existing role/permission profile provides broad, safe exploration of live-backed Admin pages without code changes**.

## 4. Data isolation requirements and pages to keep unavailable

Before making any data-oriented page available to a public demo account, the backend must enforce a trusted Demo data scope for both list and detail queries. A client-supplied ID, route guard, hidden link, search filter, or seeded-looking record is not sufficient if a caller can request another production ID directly.

Keep these pages unavailable until the corresponding endpoints and associated detail endpoints are scoped and sensitive fields are minimized:

- Users, candidate details, and professional profiles.
- Companies, company requests, and company details.
- Jobs and job details.
- Applications, candidate snapshots, CV references, and associated job/company applications.
- Support dashboard, ticket lists, ticket details, and messages.
- Notifications that reference real support or company-request events.
- Admin management, Admin creation, role assignment, and Admin account status operations.
- All user/company/job status changes, company approval/rejection, and support actions.

The source confirms global or ID-based lookups in the reviewed services; it does not confirm that any production dataset is safe or fictional. No production records were inspected.

## 5. Proposed Demo Admin profile

There is no safe profile to assign using only the current permission codes and global query behavior. After backend Demo isolation is implemented, add a dedicated Demo role with:

- A Demo dashboard permission returning Demo-only aggregate data.
- Read-only permissions for Demo companies, jobs, candidate profiles, and applications, with response fields minimized and records restricted to the Demo dataset.
- No access to production support tickets/messages or notifications tied to real users.
- No `EDIT_*`, `SUSPEND_*`, `DELETE_*`, `APPROVE_*`, `REJECT_*`, or `UPDATE_APPLICATION_STATUS`.
- No `CREATE_ADMIN`, `ASSIGN_ADMIN_ROLE`, `DISABLE_ADMIN`, `MANAGE_ADMIN_PERMISSIONS`, or `VIEW_AUDIT_LOG`.

Prefer explicit Demo permissions (for example, `VIEW_DEMO_USERS`, `VIEW_DEMO_JOBS`, and `VIEW_DEMO_APPLICATIONS`) or a server-enforced Demo scope over granting general `VIEW_USERS`/`VIEW_APPLICATIONS` permissions.

## 6. Minimal implementation sequence and focused tests

1. Define the Demo record boundary and populate it only with fictional records through an approved process. Do not use real candidate or support content for the public demo.
2. Enforce that boundary in backend list, detail, aggregate, nested association, and file/CV-related services. Test direct ID lookups as well as paginated lists.
3. Add a dedicated Demo role and restricted permissions, plus a controlled way to assign that role only to the dedicated demo account. Do not alter existing Super Admin, Support Admin, or Operations Admin assignments.
4. Keep all production mutations unavailable. If demo-only mutations are later requested, validate the Demo scope on every affected record in the backend before writing.
5. Add backend tests asserting that Demo Admin can read permitted Demo records, cannot read a production record by guessing its ID, cannot retrieve a production profile snapshot/CV reference, and cannot mutate production records. Assert denied requests do not perform database writes.
6. Add tests that dashboard counts, related-company/job/application endpoints, and notifications cannot cross the Demo boundary. Add response-field assertions for PII minimization.
7. Add frontend tests for route/sidebar visibility and disabled or absent demo actions as UX checks, plus regression tests preserving current Admin and support authorization behavior.
8. Review and approve any schema/migration/bootstrap work separately before applying it to production. This investigation did not run migrations or connect to any database.

## 7. Overall assessment

The current role-permission model is a useful foundation for restricting **which kinds of operations** an Admin can perform. It is **not sufficient to isolate which production records** a Demo Admin can inspect or modify. Targeted backend data-scoping and a dedicated read-only Demo role are needed. Until then, keep the sensitive pages and operations above unavailable to the public demo account.

## Read-only scope confirmation

No files were changed as part of the investigation. No database was accessed, no Admin account or permission assignment was created, no migration or seed/repair script was run, and no environment or Railway settings were inspected or changed.
