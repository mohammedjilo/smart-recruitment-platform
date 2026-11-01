import assert from "node:assert/strict";
import test from "node:test";

import { ADMIN_ROLE_DEFINITIONS, PERMISSIONS } from "./permissions.js";

test("admin role definitions remain centralized and preserve multi-role permissions", () => {
  assert.ok(
    ADMIN_ROLE_DEFINITIONS.SUPER_ADMIN.permissions.includes(
      PERMISSIONS.VIEW_ADMIN_DASHBOARD
    )
  );
  assert.ok(
    ADMIN_ROLE_DEFINITIONS.SUPPORT_ADMIN.permissions.includes(
      PERMISSIONS.VIEW_SUPPORT_DASHBOARD
    )
  );
  assert.ok(
    ADMIN_ROLE_DEFINITIONS.OPERATIONS_ADMIN.permissions.includes(
      PERMISSIONS.VIEW_OPERATIONS_DASHBOARD
    )
  );

  const userRoles = ["SUPER_ADMIN", "SUPPORT_ADMIN"] as const;
  const mergedPermissions = new Set(
    userRoles.flatMap(
      (roleName) => ADMIN_ROLE_DEFINITIONS[roleName].permissions
    )
  );

  assert.ok(mergedPermissions.has(PERMISSIONS.VIEW_ADMIN_DASHBOARD));
  assert.ok(mergedPermissions.has(PERMISSIONS.VIEW_SUPPORT_DASHBOARD));
  assert.ok(mergedPermissions.has(PERMISSIONS.REPLY_SUPPORT_TICKETS));
});
