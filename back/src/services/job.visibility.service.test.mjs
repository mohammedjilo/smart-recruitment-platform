import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { prisma } = require("../config/db.ts");
const { getJobs, getJobById, getQuestions } = require("./job.service.ts");
const { getJobByAdmin } = require("./admin/adminJob.service.ts");
const { getCompanyJobById } = require("./job.service.ts");

const originalCount = prisma.job.count;
const originalFindMany = prisma.job.findMany;
const originalFindFirst = prisma.job.findFirst;
const originalFindUnique = prisma.job.findUnique;

afterEach(() => {
  prisma.job.count = originalCount;
  prisma.job.findMany = originalFindMany;
  prisma.job.findFirst = originalFindFirst;
  prisma.job.findUnique = originalFindUnique;
});

const publicStatuses = ["OPEN", "CLOSED", "EXPIRED"];
const makeJob = (id, status) => ({
  id,
  status,
  salary: 100,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  title: `Job ${id}`,
  employmentType: "FULL_TIME",
  description: `Description ${id}`,
  deadline: new Date("2027-01-01T00:00:00.000Z"),
  experienceRequired: 0,
  slug: `job-${id}`,
  company: {
    id: "company-1",
    companyName: "Company",
    slug: "company",
    logoUrl: null,
    location: null,
  },
  skills: [],
  savedBy: [],
  applications: [],
  applicationQuestions: [
    {
      id: `question-${id}`,
      question: "Question",
      order: 1,
      options: [],
      required: true,
      type: "TEXT",
    },
  ],
});

test("user job list excludes drafts and uses the same predicate for counts and pages", async () => {
  const records = [
    ...publicStatuses.map((status) => makeJob(status, status)),
    makeJob("draft", "DRAFT"),
  ];
  const countQueries = [];
  let listQuery;

  prisma.job.count = async ({ where }) => {
    countQueries.push(where);
    return records.filter(
      (job) =>
        where.status.not !== job.status &&
        (!where.employmentType || where.employmentType === job.employmentType)
    ).length;
  };
  prisma.job.findMany = async (query) => {
    listQuery = query;
    return records
      .filter((job) => query.where.status.not !== job.status)
      .slice(query.skip, query.skip + query.take)
      .map(({ id, status, salary, createdAt, title, employmentType, slug, company, skills, savedBy, applications }) => ({
        id,
        status,
        salary,
        createdAt,
        title,
        employmentType,
        slug,
        company,
        skills,
        savedBy,
        applications,
      }));
  };

  const result = await getJobs("user-1", 1);

  assert.deepEqual(result.jobsWithSaveStatus.map(({ id }) => id), publicStatuses);
  assert.equal(result.totalCount, publicStatuses.length);
  assert.deepEqual(listQuery.where, { status: { not: "DRAFT" } });
  assert.ok(countQueries.length > 0);
  assert.ok(countQueries.every((where) => where === listQuery.where));
  assert.equal(listQuery.skip, 0);
  assert.equal(listQuery.take, result.pageSize);
});

test("user job list applies status visibility with search and employment filters", async () => {
  let countWhere;
  let listWhere;
  prisma.job.count = async ({ where }) => {
    countWhere = where;
    return 0;
  };
  prisma.job.findMany = async ({ where }) => {
    listWhere = where;
    return [];
  };

  await getJobs("user-1", 2, "engineer", "FULL_TIME");

  assert.deepEqual(countWhere, listWhere);
  assert.equal(listWhere.status.not, "DRAFT");
  assert.equal(listWhere.employmentType, "FULL_TIME");
  assert.equal(listWhere.OR[0].title.contains, "engineer");
});

test("user detail lookup excludes DRAFT in the database query and preserves other statuses", async () => {
  let query;
  prisma.job.findFirst = async (args) => {
    query = args;
    const job = makeJob(
      args.where.id,
      args.where.id === "draft-job" ? "DRAFT" : "OPEN"
    );
    return job.status === "DRAFT" ? null : job;
  };

  await assert.rejects(getJobById("user-1", "draft-job", "job-draft-job"), {
    statusCode: 404,
    message: "Job not found",
  });
  assert.equal(query.where.id, "draft-job");
  assert.equal(query.where.status.not, "DRAFT");
  assert.equal(query.select.description, true);
  assert.equal(query.select.salary, true);

  for (const status of publicStatuses) {
    const id = `job-${status}`;
    prisma.job.findFirst = async () => makeJob(id, status);
    const job = await getJobById("user-1", id, `job-${id}`);
    assert.equal(job.status, status);
  }
});

test("user questions lookup excludes DRAFT in the database query and preserves other statuses", async () => {
  let query;
  prisma.job.findFirst = async (args) => {
    query = args;
    if (args.where.status.not === "DRAFT" && args.where.id === "draft-job") {
      return null;
    }
    return {
      applicationQuestions: [
        {
          id: "question-1",
          question: "Question",
          order: 1,
          options: [],
          required: true,
          type: "TEXT",
        },
      ],
    };
  };

  await assert.rejects(getQuestions("user-1", "draft-job"), {
    statusCode: 404,
    message: "Job not found",
  });
  assert.deepEqual(query.where, {
    id: "draft-job",
    status: { not: "DRAFT" },
  });

  for (const status of publicStatuses) {
    const questions = await getQuestions("user-1", `job-${status}`);
    assert.equal(questions.length, 1);
  }
});

test("Admin and company-owner job management can still read DRAFT jobs", async () => {
  const draft = makeJob("draft-job", "DRAFT");
  let adminQuery;
  let companyQuery;
  prisma.job.findUnique = async (args) => {
    adminQuery = args;
    return draft;
  };
  prisma.job.findFirst = async (args) => {
    companyQuery = args;
    return draft;
  };

  assert.equal((await getJobByAdmin("draft-job")).status, "DRAFT");
  assert.deepEqual(adminQuery.where, { id: "draft-job" });

  assert.equal(
    (await getCompanyJobById("company-1", "draft-job")).status,
    "DRAFT"
  );
  assert.deepEqual(companyQuery.where, {
    id: "draft-job",
    companyId: "company-1",
  });
});
