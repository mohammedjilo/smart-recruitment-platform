import assert from "node:assert/strict";
import test from "node:test";
import { Prisma } from "@prisma/client";
import db from "../config/db.js";
import { hashPassword, loginAccount, registerAccount } from "./auth.service.ts";

const { prisma } = db;

const stubMethod = (t, target, name, implementation) => {
  const original = target[name];
  const calls = [];
  target[name] = async (...args) => {
    calls.push(args);
    return implementation(...args);
  };
  t.after(() => {
    target[name] = original;
  });
  return { calls };
};

const registrationInput = {
  role: "company",
  companyName: "Acme",
  slug: "acme",
  email: "company@example.test",
  password: "correct-password",
  phone: "1234567890",
  description: "Recruiting company",
  website: "https://acme.example.test",
  country: "United States",
  countryCode: "US",
  state: "California",
  stateCode: "CA",
  city: "Los Angeles",
  cityGeonameId: 5368361,
  location: "Los Angeles, California, United States",
};

const userRegistrationInput = {
  role: "user",
  firstName: "Alex",
  lastName: "Morgan",
  email: "user@example.test",
  password: "correct-password",
  phone: "1234567890",
  country: "United States",
  countryCode: "US",
  state: "California",
  stateCode: "CA",
  city: "Los Angeles",
  cityGeonameId: 5368361,
  birthdate: "1995-01-01",
};

test("user registration validates and persists canonical location names and codes", async (t) => {
  stubMethod(t, prisma.user, "findUnique", async () => null);
  const createUser = { calls: [] };
  const createProfile = { calls: [] };
  stubMethod(t, prisma, "$transaction", async (callback) =>
    callback({
      user: {
        create: async (args) => {
          createUser.calls.push(args);
          return { id: "user-1" };
        },
      },
      professionalProfile: {
        create: async (args) => {
          createProfile.calls.push(args);
        },
      },
    }),
  );

  const result = await registerAccount(userRegistrationInput);

  assert.equal(result, 0);
  assert.equal(createUser.calls[0].data.country, "United States");
  assert.equal(createUser.calls[0].data.countryCode, "US");
  assert.equal(createUser.calls[0].data.state, "California");
  assert.equal(createUser.calls[0].data.stateCode, null);
  assert.equal(createUser.calls[0].data.city, "Los Angeles");
  assert.equal(createUser.calls[0].data.cityGeonameId, 5368361);
  assert.equal(createProfile.calls.length, 1);
});

test("user registration persists a selected GeoNames city", async (t) => {
  stubMethod(t, prisma.user, "findUnique", async () => null);
  const createUser = { calls: [] };
  stubMethod(t, prisma, "$transaction", async (callback) =>
    callback({
      user: {
        create: async (args) => {
          createUser.calls.push(args);
          return { id: "user-syria" };
        },
      },
      professionalProfile: { create: async () => undefined },
    }),
  );

  await registerAccount({
    ...userRegistrationInput,
    country: "Syria",
    countryCode: "SY",
    state: "",
    stateCode: "",
    city: "  Aleppo  ",
    cityGeonameId: 170063,
  });

  assert.equal(createUser.calls[0].data.countryCode, "SY");
  assert.equal(createUser.calls[0].data.city, "Aleppo");
  assert.equal(createUser.calls[0].data.state, "Aleppo");
  assert.equal(createUser.calls[0].data.cityGeonameId, 170063);
});

test("user registration rejects an invalid city before persistence", async (t) => {
  stubMethod(t, prisma.user, "findUnique", async () => null);
  let transactionCount = 0;
  stubMethod(t, prisma, "$transaction", async () => {
    transactionCount += 1;
  });

  await assert.rejects(
    () =>
      registerAccount({
        ...userRegistrationInput,
        city: "Paris",
      }),
    (error) =>
      error.code === "VALIDATION_ERROR" &&
      error.fieldErrors?.city === "Select a city from the suggestions.",
  );
  assert.equal(transactionCount, 0);
});

test("new company registration creates one pending company request", async (t) => {
  stubMethod(t, prisma.company, "findUnique", async () => null);
  const createCompany = stubMethod(
    t,
    prisma.company,
    "create",
    async ({ data }) => ({
      id: "company-1",
      ...data,
      logoUrl: null,
      rejectionReason: null,
      reviewedAt: null,
      updatedAt: new Date("2026-10-01T10:00:00.000Z"),
    }),
  );
  stubMethod(t, prisma.user, "findMany", async () => []);

  const result = await registerAccount(registrationInput);

  assert.equal(createCompany.calls.length, 1);
  assert.equal(result.registrationStatus, "PENDING");
  assert.equal(result.resubmitted, false);
  assert.equal(result.company.id, "company-1");
  assert.equal(createCompany.calls[0][0].data.countryCode, "US");
  assert.equal(createCompany.calls[0][0].data.stateCode, null);
  assert.equal(createCompany.calls[0][0].data.city, "Los Angeles");
  assert.equal(createCompany.calls[0][0].data.cityGeonameId, 5368361);
  assert.equal(
    createCompany.calls[0][0].data.location,
    "Los Angeles, California, United States",
  );
});

test("company registration persists the selected city without changing approval flow", async (t) => {
  stubMethod(t, prisma.company, "findUnique", async () => null);
  const createCompany = stubMethod(
    t,
    prisma.company,
    "create",
    async ({ data }) => ({
      id: "company-syria",
      ...data,
      logoUrl: null,
      rejectionReason: null,
      reviewedAt: null,
      updatedAt: new Date("2026-10-01T10:00:00.000Z"),
    }),
  );
  stubMethod(t, prisma.user, "findMany", async () => []);

  const result = await registerAccount({
    ...registrationInput,
    country: "Syria",
    countryCode: "SY",
    state: "",
    stateCode: "",
    city: "  Aleppo  ",
    cityGeonameId: 170063,
    location: "Aleppo, Syria",
  });

  assert.equal(result.registrationStatus, "PENDING");
  assert.equal(createCompany.calls[0][0].data.countryCode, "SY");
  assert.equal(createCompany.calls[0][0].data.city, "Aleppo");
  assert.equal(createCompany.calls[0][0].data.state, "Aleppo");
  assert.equal(createCompany.calls[0][0].data.cityGeonameId, 170063);
  assert.equal(createCompany.calls[0][0].data.location, "Aleppo, Syria");
});

test("company registration rejects an invalid city before persistence", async (t) => {
  stubMethod(t, prisma.company, "findUnique", async () => null);
  const createCompany = stubMethod(t, prisma.company, "create", async () => {
    throw new Error("invalid location must not be persisted");
  });

  await assert.rejects(
    () =>
      registerAccount({
        ...registrationInput,
        city: "Paris",
      }),
    (error) =>
      error.code === "VALIDATION_ERROR" &&
      error.fieldErrors?.city === "Select a city from the suggestions.",
  );
  assert.equal(createCompany.calls.length, 0);
});

test("pending and approved companies cannot be registered a second time", async (t) => {
  let approvalStatus;
  stubMethod(t, prisma.company, "findUnique", async () => ({
    id: "existing-company",
    password: hashPassword(registrationInput.password),
    approvalStatus,
  }));
  const createCompany = stubMethod(t, prisma.company, "create", async () => {
    throw new Error("duplicate company creation must not run");
  });
  for (const [status, expectedCode] of [
    ["PENDING", "COMPANY_REGISTRATION_PENDING"],
    ["APPROVED", "COMPANY_ALREADY_REGISTERED"],
  ]) {
    approvalStatus = status;

    await assert.rejects(
      () => registerAccount(registrationInput),
      (error) => error.code === expectedCode,
    );
    assert.equal(createCompany.calls.length, 0);
  }
});

test("concurrent duplicate registration resolves to the existing pending status", async (t) => {
  let lookupCount = 0;
  stubMethod(t, prisma.company, "findUnique", async () => {
    lookupCount += 1;
    return lookupCount === 1 ? null : { approvalStatus: "PENDING" };
  });
  const createCompany = stubMethod(t, prisma.company, "create", async () => {
    throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
      code: "P2002",
      clientVersion: "test",
    });
  });

  await assert.rejects(
    () => registerAccount(registrationInput),
    (error) => error.code === "COMPANY_REGISTRATION_PENDING",
  );
  assert.equal(createCompany.calls.length, 1);
  assert.equal(lookupCount, 2);
});

test("rejected company registration updates the existing record and clears review metadata", async (t) => {
  const existingCompany = {
    id: "rejected-company",
    password: hashPassword(registrationInput.password),
    approvalStatus: "REJECTED",
  };
  const updatedCompany = {
    id: existingCompany.id,
    companyName: registrationInput.companyName,
    slug: registrationInput.slug,
    description: registrationInput.description,
    email: registrationInput.email,
    phone: registrationInput.phone,
    country: registrationInput.country,
    countryCode: registrationInput.countryCode,
    state: registrationInput.state,
    stateCode: registrationInput.stateCode,
    city: registrationInput.city,
    logoUrl: null,
    website: registrationInput.website,
    location: registrationInput.location,
    rejectionReason: null,
    reviewedAt: null,
    updatedAt: new Date("2026-10-02T10:00:00.000Z"),
  };
  let lookupCount = 0;
  stubMethod(t, prisma.company, "findUnique", async () => {
    lookupCount += 1;
    return lookupCount === 1 ? existingCompany : updatedCompany;
  });
  const updateCompany = stubMethod(
    t,
    prisma.company,
    "updateMany",
    async () => ({ count: 1 }),
  );
  const createCompany = stubMethod(t, prisma.company, "create", async () => {
    throw new Error("resubmission must not create a new company");
  });
  stubMethod(t, prisma.user, "findMany", async () => []);

  const result = await registerAccount(registrationInput);

  assert.equal(updateCompany.calls.length, 1);
  assert.equal(updateCompany.calls[0][0].where.id, existingCompany.id);
  assert.deepEqual(
    {
      approvalStatus: updateCompany.calls[0][0].data.approvalStatus,
      rejectionReason: updateCompany.calls[0][0].data.rejectionReason,
      reviewedAt: updateCompany.calls[0][0].data.reviewedAt,
    },
    {
      approvalStatus: "PENDING",
      rejectionReason: null,
      reviewedAt: null,
    },
  );
  assert.equal(createCompany.calls.length, 0);
  assert.equal(result.resubmitted, true);
  assert.equal(result.company.id, existingCompany.id);
  assert.equal(result.registrationStatus, "PENDING");
});

test("pending and rejected company login reports status only after valid credentials", async (t) => {
  let approvalStatus;
  stubMethod(t, prisma.company, "findUnique", async () => ({
    id: "company-1",
    email: registrationInput.email,
    companyName: "Acme",
    slug: "acme",
    description: "Recruiting company",
    phone: "1234567890",
    website: null,
    location: null,
    password: hashPassword(registrationInput.password),
    logoUrl: null,
    status: "ACTIVE",
    approvalStatus,
    rejectionReason:
      approvalStatus === "REJECTED" ? "Please update your website." : null,
    reviewedAt: approvalStatus === "REJECTED" ? new Date() : null,
    createdAt: new Date("2026-09-01T10:00:00.000Z"),
    updatedAt: new Date("2026-09-01T10:00:00.000Z"),
  }));
  for (const status of ["PENDING", "REJECTED"]) {
    approvalStatus = status;

    const result = await loginAccount({
      role: "company",
      email: registrationInput.email,
      password: registrationInput.password,
    });

    assert.equal(result.registrationStatus, approvalStatus);
    assert.equal("token" in result, false);
    assert.equal("refreshToken" in result, false);
    assert.equal(
      result.company.rejectionReason,
      approvalStatus === "REJECTED" ? "Please update your website." : null,
    );
    await assert.rejects(
      () =>
        loginAccount({
          role: "company",
          email: registrationInput.email,
          password: "wrong-password",
        }),
      (error) => error.code === "UNAUTHORIZED",
    );
  }
});

test("approved company login continues to issue access and refresh tokens", async (t) => {
  const previousAccessSecret = process.env.JWT_SECRET;
  const previousRefreshSecret = process.env.JWT_REFRESH_SECRET;
  process.env.JWT_SECRET = "company-approval-test-access-secret";
  process.env.JWT_REFRESH_SECRET = "company-approval-test-refresh-secret";
  t.after(() => {
    if (previousAccessSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = previousAccessSecret;
    if (previousRefreshSecret === undefined)
      delete process.env.JWT_REFRESH_SECRET;
    else process.env.JWT_REFRESH_SECRET = previousRefreshSecret;
  });
  stubMethod(t, prisma.company, "findUnique", async () => ({
    id: "approved-company",
    email: registrationInput.email,
    companyName: "Acme",
    slug: "acme",
    description: "Recruiting company",
    phone: "1234567890",
    website: null,
    location: null,
    password: hashPassword(registrationInput.password),
    logoUrl: null,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    rejectionReason: null,
    reviewedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const result = await loginAccount({
    role: "company",
    email: registrationInput.email,
    password: registrationInput.password,
  });

  assert.equal(result.company.approvalStatus, "APPROVED");
  assert.ok(result.token);
  assert.ok(result.refreshToken);
});

test("deactivated user login distinguishes valid from invalid credentials", async (t) => {
  stubMethod(t, prisma.user, "findUnique", async () => ({
    id: "deactivated-user",
    email: "user@example.test",
    profilePicUrl: null,
    firstName: "Deactivated",
    lastName: "User",
    password: hashPassword("correct-password"),
    role: "USER",
    accountStatus: "DEACTIVATED",
  }));

  await assert.rejects(
    () =>
      loginAccount({
        role: "user",
        email: "user@example.test",
        password: "correct-password",
      }),
    (error) => error.code === "ACCOUNT_DEACTIVATED" && error.statusCode === 403,
  );
  await assert.rejects(
    () =>
      loginAccount({
        role: "user",
        email: "user@example.test",
        password: "wrong-password",
      }),
    (error) => error.code === "UNAUTHORIZED" && error.statusCode === 401,
  );
});

test("deactivated approved company login returns the account-deactivated error", async (t) => {
  stubMethod(t, prisma.company, "findUnique", async () => ({
    id: "deactivated-company",
    email: registrationInput.email,
    companyName: "Acme",
    slug: "acme",
    description: "Recruiting company",
    phone: "1234567890",
    website: null,
    location: null,
    password: hashPassword(registrationInput.password),
    logoUrl: null,
    status: "DEACTIVATED",
    approvalStatus: "APPROVED",
    rejectionReason: null,
    reviewedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await assert.rejects(
    () =>
      loginAccount({
        role: "company",
        email: registrationInput.email,
        password: registrationInput.password,
      }),
    (error) => error.code === "ACCOUNT_DEACTIVATED" && error.statusCode === 403,
  );
});
