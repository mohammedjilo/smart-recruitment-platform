import { Prisma, type ApplicationStatus } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { cloudinaryUploadCV } from "../utils/cloudinary";
import { calculateMatch } from "./ai.service";
import { createNotification } from "./notification.service";
import type { ApplicationSubmissionInput } from "../validation/application.validation";
import {
  assertJobAcceptsApplications,
  buildQuestionSnapshot,
  validateApplicationAnswers,
} from "./application.policy";
import {
  assertApplicationTransition,
  assertApplicationWithdrawal,
} from "./application.state";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
import {
  getErrorDiagnostics,
  writeStructuredLog,
} from "../utils/structuredLogger.js";

/**
 * Application domain orchestration.
 *
 * This service owns application creation, ownership checks, pagination, and
 * status updates. Controllers provide validated input only; persistence is
 * isolated from AI, file uploads, and notification side effects.
 */
// type CreateApllicationPayload = {
//   experiance?: string;
//   skills?: string[];
//   description?: string;
// };
export type CreateApllicationPayload = ApplicationSubmissionInput;

const applicationContextSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  skills: { select: { skill: { select: { skillName: true } } } },
  profile: {
    select: {
      yearsOfExperience: true,
      educations: { select: { major: true, university: true, degree: true } },
      experiences: {
        select: {
          companyName: true,
          description: true,
          position: true,
          startDate: true,
          endDate: true,
        },
      },
      certificates: { select: { certificateName: true, organization: true } },
      projects: { select: { title: true, description: true } },
    },
  },
  languages: { select: { language: true } },
} as const;

const applicationJobSelect = {
  id: true,
  companyId: true,
  title: true,
  description: true,
  status: true,
  deadline: true,
  skills: { select: { skill: { select: { skillName: true } } } },
  applicationQuestions: {
    orderBy: { order: "asc" as const },
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
    },
  },
} as const;

const loadApplicationContext = async (userId: string, jobId: string) => {
  const [user, job, existingApplication] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: applicationContextSelect,
    }),
    prisma.job.findUnique({
      where: { id: jobId },
      select: applicationJobSelect,
    }),
    prisma.application.findFirst({
      where: { userId, jobId, status: { not: "WITHDRAWN" } },
      select: { id: true },
    }),
  ]);

  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (!job) throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
  if (existingApplication) {
    throw new AppError(
      "Application already submitted",
      409,
      "DUPLICATE_APPLICATION"
    );
  }
  return { user, job };
};

const buildProfileSnapshot = (
  user: Awaited<ReturnType<typeof loadApplicationContext>>["user"],
  input: CreateApllicationPayload
) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: input.email,
  phone: input.phone,
  country: input.country,
  age: input.age,
  jobTitle: input.jobTitle,
  yearsOfExperience: user.profile?.yearsOfExperience ?? null,
  educations: user.profile?.educations ?? [],
  languages: user.languages ?? [],
  experiences: user.profile?.experiences ?? [],
  projects: user.profile?.projects ?? [],
  certificates: user.profile?.certificates ?? [],
  skills: user.skills.map((skill) => skill.skill.skillName),
});

const createApplicationCore = async (
  userId: string,
  jobId: string,
  input: CreateApllicationPayload,
  profileSnapshot: ReturnType<typeof buildProfileSnapshot> | null,
  questionSnapshot: ReturnType<typeof buildQuestionSnapshot>,
  answers: CreateApllicationPayload["answers"],
  matchResult: {
    score: number;
    recommendation: string;
    strengths: Prisma.InputJsonValue;
    missingSkills: Prisma.InputJsonValue;
  },
  cvId: string | null,
  cvUrl: string | null
) => {
  // The transaction contains only the application aggregate and its answers.
  // External providers must remain outside it so provider latency or failure
  // cannot hold database locks or roll back a valid application.
  try {
    return await prisma.$transaction(async (tx) => {
      const [job, existingApplication] = await Promise.all([
        tx.job.findUnique({
          where: { id: jobId },
          select: { status: true, deadline: true },
        }),
        tx.application.findFirst({
          where: { userId, jobId, status: { not: "WITHDRAWN" } },
          select: { id: true },
        }),
      ]);
      if (!job) throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
      assertJobAcceptsApplications(job.status, job.deadline);
      if (existingApplication) {
        throw new AppError(
          "Application already submitted",
          409,
          "DUPLICATE_APPLICATION"
        );
      }

      const questionIds = answers.map((answer) => answer.questionId);
      const questions = await tx.applicationQuestion.findMany({
        where: { jobId, id: { in: questionIds } },
        select: { id: true },
      });
      if (questions.length !== new Set(questionIds).size) {
        throw new AppError(
          "Question does not belong to this job",
          400,
          "QUESTION_JOB_MISMATCH"
        );
      }

      return tx.application.create({
        data: {
          userId,
          jobId,
          resumeType: input.useProfessionalProfile ? "PROFILE" : "UPLOAD",
          cvId,
          cvUrl,
          profileSnapshot: profileSnapshot ?? undefined,
          questionSnapshot: questionSnapshot as Prisma.InputJsonValue,
          matchScore: matchResult.score,
          recommendation: matchResult.recommendation,
          strengths: matchResult.strengths,
          missingSkills: matchResult.missingSkills,
          answers: {
            create: answers.map((answer) => ({
              questionId: answer.questionId,
              answer: answer.answer,
            })),
          },
        },
        select: {
          id: true,
          status: true,
          resumeType: true,
          matchScore: true,
          recommendation: true,
          strengths: true,
          missingSkills: true,
          cvId: true,
          cvUrl: true,
          profileSnapshot: true,
          questionSnapshot: true,
          createdAt: true,
          updatedAt: true,
          answers: {
            select: {
              id: true,
              questionId: true,
              answer: true,
              createdAt: true,
            },
          },
        },
      });
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new AppError(
        "Application already submitted",
        409,
        "DUPLICATE_APPLICATION",
        undefined,
        { cause: error, source: "database", classification: "expected" }
      );
    }
    throw error;
  }
};

export const applyToJob = async (
  userId: string,
  jobId: string,
  input: CreateApllicationPayload,
  cvFile?: Express.Multer.File,
  requestId?: string
) => {
  /**
   * Creates a current application snapshot. Eligibility and answer policies
   * run before external calls; the final ownership check is repeated inside
   * the transaction to protect against stale reads and race conditions.
   */
  const { user, job } = await loadApplicationContext(userId, jobId);
  assertJobAcceptsApplications(job.status, job.deadline);

  if (!input.useProfessionalProfile && !cvFile) {
    throw new AppError("Resume PDF is required", 400, "RESUME_REQUIRED");
  }

  const answers = input.answers;
  validateApplicationAnswers(job.applicationQuestions, answers);

  const profileSnapshot = input.useProfessionalProfile
    ? buildProfileSnapshot(user, input)
    : null;
  const candidateData = {
    basicInformation: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      jobTitle: input.jobTitle,
    },
    resumeType: input.useProfessionalProfile ? "PROFILE" : "UPLOAD",
    profile: profileSnapshot,
    questionsAndAnswers: answers.map((answer) => {
      const question = job.applicationQuestions.find(
        (item) => item.id === answer.questionId
      );
      return {
        questionId: answer.questionId,
        question: question?.question,
        type: question?.type,
        answer: answer.answer,
      };
    }),
  };

  let cvId: string | null = null;
  let cvUrl: string | null = null;
  if (!input.useProfessionalProfile && cvFile) {
    const uploadResult = await cloudinaryUploadCV(
      cvFile.buffer,
      cvFile.mimetype
    );
    cvId = uploadResult.public_id;
    cvUrl = uploadResult.secure_url;
  }

  const matchResult = await calculateMatch(
    job,
    candidateData,
    !input.useProfessionalProfile ? cvFile : undefined
  );
  const application = await createApplicationCore(
    userId,
    jobId,
    input,
    profileSnapshot,
    buildQuestionSnapshot(job.applicationQuestions),
    answers,
    matchResult,
    cvId,
    cvUrl
  );

  try {
    await createNotification({
      companyId: job.companyId,
      jobId: job.id,
      applicationId: application.id,
      message: `${user.firstName} ${user.lastName} applied for ${job.title}`,
      type: "APPLICATION",
    });
  } catch (error) {
    writeStructuredLog("warn", "application.notification.failed", {
      source: "notification" as const,
      ...(requestId ? { requestId } : {}),
      ...getErrorDiagnostics(error),
    });
  }

  return application;
};
type UserApplicationsOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: ApplicationStatus;
  matchScore?: "HIGH" | "GOOD" | "FAIR" | "LOW";
  sortOrder?: "asc" | "desc";
};

export const getUserApplications = async (
  userId: string,
  options: UserApplicationsOptions = {}
) => {
  const pagination = parsePagination(
    { page: options.page, pageSize: options.pageSize },
    5
  );
  const search = options.search?.trim();
  const matchScoreWhere: Prisma.ApplicationWhereInput =
    options.matchScore === "HIGH"
      ? { matchScore: { gte: 85 } }
      : options.matchScore === "GOOD"
        ? { matchScore: { gte: 70, lt: 85 } }
        : options.matchScore === "FAIR"
          ? { matchScore: { gte: 50, lt: 70 } }
          : options.matchScore === "LOW"
            ? { matchScore: { lt: 50 } }
            : {};
  const where: Prisma.ApplicationWhereInput = {
    userId,
    ...(options.status ? { status: options.status } : {}),
    ...matchScoreWhere,
    ...(search
      ? {
          job: {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              {
                company: {
                  companyName: { contains: search, mode: "insensitive" },
                },
              },
            ],
          },
        }
      : {}),
  };
  const sortOrder = options.sortOrder === "asc" ? "asc" : "desc";

  const [applications, totalCount] = await Promise.all([
    prisma.application.findMany({
      where,
      select: {
        id: true,
        status: true,
        matchScore: true,
        createdAt: true,
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                companyName: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: sortOrder },
      skip: pagination.skip,
      take: pagination.pageSize,
    }),

    prisma.application.count({ where }),
  ]);

  // Return the data with pagination metadata.
  return {
    data: applications,
    ...buildPaginationMeta(pagination.page, pagination.pageSize, totalCount),
  };
};

export const getUserApplicationDetails = async (
  userId: string,
  applicationId: string
) => {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: {
      id: true,
      userId: true,
      jobId: true,
      status: true,
      matchScore: true,
      recommendation: true,
      strengths: true,
      missingSkills: true,
      resumeType: true,
      cvId: true,
      cvUrl: true,
      createdAt: true,
      updatedAt: true,
      answers: {
        select: {
          id: true,
          answer: true,
          question: {
            select: { question: true, type: true, required: true },
          },
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          company: {
            select: {
              companyName: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  return application;
};
type CompanyApplicationsOptions = {
  page?: number;
  pageSize?: number;
  status?:
    | "PENDING"
    | "REVIEWING"
    | "SHORTLISTED"
    | "INTERVIEW"
    | "ACCEPTED"
    | "REJECTED"
    | "WITHDRAWN";
  search?: string;
  matchScore?: "ALL" | "HIGH" | "GOOD" | "FAIR" | "LOW";
  sortBy?: "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
};

export const getCompanyApplications = async (
  companyId: string,
  options: CompanyApplicationsOptions = {}
) => {
  const pagination = parsePagination(
    { page: options.page, pageSize: options.pageSize },
    6
  );
  const search = options.search?.trim();
  const sortBy = options.sortBy === "updatedAt" ? "updatedAt" : "createdAt";
  const sortOrder = options.sortOrder === "asc" ? "asc" : "desc";
  const orderBy = {
    [sortBy]: sortOrder,
  } as Prisma.ApplicationOrderByWithRelationInput;

  const companyWhere: Prisma.ApplicationWhereInput = {
    job: { companyId },
    ...(search
      ? {
          OR: [
            { user: { firstName: { contains: search, mode: "insensitive" } } },
            { user: { lastName: { contains: search, mode: "insensitive" } } },
            { user: { email: { contains: search, mode: "insensitive" } } },
            { job: { title: { contains: search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };
  const matchScoreWhere: Prisma.ApplicationWhereInput =
    options.matchScore === "HIGH"
      ? { matchScore: { gte: 85 } }
      : options.matchScore === "GOOD"
        ? { matchScore: { gte: 70, lt: 85 } }
        : options.matchScore === "FAIR"
          ? { matchScore: { gte: 50, lt: 70 } }
          : options.matchScore === "LOW"
            ? { matchScore: { lt: 50 } }
            : {};
  const where: Prisma.ApplicationWhereInput = {
    ...companyWhere,
    ...(options.status ? { status: options.status } : {}),
    ...matchScoreWhere,
  };

  const [applications, totalCount, statusCounts] = await Promise.all([
    prisma.application.findMany({
      where,
      select: {
        id: true,
        status: true,
        matchScore: true,
        recommendation: true,
        strengths: true,
        missingSkills: true,
        resumeType: true,
        cvId: true,
        cvUrl: true,
        profileSnapshot: true,
        questionSnapshot: true,
        createdAt: true,
        updatedAt: true,
        answers: {
          orderBy: { question: { order: "asc" } },
          select: {
            id: true,
            answer: true,
            question: {
              select: { question: true, type: true, required: true },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profilePicUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
      orderBy,
      skip: pagination.skip,
      take: pagination.pageSize,
    }),
    prisma.application.count({ where }),
    prisma.application.groupBy({
      by: ["status"],
      where: companyWhere,
      _count: { _all: true },
    }),
  ]);

  const counts = new Map(
    statusCounts.map((item) => [item.status, item._count._all])
  );

  return {
    data: applications,
    ...buildPaginationMeta(pagination.page, pagination.pageSize, totalCount),
    stats: {
      totalApplications: statusCounts.reduce(
        (total, item) => total + item._count._all,
        0
      ),
      pending: counts.get("PENDING") ?? 0,
      reviewing: counts.get("REVIEWING") ?? 0,
      shortlisted: counts.get("SHORTLISTED") ?? 0,
      interview: counts.get("INTERVIEW") ?? 0,
      accepted: counts.get("ACCEPTED") ?? 0,
      rejected: counts.get("REJECTED") ?? 0,
    },
  };
};

export const updateApplicationStatus = async (
  companyId: string,
  applicationId: string,
  status:
    | "PENDING"
    | "REVIEWING"
    | "SHORTLISTED"
    | "INTERVIEW"
    | "ACCEPTED"
    | "REJECTED"
) => {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      job: { companyId },
    },
    select: {
      id: true,
      userId: true,
      jobId: true,
      status: true,
      matchScore: true,
      recommendation: true,
      strengths: true,
      missingSkills: true,
      resumeType: true,
      cvId: true,
      cvUrl: true,
      profileSnapshot: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      job: { select: { id: true, title: true } },
    },
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  if (application.status === status) {
    return application;
  }
  assertApplicationTransition(application.status, status);

  const updatedApplication = await prisma.$transaction(async (tx) => {
    const update = await tx.application.updateMany({
      where: {
        id: applicationId,
        status: application.status,
        job: { companyId },
      },
      data: { status },
    });

    if (update.count !== 1) {
      throw new AppError(
        "Application status changed before the update could be applied",
        409,
        "INVALID_APPLICATION_STATUS_TRANSITION"
      );
    }

    return tx.application.findFirst({
      where: { id: applicationId, job: { companyId } },
      select: {
        id: true,
        userId: true,
        jobId: true,
        status: true,
        matchScore: true,
        recommendation: true,
        strengths: true,
        missingSkills: true,
        resumeType: true,
        cvId: true,
        cvUrl: true,
        profileSnapshot: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        job: { select: { id: true, title: true } },
      },
    });
  });

  if (!updatedApplication) {
    throw new AppError("Application not found", 404);
  }

  const statusMessages = {
    REVIEWING: `Your application for ${updatedApplication.job.title} is now under review.`,
    SHORTLISTED: `Your application for ${updatedApplication.job.title} has been shortlisted.`,
    ACCEPTED: `Your application for ${updatedApplication.job.title} has been accepted.`,
    REJECTED: `Your application for ${updatedApplication.job.title} has been rejected.`,
    INTERVIEW: `Your application for ${updatedApplication.job.title} has moved to the interview stage.`,
  } as const;

  if (status in statusMessages) {
    await createNotification({
      userId: application.userId,
      jobId: application.jobId,
      applicationId: application.id,
      message: statusMessages[status as keyof typeof statusMessages],
      type: status === "INTERVIEW" ? "INTERVIEW" : "APPLICATION",
    });
  }

  return updatedApplication;
};

export const withdrawApplication = async (
  userId: string,
  applicationId: string
) => {
  const application = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: {
      id: true,
      userId: true,
      jobId: true,
      status: true,
      matchScore: true,
      recommendation: true,
      strengths: true,
      missingSkills: true,
      resumeType: true,
      cvId: true,
      cvUrl: true,
      profileSnapshot: true,
      createdAt: true,
      updatedAt: true,
      user: { select: { firstName: true, lastName: true } },
      job: { select: { id: true, title: true, companyId: true } },
    },
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  assertApplicationWithdrawal(application.status);

  const updatedApplication = await prisma.$transaction(async (tx) => {
    const update = await tx.application.updateMany({
      where: {
        id: applicationId,
        userId,
        status: application.status,
      },
      data: { status: "WITHDRAWN" },
    });

    if (update.count !== 1) {
      throw new AppError(
        "Application status changed before it could be withdrawn",
        409,
        "INVALID_APPLICATION_STATUS_TRANSITION"
      );
    }

    const withdrawnApplication = await tx.application.findFirst({
      where: { id: applicationId, userId },
      select: {
        id: true,
        userId: true,
        jobId: true,
        status: true,
        matchScore: true,
        recommendation: true,
        strengths: true,
        missingSkills: true,
        resumeType: true,
        cvId: true,
        cvUrl: true,
        profileSnapshot: true,
        createdAt: true,
        updatedAt: true,
        job: { select: { id: true, title: true } },
      },
    });

    if (!withdrawnApplication) {
      throw new AppError("Application not found", 404);
    }

    if (application.status === "ACCEPTED") {
      await tx.notification.create({
        data: {
          companyId: application.job.companyId,
          jobId: application.jobId,
          applicationId: application.id,
          message: `${application.user.firstName} ${application.user.lastName} withdrew their accepted application for ${application.job.title}.`,
          type: "APPLICATION",
        },
      });
    }

    return withdrawnApplication;
  });

  return updatedApplication;
};
