import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import jwt from "jsonwebtoken";
import { createApp } from "../index.js";
import { prisma } from "../config/db.js";
import { signAccessToken, signSupportOnlyToken } from "../utils/tokens.js";

process.env.JWT_SECRET = "support-only-integration-secret";
process.env.JWT_REFRESH_SECRET = "support-only-refresh-secret";

const users = new Map<string, Record<string, unknown>>();
const companies = new Map<string, Record<string, unknown>>();
const ticketQueries: Array<Record<string, unknown>> = [];
const categoryQueries: Array<Record<string, unknown>> = [];
const createdTickets: Array<Record<string, unknown>> = [];
const createdMessages: Array<Record<string, unknown>> = [];
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

const ownedTicket = (
  id: string,
  userId = "deactivated-user",
  companyId: string | null = null
) => ({
  id,
  subject: "Help with my account",
  description: "I need help accessing my account",
  status: "OPEN",
  priority: "MEDIUM",
  createdAt: new Date("2026-10-10T10:00:00.000Z"),
  updatedAt: new Date("2026-10-10T10:00:00.000Z"),
  creatorUserId: companyId ? null : userId,
  creatorCompanyId: companyId,
  assignedAdminId: null,
  categoryId: "category-1",
  category: {
    id: "category-1",
    name: "Account access",
    audience: companyId ? "COMPANY" : "USER",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  creatorUser: companyId
    ? null
    : {
        id: userId,
        firstName: "Deactivated",
        lastName: "User",
        email: "user@example.test",
        role: "USER",
      },
  creatorCompany: companyId
    ? {
        id: companyId,
        companyName: "Deactivated Co",
        email: "company@example.test",
      }
    : null,
  assignedAdmin: null,
  messages: [
    {
      id: "admin-message",
      content: "We have received your request.",
      createdAt: new Date("2026-10-10T11:00:00.000Z"),
      updatedAt: new Date("2026-10-10T11:00:00.000Z"),
      authorUserId: "support-admin",
      authorCompanyId: null,
      authorUser: {
        id: "support-admin",
        firstName: "Support",
        lastName: "Admin",
        email: "admin@example.test",
        role: "ADMIN",
      },
      authorCompany: null,
    },
  ],
});

const app = createApp();
let server: ReturnType<typeof app.listen>;
let baseUrl: string;

before(async () => {
  users.clear();
  companies.clear();
  ticketQueries.length = 0;
  categoryQueries.length = 0;
  createdTickets.length = 0;
  createdMessages.length = 0;
  users.set("deactivated-user@example.test", {
    id: "deactivated-user",
    email: "deactivated-user@example.test",
    password: "",
    role: "USER",
    accountStatus: "DEACTIVATED",
    firstName: "Deactivated",
    lastName: "User",
    profilePicUrl: null,
  });
  users.set("active-user@example.test", {
    id: "active-user",
    email: "active-user@example.test",
    password: "",
    role: "USER",
    accountStatus: "ACTIVE",
    firstName: "Active",
    lastName: "User",
    profilePicUrl: null,
  });
  users.set("admin@example.test", {
    id: "deactivated-admin",
    email: "admin@example.test",
    password: "",
    role: "ADMIN",
    accountStatus: "DEACTIVATED",
    firstName: "Admin",
    lastName: "Account",
    profilePicUrl: null,
  });
  companies.set("deactivated-company@example.test", {
    id: "deactivated-company",
    email: "deactivated-company@example.test",
    password: "",
    companyName: "Deactivated Co",
    slug: "deactivated-co",
    description: null,
    phone: "1234567890",
    website: null,
    location: null,
    logoUrl: null,
    status: "DEACTIVATED",
    approvalStatus: "APPROVED",
    rejectionReason: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  companies.set("active-company@example.test", {
    id: "active-company",
    email: "active-company@example.test",
    password: "",
    companyName: "Active Co",
    slug: "active-co",
    description: null,
    phone: "1234567890",
    website: null,
    location: null,
    logoUrl: null,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    rejectionReason: null,
    reviewedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const { hashPassword } = await import("../services/auth.service.js");
  for (const user of users.values())
    user.password = hashPassword("valid-password");
  for (const company of companies.values())
    company.password = hashPassword("valid-password");

  replace(
    prisma.user,
    "findUnique",
    async ({ where }: { where: { email?: string; id?: string } }) =>
      where.email
        ? (users.get(where.email) ?? null)
        : ([...users.values()].find((user) => user.id === where.id) ?? null)
  );
  replace(prisma.user, "findMany", async () => []);
  replace(
    prisma.company,
    "findUnique",
    async ({ where }: { where: { email?: string; id?: string } }) =>
      where.email
        ? (companies.get(where.email) ?? null)
        : ([...companies.values()].find((company) => company.id === where.id) ??
          null)
  );
  replace(
    prisma.supportCategory,
    "findMany",
    async (args: { where: Record<string, unknown> }) => {
      categoryQueries.push(args.where);
      return [
        {
          id: "category-1",
          name: "Account access",
          audience: args.where.audience,
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    }
  );
  replace(
    prisma.supportCategory,
    "findUnique",
    async ({ where }: { where: { id: string } }) => ({
      id: where.id,
      audience: where.id === "company-category" ? "COMPANY" : "USER",
    })
  );
  replace(
    prisma.supportTicket,
    "findMany",
    async (args: Record<string, unknown>) => {
      ticketQueries.push(args.where as Record<string, unknown>);
      return [];
    }
  );
  replace(prisma.supportTicket, "count", async () => 0);
  replace(
    prisma.supportTicket,
    "create",
    async ({ data }: { data: Record<string, unknown> }) => {
      createdTickets.push(data);
      return ownedTicket(
        "created-ticket",
        String(data.creatorUserId ?? ""),
        data.creatorCompanyId as string | null
      );
    }
  );
  replace(
    prisma.supportTicket,
    "findUnique",
    async ({ where }: { where: { id: string } }) => {
      if (where.id === "other-ticket")
        return ownedTicket("other-ticket", "different-user");
      if (where.id === "company-ticket")
        return ownedTicket("company-ticket", "", "deactivated-company");
      return ownedTicket(where.id);
    }
  );
  replace(
    prisma.supportMessage,
    "create",
    async ({ data }: { data: Record<string, unknown> }) => {
      createdMessages.push(data);
      return {
        id: "new-message",
        content: data.content,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorUserId: data.authorUserId ?? null,
        authorCompanyId: data.authorCompanyId ?? null,
        authorUser: null,
        authorCompany: null,
      };
    }
  );
  replace(
    prisma,
    "$transaction",
    async (callback: (transaction: unknown) => Promise<unknown>) =>
      callback({
        supportMessage: {
          create: async ({ data }: { data: Record<string, unknown> }) => {
            createdMessages.push(data);
            return {
              id: "new-message",
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
        supportTicket: { update: async () => ({}) },
      })
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

const postJson = async (
  path: string,
  body: unknown,
  headers: Record<string, string> = {}
) =>
  fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
const getJson = async (path: string, headers: Record<string, string> = {}) =>
  fetch(`${baseUrl}${path}`, { headers });
const credential = (
  role: "user" | "company",
  email: string,
  password = "valid-password"
) => ({ role, email, password });
const readBody = async (response: Response) =>
  response.json() as Promise<Record<string, any>>;
const accessCookie = (response: Response) =>
  response.headers.get("set-cookie")?.match(/supportAccessToken=([^;]+)/)?.[1];

test("valid deactivated User credentials issue only a scoped support cookie and own-ticket access", async () => {
  const verified = await postJson(
    "/api/auth/support-access",
    credential("user", "deactivated-user@example.test")
  );
  assert.equal(verified.status, 200);
  const body = await readBody(verified);
  assert.equal(body.data.mode, "support_only");
  assert.equal("token" in body.data, false);
  assert.equal("refreshToken" in body.data, false);
  const cookie = accessCookie(verified);
  assert.ok(cookie);
  assert.match(verified.headers.get("set-cookie") ?? "", /HttpOnly/i);
  assert.match(
    verified.headers.get("set-cookie") ?? "",
    /Path=\/api\/support-only/i
  );

  const session = await getJson("/api/support-only/session", {
    cookie: `supportAccessToken=${cookie}`,
  });
  assert.equal(session.status, 200);
  assert.equal((await readBody(session)).data.accountType, "user");

  const list = await getJson("/api/support-only/tickets", {
    cookie: `supportAccessToken=${cookie}`,
  });
  assert.equal(list.status, 200);
  assert.equal(ticketQueries.at(-1)?.creatorUserId, "deactivated-user");

  const categories = await getJson(
    "/api/support-only/categories?audience=COMPANY",
    { cookie: `supportAccessToken=${cookie}` }
  );
  assert.equal(categories.status, 200);
  assert.equal(categoryQueries.at(-1)?.audience, "USER");

  const forbiddenTicket = await getJson(
    "/api/support-only/tickets/other-ticket",
    { cookie: `supportAccessToken=${cookie}` }
  );
  assert.equal(forbiddenTicket.status, 403);

  const created = await postJson(
    "/api/support-only/tickets",
    {
      subject: "Need access help",
      description: "I cannot sign in",
      categoryId: "category-1",
    },
    { cookie: `supportAccessToken=${cookie}` }
  );
  assert.equal(created.status, 201);
  assert.equal(createdTickets.at(-1)?.creatorUserId, "deactivated-user");
  assert.equal(createdTickets.at(-1)?.creatorCompanyId, undefined);

  const ownTicket = await getJson("/api/support-only/tickets/own-ticket", {
    cookie: `supportAccessToken=${cookie}`,
  });
  assert.equal(ownTicket.status, 200);
  assert.equal(
    (await readBody(ownTicket)).data.messages[0].authorUser.role,
    "ADMIN"
  );

  const reply = await postJson(
    "/api/support-only/tickets/own-ticket/messages",
    { content: "Thank you" },
    { cookie: `supportAccessToken=${cookie}` }
  );
  assert.equal(reply.status, 201);
  assert.equal(createdMessages.at(-1)?.authorUserId, "deactivated-user");
});

test("valid deactivated Company credentials receive company-scoped Support access only", async () => {
  const verified = await postJson(
    "/api/auth/support-access",
    credential("company", "deactivated-company@example.test")
  );
  assert.equal(verified.status, 200);
  const cookie = accessCookie(verified);
  assert.ok(cookie);
  const session = await getJson("/api/support-only/session", {
    cookie: `supportAccessToken=${cookie}`,
  });
  assert.equal((await readBody(session)).data.accountType, "company");
  const list = await getJson("/api/support-only/tickets", {
    cookie: `supportAccessToken=${cookie}`,
  });
  assert.equal(list.status, 200);
  assert.equal(ticketQueries.at(-1)?.creatorCompanyId, "deactivated-company");
  const categories = await getJson(
    "/api/support-only/categories?audience=USER",
    { cookie: `supportAccessToken=${cookie}` }
  );
  assert.equal(categories.status, 200);
  assert.equal(categoryQueries.at(-1)?.audience, "COMPANY");
  const otherUserTicket = await getJson(
    "/api/support-only/tickets/own-ticket",
    { cookie: `supportAccessToken=${cookie}` }
  );
  assert.equal(otherUserTicket.status, 403);
  const ownTicket = await getJson("/api/support-only/tickets/company-ticket", {
    cookie: `supportAccessToken=${cookie}`,
  });
  assert.equal(ownTicket.status, 200);
  const created = await postJson(
    "/api/support-only/tickets",
    {
      subject: "Company access help",
      description: "We need help with the account",
      categoryId: "company-category",
    },
    { cookie: `supportAccessToken=${cookie}` }
  );
  assert.equal(created.status, 201);
  assert.equal(createdTickets.at(-1)?.creatorCompanyId, "deactivated-company");
  assert.equal(createdTickets.at(-1)?.creatorUserId, undefined);
});

test("wrong credentials create no restricted session; active credentials go to normal login", async () => {
  const invalid = await postJson(
    "/api/auth/support-access",
    credential("user", "deactivated-user@example.test", "wrong-password")
  );
  assert.equal(invalid.status, 401);
  assert.equal(accessCookie(invalid), undefined);

  const active = await postJson(
    "/api/auth/support-access",
    credential("user", "active-user@example.test")
  );
  assert.equal(active.status, 200);
  assert.equal((await readBody(active)).data.mode, "active");
  assert.equal(accessCookie(active), undefined);

  const normalLogin = await postJson(
    "/api/auth/login",
    credential("user", "active-user@example.test")
  );
  assert.equal(normalLogin.status, 200);
  assert.equal(typeof (await readBody(normalLogin)).data.token, "string");
});

test("support-only token is rejected by normal, Admin, authenticated Support, and refresh boundaries", async () => {
  const token = signSupportOnlyToken("deactivated-user", "user");
  for (const path of [
    "/api/user/profile",
    "/api/company/profile",
    "/api/jobs/",
    "/api/application/me",
    "/api/admin/dashboard",
    "/api/support/admin/dashboard",
    "/api/support/tickets",
  ]) {
    const response = await getJson(path, { authorization: `Bearer ${token}` });
    assert.equal(response.status, 401, path);
  }
  const refresh = await postJson(
    "/api/auth/refresh",
    {},
    { cookie: `refreshToken=${token}` }
  );
  assert.equal(refresh.status, 401);
  const scopedOnlyWithAuthorization = await getJson(
    "/api/support-only/session",
    { authorization: `Bearer ${token}` }
  );
  assert.equal(scopedOnlyWithAuthorization.status, 401);

  const normalUserToken = signAccessToken({
    id: "active-user",
    email: "active-user@example.test",
    role: "user",
  });
  const normalUserSupport = await getJson("/api/support/tickets", {
    authorization: `Bearer ${normalUserToken}`,
  });
  assert.equal(normalUserSupport.status, 200);

  const normalCompanyToken = signAccessToken({
    id: "active-company",
    email: "active-company@example.test",
    role: "company",
  });
  const normalCompanySupport = await getJson("/api/support/tickets", {
    authorization: `Bearer ${normalCompanyToken}`,
  });
  assert.equal(normalCompanySupport.status, 200);
});

test("expired or reactivated-account restricted credentials are rejected", async () => {
  const expired = jwt.sign(
    { sub: "deactivated-user", accountType: "user", scope: "support_only" },
    process.env.JWT_SECRET!,
    { audience: "srb-support-only", issuer: "srb-api", expiresIn: -1 }
  );
  const expiredResponse = await getJson("/api/support-only/session", {
    cookie: `supportAccessToken=${expired}`,
  });
  assert.equal(expiredResponse.status, 401);

  const user = users.get("deactivated-user@example.test")!;
  user.accountStatus = "ACTIVE";
  const token = signSupportOnlyToken("deactivated-user", "user");
  const reactivatedResponse = await getJson("/api/support-only/session", {
    cookie: `supportAccessToken=${token}`,
  });
  assert.equal(reactivatedResponse.status, 401);
  user.accountStatus = "DEACTIVATED";
});

test("Admin identities cannot obtain support-only access", async () => {
  const response = await postJson(
    "/api/auth/support-access",
    credential("user", "admin@example.test")
  );
  assert.equal(response.status, 403);
  assert.equal(accessCookie(response), undefined);
});
