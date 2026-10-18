import { ApplicationStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/appError.js";
import { z } from "zod";
import { changeJobStatusByAdmin } from "../job.service";
import {
  updateJobStatusSchema,
  getCompanyJobsQuerySchema,
  getAdminJobsQuerySchema,
  getJobApplicationsQuerySchema,
} from "../../validation/admin.validation";

type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;
type CompanyJobsQuery = z.infer<typeof getCompanyJobsQuerySchema>;
type AdminJobsQuery = z.infer<typeof getAdminJobsQuerySchema>;
type JobApplicationsQuery = z.infer<typeof getJobApplicationsQuerySchema>;

export const getJobsByAdmin = async (options: AdminJobsQuery) => {
  const pageSize = 6;
  const statsWhere: Prisma.JobWhereInput = {
    status: { not: "DRAFT" },
    ...(options.search
      ? {
          OR: [
            { title: { contains: options.search, mode: "insensitive" } },
            {
              company: {
                companyName: { contains: options.search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
    ...(options.employmentType !== "ALL"
      ? { employmentType: options.employmentType }
      : {}),
  };
  const where: Prisma.JobWhereInput = {
    ...statsWhere,
    ...(options.status !== "ALL" ? { status: options.status } : {}),
  };

  const [jobs, totalCount, totalJobs, openJobs, closedJobs, expiredJobs] =
    await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (options.page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          status: true,
          slug: true,
          employmentType: true,
          deadline: true,
          createdAt: true,
          company: {
            select: { id: true, companyName: true, slug: true, logoUrl: true },
          },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
      prisma.job.count({ where: statsWhere }),
      prisma.job.count({ where: { ...statsWhere, status: "OPEN" } }),
      prisma.job.count({ where: { ...statsWhere, status: "CLOSED" } }),
      prisma.job.count({ where: { ...statsWhere, status: "EXPIRED" } }),
    ]);

  return {
    jobs,
    pagination: { totalCount, page: options.page, pageSize },
    stats: { totalJobs, openJobs, closedJobs, expiredJobs },
  };
};

export const getCompanyJobsByAdmin = async (
  companyId: string,
  options: CompanyJobsQuery
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) throw new AppError("Company not found", 404);

  const pageSize = 6;
  const statsWhere: Prisma.JobWhereInput = {
    companyId,
    ...(options.search
      ? { title: { contains: options.search, mode: "insensitive" } }
      : {}),
    ...(options.employmentType !== "ALL"
      ? { employmentType: options.employmentType }
      : {}),
  };
  const where: Prisma.JobWhereInput = {
    ...statsWhere,
    ...(options.status !== "ALL" ? { status: options.status } : {}),
  };

  const [jobs, totalCount, totalJobs, openJobs, closedJobs, expiredJobs] =
    await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (options.page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          status: true,
          slug: true,
          employmentType: true,
          deadline: true,
          createdAt: true,
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
      prisma.job.count({ where: statsWhere }),
      prisma.job.count({ where: { ...statsWhere, status: "OPEN" } }),
      prisma.job.count({ where: { ...statsWhere, status: "CLOSED" } }),
      prisma.job.count({ where: { ...statsWhere, status: "EXPIRED" } }),
    ]);

  return {
    jobs,
    pagination: { totalCount, page: options.page, pageSize },
    stats: {
      totalJobs,
      openJobs,
      closedJobs,
      expiredJobs,
    },
  };
};

export const getJobByAdmin = async (jobId: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      employmentType: true,
      experienceRequired: true,
      salary: true,
      deadline: true,
      createdAt: true,
      status: true,
      company: {
        select: {
          id: true,
          companyName: true,
          slug: true,
          logoUrl: true,
          website: true,
          email: true,
          approvalStatus: true,
        },
      },
      skills: {
        select: { skill: { select: { skillName: true } } },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });
  if (!job) throw new AppError("Job not found", 404);
  return job;
};

export const getQuestionsByAdmin = async (jobId: string) => {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: {
      applicationQuestions: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
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
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!job) throw new AppError("Job not found", 404);
  return job.applicationQuestions;
};

export const updateJobStatusByAdmin = async (
  jobId: string,
  input: UpdateJobStatusInput
) => {
  return changeJobStatusByAdmin(jobId, input.status, input.deadline);
};

export const deleteJobByAdmin = async (jobId: string) => {
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new AppError("Job not found", 404);

  await prisma.job.delete({ where: { id: jobId } });
  return { message: "Job deleted successfully" };
};

export const getJobApplicationsByAdmin = async (
  jobId: string,
  options: JobApplicationsQuery
) => {
  const [applications, groupedStatusCounts] = await Promise.all([
    prisma.application.findMany({
      where: {
        jobId,
        ...(options.status !== "ALL" ? { status: options.status } : {}),
        ...(options.search
          ? {
              OR: [
                {
                  user: {
                    firstName: {
                      contains: options.search,
                      mode: "insensitive",
                    },
                  },
                },
                {
                  user: {
                    lastName: { contains: options.search, mode: "insensitive" },
                  },
                },
                {
                  user: {
                    email: { contains: options.search, mode: "insensitive" },
                  },
                },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        status: true,
        matchScore: true,
        profileSnapshot: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.groupBy({
      by: ["status"],
      where: { jobId },
      _count: { _all: true },
    }),
  ]);

  const statusCounts: Record<ApplicationStatus, number> = {
    PENDING: 0,
    REVIEWING: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    WITHDRAWN: 0,
  };

  for (const { status, _count } of groupedStatusCounts) {
    statusCounts[status] = _count._all;
  }

  const totalCount = Object.values(statusCounts).reduce(
    (total, count) => total + count,
    0
  );

  const filteredApplications = applications.filter((application) => {
    if (options.experience === "ALL") return true;

    const snapshot = application.profileSnapshot;
    const yearsOfExperience =
      snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
        ? snapshot.yearsOfExperience
        : undefined;

    if (typeof yearsOfExperience !== "number") return false;
    if (options.experience === "0-2") return yearsOfExperience <= 2;
    if (options.experience === "3-5") {
      return yearsOfExperience >= 3 && yearsOfExperience <= 5;
    }
    return yearsOfExperience >= 6;
  });

  const pageSize = 6;
  const start = (options.page - 1) * pageSize;
  const data = filteredApplications
    .slice(start, start + pageSize)
    .map((application) => {
      const snapshot = application.profileSnapshot;
      const yearsOfExperience =
        snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
          ? snapshot.yearsOfExperience
          : null;

      return {
        ...application,
        experience:
          typeof yearsOfExperience === "number" ? yearsOfExperience : null,
        profileSnapshot: undefined,
      };
    });

  return {
    data,
    stats: { totalCount, statusCounts },
    pagination: {
      totalCount: filteredApplications.length,
      page: options.page,
      pageSize,
    },
  };
};
