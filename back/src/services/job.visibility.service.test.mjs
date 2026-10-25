import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { prisma } = require("../config/db.ts");
const {
  getJobs,
  getJobById,
  getQuestions,
  getCompanyJobById,
  getCompanyJobs,
} = require("./job.service.ts");
const {
  getJobByAdmin,
  getQuestionsByAdmin,
  getCompanyJobsByAdmin,
} = require("./admin/adminJob.service.ts");
const { getCompanyByAdmin } = require("./admin/adminCompany.service.ts");
const { getCompanyJobsForUser } = require("./user.service.ts");
const { toggleSaveJobs, getSaveJobs } = require("./savedJobs.service.ts");
const { getCompanyJobsQuerySchema } = require("../validation/admin.validation.ts");

const originalCount = prisma.job.count;
const originalFindMany = prisma.job.findMany;
const originalFindFirst = prisma.job.findFirst;
const originalFindUnique = prisma.job.findUnique;
const originalCompanyFindFirst = prisma.company.findFirst;
const originalCompanyFindUnique = prisma.company.findUnique;
const originalSavedJobFindMany = prisma.savedJob.findMany;
const originalSavedJobCount = prisma.savedJob.count;
const originalApplicationCount = prisma.application.count;
const originalTransaction = prisma.$transaction;

afterEach(() => {
  prisma.job.count = originalCount;
  prisma.job.findMany = originalFindMany;
  prisma.job.findFirst = originalFindFirst;
  prisma.job.findUnique = originalFindUnique;
  prisma.company.findFirst = originalCompanyFindFirst;
  prisma.company.findUnique = originalCompanyFindUnique;
  prisma.savedJob.findMany = originalSavedJobFindMany;
  prisma.savedJob.count = originalSavedJobCount;
  prisma.application.count = originalApplicationCount;
  prisma.$transaction = originalTransaction;
});

const publicStatuses = ["OPEN"];
const directlyAccessibleStatuses = ["OPEN", "CLOSED", "EXPIRED"];
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
    ...directlyAccessibleStatuses.map((status) => makeJob(status, status)),
    makeJob("draft", "DRAFT"),
  ];
  const countQueries = [];
  let listQuery;

  prisma.job.count = async ({ where }) => {
    countQueries.push(where);
    return records.filter(
      (job) =>
        where.status === job.status &&
        (!where.employmentType || where.employmentType === job.employmentType)
    ).length;
  };
  prisma.job.findMany = async (query) => {
    listQuery = query;
    return records
      .filter((job) => query.where.status === job.status)
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
  assert.deepEqual(listQuery.where, { status: "OPEN" });
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
  assert.equal(listWhere.status, "OPEN");
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

  for (const status of directlyAccessibleStatuses) {
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

  for (const status of directlyAccessibleStatuses) {
    const questions = await getQuestions("user-1", `job-${status}`);
    assert.equal(questions.length, 1);
  }
});

test("Admin cannot read DRAFT details while company owners retain draft management access", async () => {
  const draft = makeJob("draft-job", "DRAFT");
  let adminQuery;
  let companyQuery;
  prisma.job.findFirst = async (args) => {
    if ("companyId" in args.where) {
      companyQuery = args;
      return draft;
    }
    adminQuery = args;
    return null;
  };

  await assert.rejects(getJobByAdmin("draft-job"), {
    statusCode: 404,
    message: "Job not found",
  });
  assert.deepEqual(adminQuery.where, {
    id: "draft-job",
    status: { not: "DRAFT" },
  });

  assert.equal(
    (await getCompanyJobById("company-1", "draft-job")).status,
    "DRAFT"
  );
  assert.deepEqual(companyQuery.where, {
    id: "draft-job",
    companyId: "company-1",
  });
});

test("company-job admin list excludes drafts by default and retains closed jobs", async () => {
  const records = ["OPEN", "CLOSED", "EXPIRED", "DRAFT"].map((status) =>
    makeJob(status, status),
  );
  let listWhere;
  prisma.company.findUnique = async () => ({ id: "company-1" });
  prisma.job.findMany = async ({ where }) => {
    listWhere = where;
    return records.filter(
      (job) => where.status.not !== job.status,
    );
  };
  prisma.job.count = async ({ where }) =>
    records.filter((job) =>
      where.status?.not
        ? where.status.not !== job.status
        : where.status
          ? where.status === job.status
          : true,
    ).length;

  const result = await getCompanyJobsByAdmin("company-1", {
    page: 1,
    search: undefined,
    status: "ALL",
    employmentType: "ALL",
  });

  assert.deepEqual(
    result.jobs.map(({ status }) => status),
    ["OPEN", "CLOSED", "EXPIRED"],
  );
  assert.deepEqual(listWhere.status, { not: "DRAFT" });
  assert.equal(
    getCompanyJobsQuerySchema.safeParse({
      page: 1,
      status: "DRAFT",
      employmentType: "ALL",
    }).success,
    false,
  );
});

test("company management retains closed jobs and applicant company lists only return open jobs", async () => {
  const companyJobs = ["OPEN", "CLOSED", "EXPIRED", "DRAFT"].map((status) =>
    makeJob(status, status),
  );
  let ownerListWhere;
  let applicantListWhere;
  prisma.job.count = async ({ where }) =>
    companyJobs.filter(
      (job) =>
        (!where.companyId || where.companyId === "company-1") &&
        (!where.status ||
          (typeof where.status === "string"
            ? where.status === job.status
            : where.status.not !== job.status)),
    ).length;
  prisma.job.findMany = async (query) => {
    if (query.select.description) {
      ownerListWhere = query.where;
      return companyJobs
        .filter(
          (job) =>
            !query.where.status || query.where.status === job.status,
        )
        .map(({ id, title, description, employmentType, salary, status, deadline,
          experienceRequired, slug, createdAt, updatedAt }) => ({
          id, title, description, employmentType, salary, status, deadline,
          experienceRequired, slug, createdAt, updatedAt,
        }));
    }
    applicantListWhere = query.where;
    return [companyJobs.find(({ status }) => status === "OPEN")];
  };
  prisma.company.findFirst = async () => ({ id: "company-1" });
  prisma.savedJob.findMany = async () => [];

  const ownerResult = await getCompanyJobs("company-1", { status: "CLOSED" });
  assert.deepEqual(ownerResult.jobs.map(({ status }) => status), ["CLOSED"]);
  assert.equal(ownerListWhere.status, "CLOSED");

  const applicantResult = await getCompanyJobsForUser(
    "user-1",
    "company-1",
    1,
    undefined,
  );
  assert.deepEqual(applicantResult.jobs.map(({ status }) => status), ["OPEN"]);
  assert.equal(applicantListWhere.status, "OPEN");
});

test("saved jobs reject new DRAFT saves and hide previously saved DRAFT jobs", async () => {
  let findManyWhere;
  let countWhere;
  prisma.$transaction = async (callback) =>
    callback({
      savedJob: {
        findUnique: async () => null,
        create: async () => ({ id: "saved-1" }),
      },
      job: { findUnique: async () => ({ id: "draft-job", status: "DRAFT" }) },
    });

  await assert.rejects(toggleSaveJobs("user-1", "draft-job"), {
    statusCode: 409,
    code: "CONFLICT",
  });

  prisma.savedJob.findMany = async ({ where }) => {
    findManyWhere = where;
    return [];
  };
  prisma.savedJob.count = async ({ where }) => {
    countWhere = where;
    return 0;
  };
  await getSaveJobs("user-1");

  assert.deepEqual(findManyWhere, {
    userId: "user-1",
    job: { is: { status: { not: "DRAFT" } } },
  });
  assert.deepEqual(countWhere, findManyWhere);

  let deletedSavedJobId;
  prisma.$transaction = async (callback) =>
    callback({
      savedJob: {
        findUnique: async () => ({ id: "saved-draft" }),
        delete: async ({ where }) => {
          deletedSavedJobId = where.id;
        },
      },
      job: { findUnique: async () => assert.fail("Draft job should be unsaved") },
    });
  assert.equal(
    (await toggleSaveJobs("user-1", "draft-job")).action,
    "removed",
  );
  assert.equal(deletedSavedJobId, "saved-draft");
});

test("admin company overview hides drafts but retains closed recent jobs", async () => {
  const records = ["OPEN", "CLOSED", "EXPIRED", "DRAFT"].map((status) =>
    makeJob(status, status),
  );
  let recentJobsWhere;
  prisma.company.findUnique = async () => ({ id: "company-1" });
  prisma.job.count = async () => records.length;
  prisma.application.count = async () => 0;
  prisma.job.findMany = async ({ where }) => {
    recentJobsWhere = where;
    return records.filter((job) => where.status.not !== job.status).slice(0, 3);
  };

  const result = await getCompanyByAdmin("company-1");
  assert.deepEqual(
    result.recentJobs.map(({ status }) => status),
    ["OPEN", "CLOSED", "EXPIRED"],
  );
  assert.deepEqual(recentJobsWhere.status, { not: "DRAFT" });
});

test("admin direct job and question lookups retain closed jobs but exclude drafts", async () => {
  const queries = [];
  prisma.job.findFirst = async (args) => {
    queries.push(args);
    if (args.where.id === "draft-job") return null;
    if (args.select.applicationQuestions) {
      return { applicationQuestions: [] };
    }
    return makeJob("closed-job", "CLOSED");
  };

  await assert.rejects(getJobByAdmin("draft-job"), { statusCode: 404 });
  await assert.rejects(getQuestionsByAdmin("draft-job"), { statusCode: 404 });
  assert.equal((await getJobByAdmin("closed-job")).status, "CLOSED");
  assert.deepEqual(await getQuestionsByAdmin("closed-job"), []);
  assert.ok(
    queries.every((query) => query.where.status.not === "DRAFT"),
  );
});
