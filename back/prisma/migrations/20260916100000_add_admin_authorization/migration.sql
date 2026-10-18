CREATE TABLE "Permission" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "code" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Permission_code_key" ON "Permission"("code");

CREATE TABLE "AdminRole" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AdminRole_name_key" ON "AdminRole"("name");

CREATE TABLE "AdminRolePermission" (
  "roleId" TEXT NOT NULL,
  "permissionId" TEXT NOT NULL,
  CONSTRAINT "AdminRolePermission_pkey" PRIMARY KEY ("roleId", "permissionId")
);

CREATE INDEX "AdminRolePermission_permissionId_idx" ON "AdminRolePermission"("permissionId");

CREATE TABLE "UserAdminRole" (
  "userId" TEXT NOT NULL,
  "adminRoleId" TEXT NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserAdminRole_pkey" PRIMARY KEY ("userId", "adminRoleId")
);

CREATE INDEX "UserAdminRole_adminRoleId_idx" ON "UserAdminRole"("adminRoleId");

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
  "actorUserId" TEXT,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "resourceId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");
CREATE INDEX "AuditLog_resource_resourceId_createdAt_idx" ON "AuditLog"("resource", "resourceId", "createdAt");

ALTER TABLE "AdminRolePermission"
  ADD CONSTRAINT "AdminRolePermission_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdminRolePermission"
  ADD CONSTRAINT "AdminRolePermission_permissionId_fkey"
  FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserAdminRole"
  ADD CONSTRAINT "UserAdminRole_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserAdminRole"
  ADD CONSTRAINT "UserAdminRole_adminRoleId_fkey"
  FOREIGN KEY ("adminRoleId") REFERENCES "AdminRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "Permission" ("code", "resource", "action", "description")
VALUES
  ('VIEW_SUPPORT', 'SUPPORT', 'VIEW', 'View the support queue and ticket details'),
  ('REPLY_SUPPORT', 'SUPPORT', 'REPLY', 'Reply to support tickets'),
  ('CHANGE_SUPPORT_PRIORITY', 'SUPPORT', 'CHANGE_PRIORITY', 'Change support ticket priority'),
  ('ASSIGN_SUPPORT', 'SUPPORT', 'ASSIGN', 'Assign unassigned support tickets'),
  ('REASSIGN_SUPPORT', 'SUPPORT', 'REASSIGN', 'Reassign support tickets'),
  ('CHANGE_SUPPORT_STATUS', 'SUPPORT', 'CHANGE_STATUS', 'Change support ticket status'),
  ('CLOSE_SUPPORT', 'SUPPORT', 'CLOSE', 'Close support tickets'),
  ('VIEW_USERS', 'USERS', 'VIEW', 'View users'),
  ('VIEW_USER_DETAILS', 'USERS', 'VIEW_DETAILS', 'View user details'),
  ('EDIT_USERS', 'USERS', 'EDIT', 'Edit users'),
  ('SUSPEND_USERS', 'USERS', 'SUSPEND', 'Suspend users'),
  ('DELETE_USERS', 'USERS', 'DELETE', 'Delete users'),
  ('VIEW_COMPANIES', 'COMPANIES', 'VIEW', 'View companies'),
  ('VIEW_COMPANY_DETAILS', 'COMPANIES', 'VIEW_DETAILS', 'View company details'),
  ('EDIT_COMPANIES', 'COMPANIES', 'EDIT', 'Edit companies'),
  ('SUSPEND_COMPANIES', 'COMPANIES', 'SUSPEND', 'Suspend companies'),
  ('DELETE_COMPANIES', 'COMPANIES', 'DELETE', 'Delete companies'),
  ('VIEW_JOBS', 'JOBS', 'VIEW', 'View jobs'),
  ('CREATE_JOBS', 'JOBS', 'CREATE', 'Create jobs'),
  ('EDIT_JOBS', 'JOBS', 'EDIT', 'Edit jobs'),
  ('DELETE_JOBS', 'JOBS', 'DELETE', 'Delete jobs'),
  ('APPROVE_JOBS', 'JOBS', 'APPROVE', 'Approve jobs'),
  ('REJECT_JOBS', 'JOBS', 'REJECT', 'Reject jobs'),
  ('VIEW_APPLICATIONS', 'APPLICATIONS', 'VIEW', 'View applications'),
  ('UPDATE_APPLICATION_STATUS', 'APPLICATIONS', 'UPDATE_STATUS', 'Update application status'),
  ('VIEW_ADMINS', 'ADMIN_MANAGEMENT', 'VIEW', 'View administrators'),
  ('CREATE_ADMIN', 'ADMIN_MANAGEMENT', 'CREATE', 'Create administrators'),
  ('EDIT_ADMIN', 'ADMIN_MANAGEMENT', 'EDIT', 'Edit administrators'),
  ('DISABLE_ADMIN', 'ADMIN_MANAGEMENT', 'DISABLE', 'Disable administrators'),
  ('ASSIGN_ADMIN_ROLE', 'ADMIN_MANAGEMENT', 'ASSIGN_ROLE', 'Assign administrator roles'),
  ('MANAGE_ADMIN_PERMISSIONS', 'ADMIN_MANAGEMENT', 'MANAGE_PERMISSIONS', 'Manage administrator permissions'),
  ('VIEW_AUDIT_LOG', 'AUDIT', 'VIEW', 'View audit logs')
ON CONFLICT ("code") DO UPDATE SET
  "resource" = EXCLUDED."resource",
  "action" = EXCLUDED."action",
  "description" = EXCLUDED."description",
  "active" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "AdminRole" ("name", "description")
VALUES
  ('SUPER_ADMIN', 'Full administrative access'),
  ('SUPPORT_ADMIN', 'Support queue and conversation access'),
  ('OPERATIONS_ADMIN', 'Operations access for users, companies, jobs, and applications')
ON CONFLICT ("name") DO UPDATE SET
  "description" = EXCLUDED."description",
  "active" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "AdminRolePermission" ("roleId", "permissionId")
SELECT roles."id", permissions."id"
FROM "AdminRole" roles CROSS JOIN "Permission" permissions
WHERE roles."name" = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO "AdminRolePermission" ("roleId", "permissionId")
SELECT roles."id", permissions."id"
FROM "AdminRole" roles
JOIN "Permission" permissions ON permissions."code" IN (
  'VIEW_SUPPORT', 'REPLY_SUPPORT', 'CHANGE_SUPPORT_PRIORITY',
  'ASSIGN_SUPPORT', 'REASSIGN_SUPPORT', 'CHANGE_SUPPORT_STATUS', 'CLOSE_SUPPORT'
)
WHERE roles."name" = 'SUPPORT_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO "AdminRolePermission" ("roleId", "permissionId")
SELECT roles."id", permissions."id"
FROM "AdminRole" roles
JOIN "Permission" permissions ON permissions."code" IN (
  'VIEW_USERS', 'VIEW_USER_DETAILS', 'EDIT_USERS', 'SUSPEND_USERS', 'DELETE_USERS',
  'VIEW_COMPANIES', 'VIEW_COMPANY_DETAILS', 'EDIT_COMPANIES', 'SUSPEND_COMPANIES', 'DELETE_COMPANIES',
  'VIEW_JOBS', 'CREATE_JOBS', 'EDIT_JOBS', 'DELETE_JOBS', 'APPROVE_JOBS', 'REJECT_JOBS',
  'VIEW_APPLICATIONS', 'UPDATE_APPLICATION_STATUS'
)
WHERE roles."name" = 'OPERATIONS_ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO "UserAdminRole" ("userId", "adminRoleId")
SELECT users."id", roles."id"
FROM "User" users CROSS JOIN "AdminRole" roles
WHERE users."role" = 'ADMIN' AND roles."name" = 'SUPER_ADMIN'
ON CONFLICT DO NOTHING;
