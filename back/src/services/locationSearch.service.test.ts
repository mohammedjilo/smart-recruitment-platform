import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { prisma } from "../config/db.js";
import { getUsersByAdmin } from "./admin/adminUser.service";
import { getAllCompaniesAdmin } from "./admin/adminCompany.service";
import { getCompanyUsers } from "./company.service";
import { getCompaniesForUser } from "./user.service";

const stubMethod = (
  t: TestContext,
  target: Record<string, unknown>,
  name: string,
  implementation: (...args: unknown[]) => unknown,
) => {
  const original = target[name];
  const calls: unknown[][] = [];
  target[name] = async (...args: unknown[]) => {
    calls.push(args);
    return implementation(...args);
  };
  t.after(() => {
    target[name] = original;
  });
  return calls;
};

const locationFilter = {
  country: "United States",
  countryCode: "US",
  city: "Los Angeles",
  cityGeonameId: 5368361,
};

test("company-facing user search combines location, text and experience before pagination", async (t) => {
  const findManyCalls = stubMethod(
    t,
    prisma.user as unknown as Record<string, unknown>,
    "findMany",
    async () => [],
  );
  stubMethod(
    t,
    prisma.user as unknown as Record<string, unknown>,
    "count",
    async () => 0,
  );

  await getCompanyUsers({
    page: 2,
    pageSize: 10,
    search: "engineer",
    experience: "3-5",
    ...locationFilter,
  });

  const args = findManyCalls[0][0] as {
    where: Record<string, unknown>;
    skip: number;
    take: number;
  };
  assert.equal(args.skip, 10);
  assert.equal(args.take, 10);
  assert.equal(args.where.role, "USER");
  assert.deepEqual(args.where.profile, {
    yearsOfExperience: { gte: 3, lte: 5 },
  });
  assert.deepEqual(args.where.AND, [
    {
      OR: [
        { countryCode: "US" },
        { country: { equals: "United States", mode: "insensitive" } },
      ],
    },
    {
      OR: [
        { cityGeonameId: 5368361 },
        {
          cityGeonameId: null,
          city: { equals: "Los Angeles", mode: "insensitive" },
        },
      ],
    },
  ]);
  assert.ok(Array.isArray(args.where.OR));
});

test("administrator user search combines location, text, status and pagination", async (t) => {
  const findManyCalls = stubMethod(
    t,
    prisma.user as unknown as Record<string, unknown>,
    "findMany",
    async () => [],
  );
  stubMethod(
    t,
    prisma.user as unknown as Record<string, unknown>,
    "count",
    async () => 0,
  );

  await getUsersByAdmin({
    page: 2,
    search: "engineer",
    role: "USER",
    status: "ACTIVE",
    ...locationFilter,
  });

  const args = findManyCalls[0][0] as {
    where: Record<string, unknown>;
    skip: number;
    take: number;
  };
  assert.equal(args.skip, 6);
  assert.equal(args.take, 6);
  assert.equal(args.where.role, "USER");
  assert.equal(args.where.accountStatus, "ACTIVE");
  assert.deepEqual(args.where.AND, [
    {
      OR: [
        { countryCode: "US" },
        { country: { equals: "United States", mode: "insensitive" } },
      ],
    },
    {
      OR: [
        { cityGeonameId: 5368361 },
        {
          cityGeonameId: null,
          city: { equals: "Los Angeles", mode: "insensitive" },
        },
      ],
    },
  ]);
  assert.ok(Array.isArray(args.where.OR));
});

test("user company search combines location and text in the database before pagination", async (t) => {
  const findManyCalls = stubMethod(
    t,
    prisma.company as unknown as Record<string, unknown>,
    "findMany",
    async () => [],
  );
  stubMethod(
    t,
    prisma.company as unknown as Record<string, unknown>,
    "count",
    async () => 0,
  );

  await getCompaniesForUser({
    page: 3,
    search: "engineer",
    ...locationFilter,
  });

  const args = findManyCalls[0][0] as {
    where: Record<string, unknown>;
    skip: number;
    take: number;
  };
  assert.equal(args.skip, 20);
  assert.equal(args.take, 10);
  assert.equal(args.where.approvalStatus, "APPROVED");
  assert.equal(args.where.status, "ACTIVE");
  assert.ok(Array.isArray(args.where.OR));
  assert.deepEqual(args.where.AND, [
    {
      OR: [
        { countryCode: "US" },
        { country: { equals: "United States", mode: "insensitive" } },
      ],
    },
    {
      OR: [
        { cityGeonameId: 5368361 },
        {
          cityGeonameId: null,
          city: { equals: "Los Angeles", mode: "insensitive" },
        },
      ],
    },
  ]);
});

test("administrator company search combines filters before pagination", async (t) => {
  const findManyCalls = stubMethod(
    t,
    prisma.company as unknown as Record<string, unknown>,
    "findMany",
    async () => [],
  );
  stubMethod(
    t,
    prisma.company as unknown as Record<string, unknown>,
    "count",
    async () => 0,
  );

  await getAllCompaniesAdmin({
    page: 2,
    sortByNewest: true,
    status: "ACTIVE",
    approvalStatus: "APPROVED",
    ...locationFilter,
  });

  const args = findManyCalls[0][0] as {
    where: Record<string, unknown>;
    skip: number;
    take: number;
  };
  assert.equal(args.skip, 6);
  assert.equal(args.take, 6);
  assert.equal(args.where.status, "ACTIVE");
  assert.equal(args.where.approvalStatus, "APPROVED");
  assert.deepEqual(args.where.AND, [
    {
      OR: [
        { countryCode: "US" },
        { country: { equals: "United States", mode: "insensitive" } },
      ],
    },
    {
      OR: [
        { cityGeonameId: 5368361 },
        {
          cityGeonameId: null,
          city: { equals: "Los Angeles", mode: "insensitive" },
        },
      ],
    },
  ]);
});

test("searches without location filters retain accounts with missing location data", async (t) => {
  const userFindManyCalls = stubMethod(
    t,
    prisma.user as unknown as Record<string, unknown>,
    "findMany",
    async () => [],
  );
  const companyFindManyCalls = stubMethod(
    t,
    prisma.company as unknown as Record<string, unknown>,
    "findMany",
    async () => [],
  );
  stubMethod(
    t,
    prisma.user as unknown as Record<string, unknown>,
    "count",
    async () => 0,
  );
  stubMethod(
    t,
    prisma.company as unknown as Record<string, unknown>,
    "count",
    async () => 0,
  );

  await getCompanyUsers({ page: 1 });
  await getUsersByAdmin({
    page: 1,
    role: "USER",
    status: "ALL",
  });
  await getCompaniesForUser({ page: 1 });
  await getAllCompaniesAdmin({
    page: 1,
    sortByNewest: true,
    status: "ALL",
    approvalStatus: "ALL",
  });

  for (const call of [...userFindManyCalls, ...companyFindManyCalls]) {
    const args = call[0] as { where: Record<string, unknown> };
    assert.equal(args.where.AND, undefined);
  }
});

test("all four search queries combine a selected city with its country", async (t) => {
  const userFindManyCalls = stubMethod(
    t,
    prisma.user as unknown as Record<string, unknown>,
    "findMany",
    async () => [],
  );
  const companyFindManyCalls = stubMethod(
    t,
    prisma.company as unknown as Record<string, unknown>,
    "findMany",
    async () => [],
  );
  stubMethod(
    t,
    prisma.user as unknown as Record<string, unknown>,
    "count",
    async () => 0,
  );
  stubMethod(
    t,
    prisma.company as unknown as Record<string, unknown>,
    "count",
    async () => 0,
  );
  const filter = {
    country: "Syria",
    countryCode: "SY",
    city: "Aleppo",
    cityGeonameId: 170063,
  };

  await getCompanyUsers({ page: 1, ...filter });
  await getUsersByAdmin({
    page: 1,
    role: "USER",
    status: "ALL",
    ...filter,
  });
  await getCompaniesForUser({ page: 1, ...filter });
  await getAllCompaniesAdmin({
    page: 1,
    sortByNewest: true,
    status: "ALL",
    approvalStatus: "ALL",
    ...filter,
  });

  for (const calls of userFindManyCalls) {
    const args = calls[0] as { where: { AND: unknown[] } };
    assert.ok(
      args.where.AND.some((predicate) =>
        JSON.stringify(predicate).includes('"countryCode":"SY"'),
      ),
    );
    assert.ok(
      args.where.AND.some((predicate) =>
        JSON.stringify(predicate).includes('"cityGeonameId":170063'),
      ),
    );
    assert.ok(
      args.where.AND.some((predicate) =>
        JSON.stringify(predicate).includes('"cityGeonameId":null') &&
        JSON.stringify(predicate).includes('"equals":"Aleppo"'),
      ),
    );
  }
  for (const calls of companyFindManyCalls) {
    const args = calls[0] as { where: { AND: unknown[] } };
    assert.ok(
      args.where.AND.some((predicate) =>
        JSON.stringify(predicate).includes('"countryCode":"SY"'),
      ),
    );
    assert.ok(
      args.where.AND.some((predicate) =>
        JSON.stringify(predicate).includes('"cityGeonameId":170063'),
      ),
    );
    assert.ok(
      args.where.AND.some((predicate) =>
        JSON.stringify(predicate).includes('"cityGeonameId":null') &&
        JSON.stringify(predicate).includes('"equals":"Aleppo"'),
      ),
    );
  }
});
