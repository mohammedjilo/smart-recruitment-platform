import assert from "node:assert/strict";
import test, { afterEach, beforeEach } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { prisma } = require("../config/db.ts");
const { withdrawApplication } = require("./application.service.ts");

const originalFindFirst = prisma.application.findFirst;
const originalDelete = prisma.application.delete;
const originalTransaction = prisma.$transaction;

let application;
let notifications;
let deleteCalls;

const createApplication = (status, userId = "owner-1") => ({
  id: "application-1",
  userId,
  jobId: "job-1",
  status,
  matchScore: 80,
  recommendation: null,
  strengths: [],
  missingSkills: [],
  resumeType: "PROFILE",
  cvId: null,
  cvUrl: null,
  profileSnapshot: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  user: { firstName: "Casey", lastName: "Candidate" },
  job: { id: "job-1", title: "Engineer", companyId: "company-1" },
});

beforeEach(() => {
  application = createApplication("PENDING");
  notifications = [];
  deleteCalls = 0;

  prisma.application.findFirst = async ({ where }) => {
    if (where.id !== application.id || where.userId !== application.userId) {
      return null;
    }
    return { ...application };
  };
  prisma.application.delete = async () => {
    deleteCalls += 1;
    throw new Error("Withdrawal must not delete the application");
  };
  prisma.$transaction = async (callback) =>
    callback({
      application: {
        updateMany: async ({ where, data }) => {
          if (
            where.id !== application.id ||
            where.userId !== application.userId ||
            where.status !== application.status
          ) {
            return { count: 0 };
          }
          application = { ...application, status: data.status };
          return { count: 1 };
        },
        findFirst: async () => ({ ...application }),
      },
      notification: {
        create: async ({ data }) => {
          notifications.push(data);
          return data;
        },
      },
    });
});

afterEach(() => {
  prisma.application.findFirst = originalFindFirst;
  prisma.application.delete = originalDelete;
  prisma.$transaction = originalTransaction;
});

test("withdrawal is owner-scoped and rejected applications stay unchanged", async () => {
  await assert.rejects(withdrawApplication("another-user", "application-1"), {
    statusCode: 404,
  });

  application = createApplication("REJECTED");
  await assert.rejects(withdrawApplication("owner-1", "application-1"), {
    statusCode: 409,
  });

  assert.equal(application.status, "REJECTED");
  assert.equal(notifications.length, 0);
  assert.equal(deleteCalls, 0);
});

test("ordinary withdrawal updates the existing application without notifying the company", async () => {
  const result = await withdrawApplication("owner-1", "application-1");

  assert.equal(result.status, "WITHDRAWN");
  assert.equal(application.status, "WITHDRAWN");
  assert.equal(notifications.length, 0);
  assert.equal(deleteCalls, 0);
});

test("accepted withdrawal atomically creates one application notification for its company", async () => {
  application = createApplication("ACCEPTED");

  const results = await Promise.allSettled([
    withdrawApplication("owner-1", "application-1"),
    withdrawApplication("owner-1", "application-1"),
  ]);

  assert.equal(results.filter(({ status }) => status === "fulfilled").length, 1);
  assert.equal(application.status, "WITHDRAWN");
  assert.deepEqual(notifications, [
    {
      companyId: "company-1",
      jobId: "job-1",
      applicationId: "application-1",
      message: "Casey Candidate withdrew their accepted application for Engineer.",
      type: "APPLICATION",
    },
  ]);
  assert.equal(deleteCalls, 0);
});
