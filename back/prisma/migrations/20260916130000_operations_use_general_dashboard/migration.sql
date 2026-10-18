INSERT INTO "AdminRolePermission" ("roleId", "permissionId")
SELECT roles."id", permissions."id"
FROM "AdminRole" roles
CROSS JOIN "Permission" permissions
WHERE roles."name" = 'OPERATIONS_ADMIN'
  AND permissions."code" = 'VIEW_ADMIN_DASHBOARD'
ON CONFLICT DO NOTHING;