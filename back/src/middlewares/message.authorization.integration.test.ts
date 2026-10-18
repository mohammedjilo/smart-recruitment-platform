import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../index.js";
import { prisma } from "../config/db.js";
import { signAccessToken } from "../utils/tokens.js";

process.env.JWT_SECRET = "message-authorization-integration-secret";

const applicationId = "11111111-1111-4111-8111-111111111111";
const companies = new Map<
  string,
  { id: string; email: string; status: string; approvalStatus: string }
>();
const users = new Map<
  string,
  { id: string; email: string; role: string; accountStatus: string }
>();
const originals: Array<{
  target: object;
  property: string;
  descriptor?: PropertyDescriptor;
}> = [];
const dataCalls = {
  applicationFind: 0,
  conversationFind: 0,
  conversationList: 0,
  conversationUpsert: 0,
  messageCreate: 0,
  messageList: 0,
  messageReadUpdate: 0,
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

const app = createApp();
let server: ReturnType<typeof app.listen>;
let baseUrl: string;

before(async () => {
  companies.clear();
  users.clear();
  for (const status of ["PENDING", "REJECTED", "APPROVED"]) {
    const id = `${status.toLowerCase()}-company`;
    companies.set(id, {
      id,
      email: `${id}@example.test`,
      status: "ACTIVE",
      approvalStatus: status,
    });
  }
  companies.set("other-company", {
    id: "other-company",
    email: "other-company@example.test",
    status: "ACTIVE",
    approvalStatus: "APPROVED",
  });
  users.set("candidate", {
    id: "candidate",
    email: "candidate@example.test",
    role: "USER",
    accountStatus: "ACTIVE",
  });

  replace(
    prisma.company,
    "findUnique",
    async ({ where }: { where: { id?: string } }) =>
      where.id ? (companies.get(where.id) ?? null) : null
  );
  replace(
    prisma.user,
    "findUnique",
    async ({ where }: { where: { id?: string } }) =>
      where.id ? (users.get(where.id) ?? null) : null
  );
  replace(prisma.application, "findUnique", async () => {
    dataCalls.applicationFind += 1;
    return {
      id: applicationId,
      userId: "candidate",
      job: {
        id: "job-1",
        companyId: "approved-company",
        title: "Engineer",
      },
    };
  });
  replace(prisma.conversation, "upsert", async () => {
    dataCalls.conversationUpsert += 1;
    return {
      id: "conversation-one",
      userId: "candidate",
      companyId: "approved-company",
      applicationId,
      user: { id: "candidate", firstName: "Casey", lastName: "Candidate" },
      company: { id: "approved-company", companyName: "Approved Co" },
      messages: [],
    };
  });
  replace(
    prisma.conversation,
    "findUnique",
    async ({ where }: { where: { id: string } }) => {
      dataCalls.conversationFind += 1;
      if (where.id === "conversation-missing") return null;
      return {
        id: where.id,
        userId: "candidate",
        companyId:
          where.id === "conversation-other-company"
            ? "other-company"
            : "approved-company",
      };
    }
  );
  replace(prisma.conversation, "findMany", async () => {
    dataCalls.conversationList += 1;
    return [
      {
        id: "conversation-one",
        userId: "candidate",
        companyId: "approved-company",
        applicationId,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: "candidate",
          firstName: "Casey",
          lastName: "Candidate",
          profilePicUrl: null,
        },
        company: { id: "approved-company", companyName: "Approved Co" },
        application: {
          id: applicationId,
          job: { id: "job-1", title: "Engineer" },
        },
        messages: [],
      },
    ];
  });
  replace(prisma.conversation, "count", async () => 1);
  replace(
    prisma.message,
    "create",
    async ({
      data,
    }: {
      data: { content: string; senderUserId: string; senderCompanyId: string };
    }) => {
      dataCalls.messageCreate += 1;
      return {
        id: "message-one",
        content: data.content,
        isRead: false,
        readByUser: false,
        readByCompany: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversationId: "conversation-one",
        senderUserId: data.senderUserId,
        senderCompanyId: data.senderCompanyId,
        senderUser: null,
        senderCompany: null,
      };
    }
  );
  replace(prisma.message, "findMany", async () => {
    dataCalls.messageList += 1;
    return [];
  });
  replace(prisma.message, "findFirst", async () => null);
  replace(prisma.message, "updateMany", async () => {
    dataCalls.messageReadUpdate += 1;
    return { count: 1 };
  });
  replace(
    prisma.notification,
    "create",
    async ({
      data,
    }: {
      data: { message: string; type: string; conversationId: string };
    }) => ({
      id: "notification-one",
      message: data.message,
      type: data.type,
      isRead: false,
      createdAt: new Date(),
      jobId: null,
      applicationId: null,
      supportTicketId: null,
      conversationId: data.conversationId,
      job: null,
    })
  );
  replace(
    prisma.supportTicket,
    "findUnique",
    async ({ where }: { where: { id: string } }) => {
      const companyId = where.id.includes("rejected")
        ? "rejected-company"
        : "pending-company";
      return {
        id: where.id,
        subject: "Company support",
        description: "Need help",
        status: "OPEN",
        priority: "MEDIUM",
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorUserId: null,
        creatorCompanyId: companyId,
        assignedAdminId: null,
        categoryId: null,
        category: null,
        creatorUser: null,
        creatorCompany: {
          id: companyId,
          companyName: `${companyId} Co`,
          email: `${companyId}@example.test`,
        },
        assignedAdmin: null,
        messages: [],
      };
    }
  );
  replace(
    prisma.supportTicket,
    "findMany",
    async ({ where }: { where: { creatorCompanyId: string } }) => {
      assert.ok(
        ["pending-company", "rejected-company"].includes(where.creatorCompanyId)
      );
      return [];
    }
  );
  replace(prisma.supportTicket, "count", async () => 0);

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

const tokenForCompany = (id: string) =>
  signAccessToken({ id, role: "company" });
const tokenForUser = (id: string) => signAccessToken({ id, role: "user" });
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
const beforeCalls = () => ({ ...dataCalls });

test("pending and rejected Companies cannot access any Company–candidate messaging operation", async () => {
  const paths = [
    ["/api/message/application/" + applicationId, "POST", { content: "Hello" }],
    ["/api/message", "POST", { applicationId, content: "Hello" }],
    ["/api/message/", "GET"],
    ["/api/message/company", "GET"],
    ["/api/message/conversation/conversation-one", "GET"],
    ["/api/message/conversation/conversation-one/read", "PATCH"],
  ] as const;

  for (const status of ["pending", "rejected"]) {
    const token = tokenForCompany(`${status}-company`);
    for (const [path, method, body] of paths) {
      const response = await request(path, token, method, body);
      assert.equal(response.status, 403, `${status} ${method} ${path}`);
      const result = await readBody(response);
      assert.equal(result.success, false);
    }
  }

  assert.deepEqual(dataCalls, {
    applicationFind: 0,
    conversationFind: 0,
    conversationList: 0,
    conversationUpsert: 0,
    messageCreate: 0,
    messageList: 0,
    messageReadUpdate: 0,
  });
});

test("approved Company messaging and User candidate messaging remain available", async () => {
  const companyToken = tokenForCompany("approved-company");
  for (const [path, method, body] of [
    ["/api/message/application/" + applicationId, "POST", { content: "Hello" }],
    ["/api/message", "POST", { applicationId, content: "Hello" }],
    ["/api/message/", "GET"],
    ["/api/message/company", "GET"],
    ["/api/message/conversation/conversation-one", "GET"],
    ["/api/message/conversation/conversation-one/read", "PATCH"],
  ] as const) {
    const response = await request(path, companyToken, method, body);
    assert.ok(response.status < 400, `${method} ${path}: ${response.status}`);
  }

  const userToken = tokenForUser("candidate");
  for (const [path, method, body] of [
    ["/api/message/application/" + applicationId, "POST", { content: "Reply" }],
    ["/api/message", "POST", { applicationId, content: "Reply" }],
    ["/api/message/", "GET"],
    ["/api/message/conversation/conversation-one", "GET"],
    ["/api/message/conversation/conversation-one/read", "PATCH"],
  ] as const) {
    const response = await request(path, userToken, method, body);
    assert.ok(response.status < 400, `${method} ${path}: ${response.status}`);
  }

  assert.ok(dataCalls.applicationFind >= 4);
  assert.ok(dataCalls.conversationList >= 3);
  assert.ok(dataCalls.messageCreate >= 4);
  assert.ok(dataCalls.messageReadUpdate >= 2);
});

test("Company application ownership and conversation participation checks remain enforced", async () => {
  const token = tokenForCompany("other-company");
  const applicationResponse = await request(
    `/api/message/application/${applicationId}`,
    token,
    "POST",
    { content: "Cross-company attempt" }
  );
  assert.equal(applicationResponse.status, 403);
  assert.equal(
    (await readBody(applicationResponse)).success,
    false
  );

  const before = beforeCalls();
  const conversationResponse = await request(
    "/api/message/conversation/conversation-other-company",
    tokenForCompany("approved-company")
  );
  assert.equal(conversationResponse.status, 403);
  assert.equal(dataCalls.messageList, before.messageList);
});

test("Company approval does not gate the Company's own Support ticket", async () => {
  for (const id of ["pending-company", "rejected-company"]) {
    const list = await request(
      "/api/support/tickets",
      tokenForCompany(id)
    );
    assert.equal(list.status, 200);
    assert.equal((await readBody(list)).success, true);

    const response = await request(
      `/api/support/tickets/company-ticket-${id}`,
      tokenForCompany(id)
    );
    assert.equal(response.status, 200);
    assert.equal((await readBody(response)).success, true);
  }
});
