# Route Protection System

## Overview

The route protection system ensures that each user type (Admin, User, Company) cannot access routes reserved for other user types.

## Main Guards

### 1. AdminGuard

**File:** `AdminGuard.tsx`

Protects all Admin routes under `/admin`.

**Rules:**

- ✅ Allows users with `role: "admin"`.
- ❌ Denies regular users (`role: "user"`).
- ❌ Denies companies.

**Redirects:**

- Companies are redirected to `/dashboard`.
- Unauthorized users are redirected to `/login`.

### 2. UserGuard

**File:** `UserGuard.tsx`

Protects regular-user routes such as `/jobs`, `/applications`, and `/saved-jobs`.

**Rules:**

- ✅ Allows users with `role: "user"` only.
- ❌ Denies users with `role: "admin"`.
- ❌ Denies companies.

**Redirects:**

- Companies are redirected to `/dashboard`.
- Unauthorized users are redirected to `/login`.

### 3. CompanyGuard

**File:** `CompanyGuard.tsx`

Protects company routes such as `/company/jobs`, `/create-job`, and `/company-profile`.

**Rules:**

- ✅ Allows companies only.
- ❌ Denies all users, including admins.
- ❌ Denies regular users.

**Redirects:**

- Users are redirected to `/dashboard`.
- Unauthorized users are redirected to `/login`.

## Protected Route Structure

```text
Admin routes (protected by AdminGuard)
├── /admin
├── /admin/company-requests
├── /admin/companies
├── /admin/companies/:id
├── /admin/jobs
└── /admin/jobs/:id/:slug

User routes (protected by UserGuard)
├── /profile/complete
├── /applications
├── /jobs
├── /jobs/:id/:slug
└── /saved-jobs

Company routes (protected by CompanyGuard)
├── /company/jobs
├── /company/applications
├── /company-profile
├── /company/profile/edit
├── /company/jobs/:id/:slug
├── /create-job
└── /company/jobs/:id/:slug/edit

Public routes (no guard)
├── /login
├── /register
├── /register/user
├── /register/company
└── /dashboard (redirects based on the user type)
```

## Access Matrix

| Route               | Admin | User | Company | Protection            |
| ------------------- | ----- | ---- | ------- | --------------------- |
| `/admin/*`          | ✅    | ❌   | ❌      | AdminGuard            |
| `/profile/complete` | ❌    | ✅   | ❌      | UserGuard             |
| `/jobs/*`           | ❌    | ✅   | ❌      | UserGuard             |
| `/applications`     | ❌    | ✅   | ❌      | UserGuard             |
| `/company/*`        | ❌    | ❌   | ✅      | CompanyGuard          |
| `/create-job`       | ❌    | ❌   | ✅      | CompanyGuard          |
| `/login`            | ✅    | ✅   | ✅      | Public                |
| `/register*`        | ✅    | ✅   | ✅      | Public                |

## How It Works

### Example 1: An admin opens a company route

```text
1. The admin opens /company/jobs.
2. CompanyGuard checks the session and denies access to the admin.
3. The admin is redirected to /dashboard.
```

### Example 2: A user opens an admin route

```text
1. The user opens /admin.
2. AdminGuard checks the company and user identities and the user's role.
3. The user is redirected to /login.
```

### Example 3: A company opens a user route

```text
1. The company opens /jobs.
2. UserGuard detects the company session and denies access.
3. The company is redirected to /dashboard.
```

## Special Cases

### ProfileCompletionGuard

- This guard already exists and works alongside the route protection system.
- It protects user routes that require a completed profile.
- Apply it after `UserGuard` to routes that require profile completion.

### DashboardRouter

`/dashboard` redirects users based on their type:

- Admin → `/admin`
- Company → `/company/jobs`
- User → `/dashboard` (renders `UserDashboard`)
- Signed-out user → `/login`

## Security Notes

✅ **Features:**

1. Frontend access protection.
2. Checks data stored in Redux.
3. Handles edge cases.
4. Redirects unauthorized users safely.

⚠️ **Important:**

1. This system provides **frontend protection only**.
2. **Backend protection** must also be implemented.
3. Validate the token and role in the API.

## Extending the System

To add a new user type:

1. Create a guard, such as `ModeratorGuard.tsx`.
2. Add the guard to `App.tsx`.
3. Add routes under the new guard.
4. Update the access matrix.

## Related Files

- `src/routes/guards/AdminGuard.tsx`
- `src/routes/guards/UserGuard.tsx`
- `src/routes/guards/CompanyGuard.tsx`
- `src/routes/guards/ProfileCompletionGuard.tsx`
- `src/routes/AppRoutes.tsx`
- `src/redux/slices/authSlice.ts`
