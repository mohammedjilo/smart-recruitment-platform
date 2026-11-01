import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { PERMISSIONS } from "../authorization/permissions.js";
import { createApp } from "../index.js";
import { prisma } from "../config/db.js";
import { signAccessToken } from "../utils/tokens.js";
import { isDemoAdminRequestAllowed } from "./demoAdminAccess.js";

process.env.JWT_SECRET = "demo-admin-isolation-test-secret";

const demoPermissions = [
  PERMISSIONS.DEMO_ADMIN_READ_ONLY,
].map((code) => ({ permission: { code } }));

const originals: Array<{
  target: object;
  property: string;
  descriptor?: PropertyDescriptor;
}> = [];

const replace = (target: object, property: string, value: unknown) => {
  originals.push({
    target,
    property,
    descriptor: Object.getOwnPropertyDescriptor(target, property),
  });
  Object.defineProperty(target, property, {
    configurable: true,
    writable: true,
    value,
  });
};

const app = createApp();
let server: ReturnType<typeof app.listen>;
let baseUrl: string;

before(async () => {
  replace(
    prisma.user,
    "findUnique",
    async ({ where }: { where: { id?: string } }) => {
      if (where.id === "demo-admin") {
        return {
          id: "demo-admin",
          role: "ADMIN",
          accountStatus: "ACTIVE",
          adminRoleAssignments: [
            {
              adminRole: {
                name: "DEMO_ADMIN",
                permissions: demoPermissions,
              },
            },
          ],
        };
      }
      if (where.id === "demo-mixed-admin") {
        return {
          id: "demo-mixed-admin",
          role: "ADMIN",
          accountStatus: "ACTIVE",
          adminRoleAssignments: [
            {
              adminRole: {
                name: "DEMO_ADMIN",
                permissions: demoPermissions,
              },
            },
            {
              adminRole: {
                name: "OPERATIONS_ADMIN",
                permissions: [
                  {
                    permission: { code: PERMISSIONS.VIEW_COMPANIES },
                  },
                  {
                    permission: { code: PERMISSIONS.SUSPEND_USERS },
                  },
                ],
              },
            },
          ],
        };
      }
      if (where.id === "internal-admin") {
        return {
          id: "internal-admin",
          role: "ADMIN",
          accountStatus: "ACTIVE",
          adminRoleAssignments: [
            {
              adminRole: {
                name: "OPERATIONS_ADMIN",
                permissions: [],
              },
            },
          ],
        };
      }
      return null;
    }
  );
  server = app.listen(0);
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
  for (const { target, property, descriptor } of originals.reverse()) {
    if (descriptor) Object.defineProperty(target, property, descriptor);
    else Reflect.deleteProperty(target, property);
  }
});

const request = (
  path: string,
  token?: string,
  method = "GET"
) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

test("Demo Admin allowlist permits only reviewed read endpoints", () => {
  assert.equal(isDemoAdminRequestAllowed("GET", "/api/admin/companies"), true);
  assert.equal(
    isDemoAdminRequestAllowed(
      "GET",
      "/api/admin/applications/application-1/profile-snapshot"
    ),
    true
  );
  assert.equal(
    isDemoAdminRequestAllowed("GET", "/api/admin/company-requests"),
    true
  );
  assert.equal(isDemoAdminRequestAllowed("GET", "/api/support/admin/tickets"), true);
  assert.equal(isDemoAdminRequestAllowed("GET", "/api/support/categories"), true);
  assert.equal(isDemoAdminRequestAllowed("GET", "/api/notification"), true);
  assert.equal(isDemoAdminRequestAllowed("GET", "/api/locations/cities"), true);
  assert.equal(isDemoAdminRequestAllowed("GET", "/api/admin/admins"), false);
  assert.equal(isDemoAdminRequestAllowed("GET", "/api/admin/roles"), false);
  assert.equal(
    isDemoAdminRequestAllowed("GET", "/api/admin/future-endpoint"),
    false
  );
  assert.equal(
    isDemoAdminRequestAllowed("PATCH", "/api/admin/companies/company-1"),
    false
  );
  assert.equal(isDemoAdminRequestAllowed("POST", "/api/auth/login"), true);
  assert.equal(isDemoAdminRequestAllowed("POST", "/api/auth/refresh"), true);
});

test("Demo Admin reads its own permissions but cannot access blocked APIs", async () => {
  const token = signAccessToken({ id: "demo-admin", role: "user" });
  const permissionsResponse = await request(
    "/api/admin/me/permissions",
    token
  );
  assert.equal(permissionsResponse.status, 200);
  const permissionsBody = (await permissionsResponse.json()) as {
    data: { permissions: string[] };
  };
  assert.ok(
    permissionsBody.data.permissions.includes(PERMISSIONS.DEMO_ADMIN_READ_ONLY)
  );

  for (const [path, method] of [
    ["/api/admin/applications/11111111-1111-4111-8111-111111111111/cv", "GET"],
    ["/api/admin/users/11111111-1111-4111-8111-111111111111/professional-profile/cv", "GET"],
    ["/api/admin/users/production-user/status", "PATCH"],
    ["/api/admin/unreviewed-endpoint", "GET"],
    ["/api/application/11111111-1111-4111-8111-111111111111/cv", "GET"],
  ] as const) {
    const response = await request(path, token, method);
    assert.equal(response.status, 404, `${method} ${path} should be hidden`);
  }
});

test("ordinary Admin requests retain route-level permission behavior", async () => {
  const token = signAccessToken({ id: "internal-admin", role: "user" });
  const response = await request("/api/admin/company-requests", token);
  assert.equal(response.status, 403);
});

test("Demo role suppresses broad permissions inherited from another assignment", async () => {
  const token = signAccessToken({ id: "demo-mixed-admin", role: "user" });
  const response = await request("/api/admin/me/permissions", token);
  assert.equal(response.status, 200);
  const body = (await response.json()) as {
    data: { permissions: string[] };
  };
  assert.ok(body.data.permissions.includes(PERMISSIONS.VIEW_COMPANIES));
  assert.ok(body.data.permissions.includes(PERMISSIONS.VIEW_USERS));
  assert.ok(!body.data.permissions.includes(PERMISSIONS.EDIT_COMPANIES));
  assert.ok(!body.data.permissions.includes(PERMISSIONS.SUSPEND_USERS));
  assert.equal(
    isDemoAdminRequestAllowed("GET", "/api/admin/company-requests"),
    true
  );
});

test("missing authentication remains rejected on Admin endpoints", async () => {
  const response = await request("/api/admin/me/permissions");
  assert.equal(response.status, 401);
});
