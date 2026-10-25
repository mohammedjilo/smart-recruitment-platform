import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createApp } from "../index.js";
import { prisma } from "../config/db.js";
import { signAccessToken } from "../utils/tokens.js";

const jobId = "11111111-1111-4111-8111-111111111111";
const originalJwtSecret = process.env.JWT_SECRET;
const originalUserFindUnique = Object.getOwnPropertyDescriptor(
  prisma.user,
  "findUnique",
);
const originalJobFindUnique = Object.getOwnPropertyDescriptor(
  prisma.job,
  "findUnique",
);
const originalApplicationFindFirst = Object.getOwnPropertyDescriptor(
  prisma.application,
  "findFirst",
);
let server: ReturnType<ReturnType<typeof createApp>["listen"]>;
let baseUrl: string;

before(async () => {
  process.env.JWT_SECRET = "closed-job-application-api-test-secret";
  Object.defineProperty(prisma.user, "findUnique", {
    configurable: true,
    writable: true,
    value: async () => ({
      id: "candidate-1",
      role: "USER",
      accountStatus: "ACTIVE",
      firstName: "Test",
      lastName: "Candidate",
      email: "candidate@example.com",
      phone: "123456789",
      skills: [],
      profile: null,
      languages: [],
    }),
  });
  Object.defineProperty(prisma.job, "findUnique", {
    configurable: true,
    writable: true,
    value: async () => ({
      id: jobId,
      companyId: "company-1",
      title: "Closed job",
      description: "A closed job",
      status: "CLOSED",
      deadline: new Date("2099-12-31T00:00:00.000Z"),
      skills: [],
      applicationQuestions: [],
    }),
  });
  Object.defineProperty(prisma.application, "findFirst", {
    configurable: true,
    writable: true,
    value: async () => null,
  });

  await new Promise<void>((resolve, reject) => {
    server = createApp().listen(0, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Test server did not bind to a TCP port"));
        return;
      }
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
    server.once("error", reject);
  });
});

after(async () => {
  restoreProperty(prisma.user, "findUnique", originalUserFindUnique);
  restoreProperty(prisma.job, "findUnique", originalJobFindUnique);
  restoreProperty(
    prisma.application,
    "findFirst",
    originalApplicationFindFirst,
  );
  if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalJwtSecret;

  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

const restoreProperty = (
  target: object,
  property: string,
  descriptor: PropertyDescriptor | undefined,
) => {
  if (descriptor) Object.defineProperty(target, property, descriptor);
  else Reflect.deleteProperty(target, property);
};

test("application API rejects a submission for a CLOSED job", async () => {
  const token = signAccessToken({ id: "candidate-1", role: "user" });
  const response = await fetch(`${baseUrl}/api/application/${jobId}`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fullName: "Test Candidate",
      email: "candidate@example.com",
      phone: "123456789",
      country: "United States",
      age: "30",
      jobTitle: "Engineer",
      useProfessionalProfile: true,
      answers: [],
    }),
  });
  const body = (await response.json()) as {
    success: boolean;
    error?: { code?: string };
  };

  assert.equal(response.status, 409, JSON.stringify(body));
  assert.equal(body.success, false);
  assert.equal(body.error?.code, "JOB_NOT_OPEN");
});
