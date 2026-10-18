import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { PERMISSIONS } from "../authorization/permissions.js";
import { createApp } from "../index.js";
import { prisma } from "../config/db.js";
import { signAccessToken } from "../utils/tokens.js";

process.env.JWT_SECRET = "support-authorization-integration-secret";

type TestUser = {
  id: string;
  email: string;
  role: string;
  accountStatus: string;
  adminRoleAssignments?: Array<{
    adminRole: {
      permissions: Array<{ permission: { code: string } }>;
    };
  }>;
};

const permissionSets: Record<string, string[]> = {
  "operations-admin": [],
  "support-admin": [
    PERMISSIONS.VIEW_SUPPORT_TICKETS,
    PERMISSIONS.REPLY_SUPPORT_TICKETS,
    PERMISSIONS.ASSIGN_SUPPORT_TICKET,
    PERMISSIONS.REASSIGN_SUPPORT_TICKET,
  ],
  "super-admin": Object.values(PERMISSIONS),
  "target-admin": [PERMISSIONS.VIEW_SUPPORT_TICKETS],
};
const users = new Map<string, TestUser>();
const companies = new Map<
  string,
  { id: string; email: string; status: string; approvalStatus: string }
>();
const originals: Array<{
  target: object;
  property: string;
  descriptor?: PropertyDescriptor;
}> = [];
const calls = {
  ticketFind: 0,
  messageCreate: 0,
  ticketUpdate: 0,
  auditCreate: 0,
  notificationCreate: 0,
};

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

const makeUser = (id: string, role: string): TestUser => ({
  id,
  email: `${id}@example.test`,
  role,
  accountStatus: "ACTIVE",
  ...(role === "ADMIN"
    ? {
        adminRoleAssignments: [
          {
            adminRole: {
              permissions: (permissionSets[id] ?? []).map((code) => ({
                permission: { code },
              })),
            },
          },
        ],
      }
    : {}),
});

const ticketFor = (id: string) => {
  const creatorUserId =
    id === "own-user-ticket"
      ? "customer-user"
      : id === "other-user-ticket"
        ? "other-user"
        : id === "own-company-ticket"
          ? null
          : "customer-user";
  const creatorCompanyId =
    id === "own-company-ticket" ? "customer-company" : null;
  return {
    id,
    subject: "Support request",
    description: "Please help",
    status: "OPEN",
    priority: "MEDIUM",
    createdAt: new Date("2026-10-10T10:00:00.000Z"),
    updatedAt: new Date("2026-10-10T10:00:00.000Z"),
    creatorUserId,
    creatorCompanyId,
    assignedAdminId:
      id === "assigned-existing-ticket" ? "target-admin" : null,
    categoryId: null,
    category: null,
    creatorUser: creatorUserId
      ? {
          id: creatorUserId,
          firstName: "Test",
          lastName: "Customer",
          email: `${creatorUserId}@example.test`,
          role: "USER",
        }
      : null,
    creatorCompany: creatorCompanyId
      ? {
          id: creatorCompanyId,
          companyName: "Customer Company",
          email: "customer-company@example.test",
        }
      : null,
    assignedAdmin: null,
    messages: [],
  };
};

const app = createApp();
let server: ReturnType<typeof app.listen>;
let baseUrl: string;

before(async () => {
  users.clear();
  companies.clear();
  for (const id of Object.keys(permissionSets)) {
    users.set(id, makeUser(id, "ADMIN"));
  }
  users.set("customer-user", makeUser("customer-user", "USER"));
  users.set("other-user", makeUser("other-user", "USER"));
  companies.set("customer-company", {
    id: "customer-company",
    email: "customer-company@example.test",
    status: "ACTIVE",
    approvalStatus: "PENDING",
  });

  replace(
    prisma.user,
    "findUnique",
    async ({ where }: { where: { id?: string } }) =>
      where.id ? (users.get(where.id) ?? null) : null
  );
  replace(
    prisma.company,
    "findUnique",
    async ({ where }: { where: { id?: string } }) =>
      where.id ? (companies.get(where.id) ?? null) : null
  );
  replace(
    prisma.supportTicket,
    "findUnique",
    async ({ where }: { where: { id: string } }) => {
      calls.ticketFind += 1;
      if (where.id === "missing-ticket") return null;
      return ticketFor(where.id);
    }
  );
  replace(
    prisma.supportTicket,
    "update",
    async ({
      where,
      data,
    }: {
      where: { id: string };
      data: Record<string, unknown>;
    }) => {
      calls.ticketUpdate += 1;
      return { ...ticketFor(where.id), ...data };
    }
  );
  replace(
    prisma,
    "$transaction",
    async (callback: (transaction: unknown) => Promise<unknown>) =>
      callback({
        supportMessage: {
          create: async ({
            data,
          }: {
            data: Record<string, unknown>;
          }) => {
            calls.messageCreate += 1;
            return {
              id: "new-support-message",
              content: data.content,
              createdAt: new Date(),
              updatedAt: new Date(),
              authorUserId: data.authorUserId ?? null,
              authorCompanyId: data.authorCompanyId ?? null,
              authorUser: null,
              authorCompany: null,
            };
          },
        },
        supportTicket: {
          update: async () => {
            calls.ticketUpdate += 1;
            return {};
          },
        },
      })
  );
  replace(
    prisma.auditLog,
    "create",
    async () => {
      calls.auditCreate += 1;
      return { id: "audit-event" };
    }
  );
  replace(
    prisma.notification,
    "create",
    async ({ data }: { data: Record<string, unknown> }) => {
      calls.notificationCreate += 1;
      return { id: "notification", ...data };
    }
  );

  await new Promise<void>((resolve, reject) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string")
        return reject(new Error("Test server failed to bind"));
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
    server.once("error", reject);
  });
});

after(async () => {
  for (const { target, property, descriptor } of originals.reverse()) {
    if (descriptor) Object.defineProperty(target, property, descriptor);
    else Reflect.deleteProperty(target, property);
  }
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

const tokenFor = (id: string, role: "user" | "company" = "user") =>
  signAccessToken({ id, role });
const request = (
  path: string,
  token: string,
  method = "GET",
  body?: unknown
) =>
  fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      ...(body ? { "content-type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
const readBody = async (response: Response) =>
  response.json() as Promise<Record<string, unknown>>;
const permissionError = async (response: Response) => {
  const body = await readBody(response);
  return { status: response.status, error: body.error };
};

test("Operation Admin without ticket-view permission cannot enumerate ticket IDs", async () => {
  const beforeFinds = calls.ticketFind;
  const outcomes = [];
  for (const ticketId of ["existing-ticket", "missing-ticket"]) {
    outcomes.push(
      await permissionError(
        await request(
          `/api/support/tickets/${ticketId}`,
          tokenFor("operations-admin")
        )
      )
    );
  }
  assert.deepEqual(outcomes[0], outcomes[1]);
  assert.deepEqual(outcomes[0], {
    status: 403,
    error: {
      code: "FORBIDDEN",
      message: "You do not have permission to perform this action",
    },
  });
  assert.equal(calls.ticketFind, beforeFinds);
});

test("Admin without ticket-reply permission cannot enumerate ticket IDs or mutate tickets", async () => {
  const before = { ...calls };
  const outcomes = [];
  for (const ticketId of ["existing-ticket", "missing-ticket"]) {
    outcomes.push(
      await permissionError(
        await request(
          `/api/support/tickets/${ticketId}/messages`,
          tokenFor("operations-admin"),
          "POST",
          { content: "Unauthorized reply" }
        )
      )
    );
  }
  assert.deepEqual(outcomes[0], outcomes[1]);
  assert.equal(calls.ticketFind, before.ticketFind);
  assert.equal(calls.messageCreate, before.messageCreate);
  assert.equal(calls.ticketUpdate, before.ticketUpdate);
  assert.equal(calls.auditCreate, before.auditCreate);
});

test("Admin without assignment or reassignment permission cannot enumerate ticket IDs or mutate tickets", async () => {
  const before = { ...calls };
  const outcomes = [];
  for (const ticketId of ["existing-ticket", "missing-ticket"]) {
    outcomes.push(
      await permissionError(
        await request(
          `/api/support/admin/tickets/${ticketId}/assign`,
          tokenFor("operations-admin"),
          "PATCH",
          { assignedAdminId: "target-admin" }
        )
      )
    );
  }
  assert.deepEqual(outcomes[0], outcomes[1]);
  assert.equal(calls.ticketFind, before.ticketFind);
  assert.equal(calls.ticketUpdate, before.ticketUpdate);
  assert.equal(calls.auditCreate, before.auditCreate);
  assert.equal(calls.notificationCreate, before.notificationCreate);
});

test("Super Admin and Support Admin retain authorized detail, reply, and assignment operations", async () => {
  const detail = await request(
    "/api/support/tickets/existing-ticket",
    tokenFor("super-admin")
  );
  assert.equal(detail.status, 200);

  const reply = await request(
    "/api/support/tickets/assigned-existing-ticket/messages",
    tokenFor("support-admin"),
    "POST",
    { content: "Authorized support reply" }
  );
  assert.equal(reply.status, 201);

  const assignment = await request(
    "/api/support/admin/tickets/existing-ticket/assign",
    tokenFor("support-admin"),
    "PATCH",
    { assignedAdminId: "target-admin" }
  );
  assert.equal(assignment.status, 200);
  assert.equal(calls.messageCreate, 1);
  assert.equal(calls.ticketUpdate, 2);
  assert.equal(calls.auditCreate, 1);
});

test("Users and Companies can access and reply to their own tickets only", async () => {
  const userToken = tokenFor("customer-user");
  const companyToken = tokenFor("customer-company", "company");

  for (const [token, ticketId] of [
    [userToken, "own-user-ticket"],
    [companyToken, "own-company-ticket"],
  ]) {
    assert.equal(
      (await request(`/api/support/tickets/${ticketId}`, token)).status,
      200
    );
    assert.equal(
      (
        await request(
          `/api/support/tickets/${ticketId}/messages`,
          token,
          "POST",
          { content: "Customer follow-up" }
        )
      ).status,
      201
    );
  }

  const before = { ...calls };
  const denied = [
    await request(
      "/api/support/tickets/own-company-ticket",
      userToken
    ),
    await request(
      "/api/support/tickets/own-user-ticket",
      companyToken
    ),
    await request(
      "/api/support/tickets/other-user-ticket/messages",
      userToken,
      "POST",
      { content: "Cross-account reply" }
    ),
    await request(
      "/api/support/tickets/own-user-ticket/messages",
      companyToken,
      "POST",
      { content: "Cross-account reply" }
    ),
  ];
  assert.deepEqual(
    denied.map((response) => response.status),
    [403, 403, 403, 403]
  );
  assert.equal(calls.messageCreate, before.messageCreate);
  assert.equal(calls.ticketUpdate, before.ticketUpdate);
  assert.equal(calls.auditCreate, before.auditCreate);
});
