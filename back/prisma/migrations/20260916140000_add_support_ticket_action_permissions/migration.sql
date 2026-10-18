INSERT INTO "Permission" ("code", "resource", "action", "description")
VALUES
  ('VIEW_SUPPORT_TICKETS', 'SUPPORT_TICKET', 'VIEW', 'View support tickets'),
  ('REPLY_SUPPORT_TICKETS', 'SUPPORT_TICKET', 'REPLY', 'Reply to support tickets'),
  ('ASSIGN_SUPPORT_TICKET', 'SUPPORT_TICKET', 'ASSIGN', 'Assign unassigned support tickets'),
  ('REASSIGN_SUPPORT_TICKET', 'SUPPORT_TICKET', 'REASSIGN', 'Reassign support tickets'),
  ('CLOSE_SUPPORT_TICKET', 'SUPPORT_TICKET', 'CLOSE', 'Close resolved support tickets')
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
WHERE roles."name" IN ('SUPER_ADMIN', 'SUPPORT_ADMIN')
  AND permissions."code" IN (
    'VIEW_SUPPORT_TICKETS',
    'REPLY_SUPPORT_TICKETS',
    'ASSIGN_SUPPORT_TICKET',
    'REASSIGN_SUPPORT_TICKET',
    'CLOSE_SUPPORT_TICKET'
  )
ON CONFLICT DO NOTHING;
