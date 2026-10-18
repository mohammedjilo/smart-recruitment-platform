WITH initial_admin AS (
  SELECT "id"
  FROM "User"
  WHERE "role" = 'ADMIN'
  ORDER BY "createdAt" ASC, "id" ASC
  LIMIT 1
), additional_admins AS (
  SELECT "id"
  FROM "User"
  WHERE "role" = 'ADMIN'
    AND "id" NOT IN (SELECT "id" FROM initial_admin)
)
DELETE FROM "UserAdminRole"
WHERE "userId" IN (SELECT "id" FROM additional_admins);

INSERT INTO "UserAdminRole" ("userId", "adminRoleId")
SELECT admins."id", roles."id"
FROM "User" admins
CROSS JOIN "AdminRole" roles
WHERE admins."role" = 'ADMIN'
  AND admins."id" NOT IN (
    SELECT "id"
    FROM "User"
    WHERE "role" = 'ADMIN'
    ORDER BY "createdAt" ASC, "id" ASC
    LIMIT 1
  )
  AND roles."name" = 'SUPPORT_ADMIN'
ON CONFLICT DO NOTHING;
