INSERT INTO "Permission" ("code", "resource", "action", "description")
VALUES
  ('VIEW_ADMIN_DASHBOARD', 'ADMIN_DASHBOARD', 'VIEW', 'View the general admin dashboard'),
  ('VIEW_SUPPORT_DASHBOARD', 'SUPPORT_DASHBOARD', 'VIEW', 'View the support admin dashboard'),
  ('VIEW_OPERATIONS_DASHBOARD', 'OPERATIONS_DASHBOARD', 'VIEW', 'View the operations admin dashboard')
ON CONFLICT ("code") DO UPDATE SET
  "resource" = EXCLUDED."resource",
  "action" = EXCLUDED."action",
  "description" = EXCLUDED."description",
  "active" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

INSERT INTO "AdminRolePermission" ("roleId", "permissionId")
SELECT roles."id", permissions."id"
FROM "AdminRole" roles
CROSS JOIN "Permission" permissions
WHERE roles."name" = 'SUPER_ADMIN'
  AND permissions."code" IN ('VIEW_ADMIN_DASHBOARD', 'VIEW_SUPPORT_DASHBOARD', 'VIEW_OPERATIONS_DASHBOARD')
ON CONFLICT DO NOTHING;

INSERT INTO "AdminRolePermission" ("roleId", "permissionId")
SELECT roles."id", permissions."id"
FROM "AdminRole" roles
CROSS JOIN "Permission" permissions
WHERE roles."name" = 'SUPPORT_ADMIN'
  AND permissions."code" = 'VIEW_SUPPORT_DASHBOARD'
ON CONFLICT DO NOTHING;

INSERT INTO "AdminRolePermission" ("roleId", "permissionId")
SELECT roles."id", permissions."id"
FROM "AdminRole" roles
CROSS JOIN "Permission" permissions
WHERE roles."name" = 'OPERATIONS_ADMIN'
  AND permissions."code" = 'VIEW_OPERATIONS_DASHBOARD'
ON CONFLICT DO NOTHING;

