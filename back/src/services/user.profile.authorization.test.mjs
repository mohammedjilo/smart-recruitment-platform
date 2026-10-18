import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { prisma } = require("../config/db.ts");
const { getCompleteUserProfile } = require("./user.service.ts");

const originalFindUnique = prisma.user.findUnique;

afterEach(() => {
  prisma.user.findUnique = originalFindUnique;
});

test("a user cannot read another user's profile", async () => {
  let lookupCount = 0;
  prisma.user.findUnique = async () => {
    lookupCount += 1;
    return null;
  };

  await assert.rejects(
    getCompleteUserProfile("target-user", {
      id: "requesting-user",
      type: "user",
    }),
    { statusCode: 404 }
  );
  assert.equal(lookupCount, 0);
});

test("a company without approval cannot read a candidate profile", async () => {
  let lookupCount = 0;
  prisma.user.findUnique = async () => {
    lookupCount += 1;
    return null;
  };

  await assert.rejects(
    getCompleteUserProfile("target-user", {
      id: "pending-company",
      type: "company",
      approvalStatus: "PENDING",
    }),
    { statusCode: 403 }
  );
  assert.equal(lookupCount, 0);
});

test("an approved company can read a non-admin candidate profile", async () => {
  prisma.user.findUnique = async () => ({
    id: "target-user",
    firstName: "Taylor",
    lastName: "Candidate",
    email: "candidate@example.test",
    phone: null,
    country: null,
    birthdate: null,
    profilePicId: null,
    profilePicUrl: null,
    role: "USER",
    accountStatus: "ACTIVE",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    profile: null,
    skills: [],
    languages: [],
    _count: {
      applications: 0,
      savedJobs: 0,
      messagesSent: 0,
      messagesReceived: 0,
      skills: 0,
    },
  });

  const profile = await getCompleteUserProfile("target-user", {
    id: "approved-company",
    type: "company",
    approvalStatus: "APPROVED",
  });

  assert.equal(profile.id, "target-user");
  assert.equal(profile.email, "candidate@example.test");
});
