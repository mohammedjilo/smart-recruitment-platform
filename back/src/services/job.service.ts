import { EmploymentType, Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { generateSlug } from "../utils/generateSlug.js";
import { AppError } from "../utils/appError.js";
import {
  CreateJobInput,
  UpdateJobInput,
} from "../validation/job.validation.js";
import {
  currentDateOnlyKey,
  dateOnlyToUtcDate,
  isDateOnOrAfterToday,
  toDateOnlyKey,
} from "@smart-recruitment/validation";

/**
 * Job domain service. It owns Job persistence and lifecycle rules for both
 * public route families; company approval and ownership are enforced here,
 * while controllers remain transport adapters.
 */

const JOBS_PER_PAGE = 5;

const getApplicationState = (applications: { status: string }[]) => ({
  isApplied: applications.some(({ status }) => status !== "WITHDRAWN"),
  hasWithdrawnApplication: applications.some(
    ({ status }) => status === "WITHDRAWN"
  ),
});

export type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "EXPIRED";

const parseJobDeadline = (deadline: string): Date => {
  const date = dateOnlyToUtcDate(deadline);
  if (!date) {
    throw new AppError(
      "Job deadline must be a valid date in YYYY-MM-DD format",
      400,
      "JOB_DEADLINE_INVALID"
    );
  }
  return date;
};

const assertAvailableDeadline = (deadline: Date | string) => {
  if (!isDateOnOrAfterToday(deadline)) {
    throw new AppError(
      "Job deadline must be today or a future date",
      400,
      "JOB_DEADLINE_INVALID"
    );
  }
};

const resolveOpeningDeadline = (
  currentStatus: string,
  currentDeadline: Date,
  nextStatus: JobStatus,
  requestedDeadline?: string
) => {
  if (nextStatus !== "OPEN") return undefined;
  if (
    currentStatus === "EXPIRED" &&
    (requestedDeadline === undefined ||
      requestedDeadline === toDateOnlyKey(currentDeadline))
  ) {
    throw new AppError(
      "A new deadline is required to reopen an expired job",
      400,
      "JOB_REOPEN_DEADLINE_REQUIRED"
    );
  }

  const deadline = requestedDeadline
    ? parseJobDeadline(requestedDeadline)
    : currentDeadline;
  assertAvailableDeadline(deadline);
  return requestedDeadline ? deadline : undefined;
};

/** Company Job mutations require an active, approved company account. */
const assertApprovedCompany = async (companyId: string) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, status: true, approvalStatus: true },
  });
  if (!company)
    throw new AppError("Company not found", 404, "COMPANY_NOT_FOUND");
  if (company.status !== "ACTIVE" || company.approvalStatus !== "APPROVED") {
    throw new AppError(
      "Approved company access required",
      403,
      "COMPANY_NOT_APPROVED"
    );
  }
};

const attachSkills = async (
  tx: Prisma.TransactionClient,
  jobId: string,
  skills: string[] | undefined
) => {
  if (!skills) return;
  await tx.jobSkill.deleteMany({ where: { jobId } });
  const skillData = [
    ...new Set(
      skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean)
    ),
  ].map((skillName) => ({ skillName, slug: generateSlug(skillName) }));
  if (skillData.length === 0) return;
  await tx.skill.createMany({ data: skillData, skipDuplicates: true });
  const allSkills = await tx.skill.findMany({
    where: { slug: { in: skillData.map((skill) => skill.slug) } },
    select: { id: true },
  });
  await tx.jobSkill.createMany({
    data: allSkills.map((skill) => ({ jobId, skillId: skill.id })),
    skipDuplicates: true,
  });
};

const attachQuestions = async (
  tx: Prisma.TransactionClient,
  jobId: string,
  questions: CreateJobInput["questions"] | UpdateJobInput["questions"]
) => {
  // Answered questions are immutable so historical applications retain the
  // meaning of the question they answered.
  if (!questions) return;
  const existing = await tx.applicationQuestion.findMany({
    where: { jobId },
    select: {
      id: true,
      question: true,
      type: true,
      required: true,
      options: true,
      minSelection: true,
      maxSelection: true,
      minNumber: true,
      maxNumber: true,
      _count: { select: { answers: true } },
    },
  });
  const existingIds = new Set(existing.map((question) => question.id));
  const incomingIds = questions
    .map((question) => question.id)
    .filter((id): id is string => Boolean(id));
  if (incomingIds.some((id) => !existingIds.has(id))) {
    throw new AppError(
      "Invalid question id for this job",
      400,
      "QUESTION_JOB_MISMATCH"
    );
  }
  for (const question of existing) {
    const incoming = questions.find((item) => item.id === question.id);
    if (question._count.answers > 0 && !incoming) {
      throw new AppError(
        "Questions with historical answers cannot be deleted",
        409,
        "QUESTION_HAS_HISTORICAL_ANSWERS"
      );
    }
    if (
      question._count.answers > 0 &&
      incoming &&
      (question.question !== incoming.question ||
        question.type !== incoming.type ||
        question.required !== incoming.required ||
        JSON.stringify(question.options) !== JSON.stringify(incoming.options) ||
        question.minSelection !== (incoming.minSelection ?? null) ||
        question.maxSelection !== (incoming.maxSelection ?? null) ||
        question.minNumber !== (incoming.minNumber ?? null) ||
        question.maxNumber !== (incoming.maxNumber ?? null))
    ) {
      throw new AppError(
        "Questions with historical answers cannot be changed",
        409,
        "QUESTION_HAS_HISTORICAL_ANSWERS"
      );
    }
  }
  await tx.applicationQuestion.deleteMany({
    where: {
      jobId,
      ...(incomingIds.length > 0 ? { id: { notIn: incomingIds } } : {}),
    },
  });
  for (const question of questions) {
    const data = {
      question: question.question,
      type: question.type,
      required: question.required,
      order: question.order,
      options: question.options,
      minSelection: question.minSelection ?? null,
      maxSelection: question.maxSelection ?? null,
      minNumber: question.minNumber ?? null,
      maxNumber: question.maxNumber ?? null,
    };
    if (question.id)
      await tx.applicationQuestion.update({ where: { id: question.id }, data });
    else await tx.applicationQuestion.create({ data: { ...data, jobId } });
  }
};

export const updateJobStatus = async (
  companyId: string,
  jobId: string,
  status: JobStatus,
  deadline?: string
) => {
  /** Expired jobs can only reopen with a new, valid deadline. */
  await assertApprovedCompany(companyId);
  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId },
    select: { id: true, status: true, deadline: true },
  });

  if (!job) {
    throw new AppError("Job not found for this company", 404);
  }

  const nextDeadline = resolveOpeningDeadline(
    job.status,
    job.deadline,
    status,
    deadline
  );
  return prisma.job.update({
    where: { id: jobId },
    data: { status, ...(nextDeadline ? { deadline: nextDeadline } : {}) },
  });
};

export const createJob = async (companyId: string, input: CreateJobInput) => {
  await assertApprovedCompany(companyId);
  const deadline = parseJobDeadline(input.deadline);
  assertAvailableDeadline(deadline);
  return await prisma.$transaction(async (tx) => {
    // =====================================================
    // 1. Create Job
    // =====================================================

    const jobSlug = generateSlug(input.title);

    const job = await tx.job.create({
      data: {
        title: input.title,
        slug: jobSlug,
        description: input.description,
        employmentType: input.employmentType,
        salary: input.salary ?? null,
        deadline,
        experienceRequired: input.experienceRequired,
        companyId,
      },
    });

    await attachSkills(tx, job.id, input.skills);
    await attachQuestions(tx, job.id, input.questions);

    return job;
  });
};

export const updateJob = async (
  companyId: string,
  jobId: string,
  input: UpdateJobInput
) => {
  await assertApprovedCompany(companyId);
  return prisma.$transaction(async (tx) => {
    const existingJob = await tx.job.findFirst({
      where: { id: jobId, companyId },
      select: { id: true, status: true, deadline: true },
    });
    if (!existingJob)
      throw new AppError(
        "Job not found for this company",
        404,
        "JOB_NOT_OWNED"
      );
    const nextDeadline =
      input.deadline !== undefined
        ? parseJobDeadline(input.deadline)
        : existingJob.deadline;
    const deadlineChanged =
      toDateOnlyKey(nextDeadline) !== toDateOnlyKey(existingJob.deadline);
    if (deadlineChanged) assertAvailableDeadline(nextDeadline);
    resolveOpeningDeadline(
      existingJob.status,
      existingJob.deadline,
      input.status ?? existingJob.status,
      deadlineChanged ? input.deadline : undefined
    );
    const updatedJob = await tx.job.update({
      where: { id: jobId },
      data: {
        ...(input.title !== undefined && {
          title: input.title,
          slug: generateSlug(input.title),
        }),
        ...(input.description !== undefined && {
          description: input.description,
        }),
        ...(input.employmentType !== undefined && {
          employmentType: input.employmentType,
        }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.salary !== undefined && { salary: input.salary ?? null }),
        ...(input.deadline !== undefined && {
          deadline: nextDeadline,
        }),
        ...(input.experienceRequired !== undefined && {
          experienceRequired: input.experienceRequired,
        }),
      },
    });
    await attachSkills(tx, jobId, input.skills);
    await attachQuestions(tx, jobId, input.questions);
    return updatedJob;
  });
};

export const changeJobStatus = updateJobStatus;

export const changeJobStatusByAdmin = async (
  jobId: string,
  status: JobStatus,
  deadline?: string
) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, status: true, deadline: true },
  });
  if (!job) throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
  const nextDeadline = resolveOpeningDeadline(
    job.status,
    job.deadline,
    status,
    deadline
  );
  return prisma.job.update({
    where: { id: jobId },
    data: { status, ...(nextDeadline ? { deadline: nextDeadline } : {}) },
  });
};

export const expireOpenJobsPastDeadline = async (now: Date = new Date()) => {
  const today = dateOnlyToUtcDate(currentDateOnlyKey(now));
  if (!today) throw new Error("Unable to determine the current business date");

  const result = await prisma.job.updateMany({
    where: { status: "OPEN", deadline: { lt: today } },
    data: { status: "EXPIRED" },
  });
  return result.count;
};

export type CompanyJobsOptions = {
  pageNumber?: number;
  search?: string;
  employmentType?: string;
  status?: string;
  sortBy?: "createdAt" | "title" | "status";
  sortOrder?: "asc" | "desc";
};

export const getCompanyJobs = async (
  companyId: string,
  options: CompanyJobsOptions = {}
) => {
  const page =
    Number.isFinite(options.pageNumber) && options.pageNumber! > 0
      ? Math.floor(options.pageNumber!)
      : 1;
  const pageSize = 6;
  const statsWhere: Prisma.JobWhereInput = {
    companyId,
    ...(options.search
      ? { title: { contains: options.search.trim(), mode: "insensitive" } }
      : {}),
    ...(options.employmentType
      ? { employmentType: options.employmentType as EmploymentType }
      : {}),
  };
  const where: Prisma.JobWhereInput = {
    ...statsWhere,
    ...(options.status ? { status: options.status as JobStatus } : {}),
  };
  const [totalCount, jobs, totalJobs, draft, open, closed, expired] =
    await Promise.all([
      prisma.job.count({ where }),
      prisma.job.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          employmentType: true,
          salary: true,
          status: true,
          deadline: true,
          experienceRequired: true,
          slug: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { [options.sortBy ?? "status"]: options.sortOrder ?? "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.job.count({ where: statsWhere }),
      prisma.job.count({ where: { ...statsWhere, status: "DRAFT" } }),
      prisma.job.count({ where: { ...statsWhere, status: "OPEN" } }),
      prisma.job.count({ where: { ...statsWhere, status: "CLOSED" } }),
      prisma.job.count({ where: { ...statsWhere, status: "EXPIRED" } }),
    ]);

  return {
    jobs,
    totalCount,
    page,
    pageSize,
    stats: {
      totalJobs,
      draft,
      open,
      closed,
      expired,
    },
  };
};

export const getCompanyJobById = async (
  companyId: string,
  jobId: string,
  slug?: string
) => {
  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId },
    select: {
      id: true,
      title: true,
      description: true,
      employmentType: true,
      salary: true,
      status: true,
      deadline: true,
      experienceRequired: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
      skills: {
        select: {
          skill: { select: { id: true, skillName: true, slug: true } },
        },
      },
      applicationQuestions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          question: true,
          type: true,
          required: true,
          order: true,
          options: true,
          minSelection: true,
          maxSelection: true,
          minNumber: true,
          maxNumber: true,
        },
      },
    },
  });
  if (!job) throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
  if (slug !== undefined && job.slug !== slug) {
    throw new AppError("Invalid job URL. Please use the correct link.", 404);
  }
  return job;
};

export const deleteJob = async (companyId: string, jobId: string) => {
  await assertApprovedCompany(companyId);
  const job = await prisma.job.findFirst({
    where: { id: jobId, companyId },
    select: { id: true },
  });
  if (!job)
    throw new AppError("Job not found for this company", 404, "JOB_NOT_OWNED");
  await prisma.job.delete({ where: { id: jobId } });
  return { message: "Job deleted successfully" };
};

export const getJobs = async (
  userId: string,
  pageNumber = 1,
  search?: string,
  employmentType?: EmploymentType
) => {
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const skip = (page - 1) * JOBS_PER_PAGE;

  const where: Prisma.JobWhereInput = {
    status: { not: "DRAFT" },
    ...(employmentType ? { employmentType } : {}),
    ...(search
      ? {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            company: {
              companyName: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
          {
            skills: {
              some: {
                skill: {
                  skillName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            },
          },
        ],
      }
      : {}),
  };

  const totalCount = await prisma.job.count({ where });

  const jobs = await prisma.job.findMany({
    where,
    select: {
      id: true,
      salary: true,
      createdAt: true,
      title: true,
      employmentType: true,
      slug: true,
      company: {
        select: {
          id: true,
          companyName: true,
          slug: true,
          logoUrl: true,
          location: true,
        },
      },
      skills: { select: { skill: { select: { skillName: true } } } },
      savedBy: { where: { userId }, select: { id: true } },
      applications: { where: { userId }, select: { status: true } },
    },

    orderBy: { createdAt: "desc" },
    skip,
    take: JOBS_PER_PAGE,
  });
  const jobsWithSaveStatus = jobs.map((job) => ({
    ...job,
    isSaved: job.savedBy.length > 0,
    ...getApplicationState(job.applications),
    savedBy: undefined,
    applications: undefined,
  }));
  return {
    jobsWithSaveStatus,
    totalCount,
    page,
    pageSize: JOBS_PER_PAGE,
  };
};
export const getJobById = async (
  userId: string,
  jobId: string,
  slugParam: string
  // userId?: string // (اختياري) إذا أردت التحقق من حالة الحفظ
) => {
  const job = await prisma.job.findFirst({
    where: { id: jobId, status: { not: "DRAFT" } },
    select: {
      id: true,
      salary: true,
      createdAt: true,
      title: true,
      status: true,
      employmentType: true,
      description: true,
      deadline: true,
      experienceRequired: true,
      slug: true,
      company: {
        select: {
          id: true,
          companyName: true,
          slug: true,
          logoUrl: true,
          location: true,
        },
      },
      skills: { select: { skill: { select: { skillName: true } } } },
      savedBy: {
        where: { userId },
        select: { id: true },
      },
      applications: {
        where: { userId },
        select: { status: true },
      },
    },
  });

  // 2. التحقق من وجود الوظيفة
  if (!job) {
    throw new AppError("Job not found", 404);
  }

  // 3. التحقق من صحة الـ Slug (SEO / التحقق من الروابط)
  if (job.slug !== slugParam) {
    // هناك طريقتان للتعامل مع هذا الموقف:
    // الخيار أ: رمي خطأ 404 (لن تكون الوظيفة متاحة على هذا الرابط)
    // throw new NotFoundError('Invalid job URL');

    // الخيار ب (الأفضل لتجربة المستخدم): إعادة توجيه (لكن لا يمكنك فعلها من الـ Service)
    // سنقوم برمي خطأ مخصص لكي تتعامل معه الـ Controller بعمل Redirect
    // ولكني سأعطي الخيار الأول (خطأ 404) لأنه الأكثر أماناً في الـ APIs،
    // وسأوضح لك في الـ Controller كيف تعمل Redirect إذا أردت ذلك.
    throw new AppError("Invalid job URL. Please use the correct link.", 404);
  }

  // 4. إرجاع البيانات
  return {
    ...job,
    isSaved: job.savedBy.length > 0,
    ...getApplicationState(job.applications),
    savedBy: undefined,
    applications: undefined,
  };
};
export const getQuestions = async (userId: string, jobId: string) => {
  const job = await prisma.job.findFirst({
    where: { id: jobId, status: { not: "DRAFT" } },
    select: {
      applicationQuestions: {
        select: {
          id: true,
          question: true,
          order: true,
          options: true,
          required: true,
          type: true,
        },
      },
    },
  });

  if (!job) {
    throw new AppError("Job not found", 404);
  }
  if (job.applicationQuestions.length > 0) {
    return job.applicationQuestions;
  }

  return [];
};

export const getBasicInformations = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      birthdate: true,
      country: true,
      // languages: { select: { language: { select: { languageName: true } } } },
      profile: { select: { jobTitle: true } },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
