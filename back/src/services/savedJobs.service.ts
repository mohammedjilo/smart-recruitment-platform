// Place this in services/job.service.ts or another appropriate file.

import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";

const getApplicationState = (applications: { status: string }[]) => ({
  isApplied: applications.some(({ status }) => status !== "WITHDRAWN"),
  hasWithdrawnApplication: applications.some(
    ({ status }) => status === "WITHDRAWN"
  ),
});

/**
 * Saved-job service. It owns the user's save toggle and bounded saved-job
 * listing; the composite database key protects against duplicate rows.
 */

export const toggleSaveJobs = async (userId: string, jobId: string) => {
  return prisma.$transaction(
    async (tx) => {
      const existingSavedJob = await tx.savedJob.findUnique({
        where: { userId_jobId: { userId, jobId } },
        select: { id: true },
      });
      if (existingSavedJob) {
        await tx.savedJob.delete({ where: { id: existingSavedJob.id } });
        return {
          message: "Job removed from saved list",
          action: "removed" as const,
        };
      }

      const job = await tx.job.findUnique({
        where: { id: jobId },
        select: { id: true, status: true },
      });
      if (!job) {
        throw new AppError("Job not found", 404);
      }
      if (job.status === "DRAFT") {
        throw new AppError(
          "Draft jobs cannot be saved",
          409,
          "CONFLICT"
        );
      }

      await tx.savedJob.create({ data: { userId, jobId } });
      return { message: "Job saved successfully", action: "saved" as const };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );
};

/**
 * Get the list of saved jobs for a user.
 * @param userId - The user's ID.
 * @returns Saved jobs with their details.
 */
export const getSaveJobs = async (userId: string, pageNumber = 1) => {
  const JOBS_PER_PAGE = 5;
  const pagination = parsePagination({ page: pageNumber }, JOBS_PER_PAGE);

  const savedJobs = await prisma.savedJob.findMany({
    where: { userId, job: { is: { status: { not: "DRAFT" } } } },
    select: {
      id: true,
      createdAt: true,
      job: {
        select: {
          id: true,
          deadline: true,
          title: true,
          slug: true,
          salary: true,
          experienceRequired: true,
          employmentType: true,
          company: {
            select: {
              id: true,
              companyName: true,
              slug: true,
              logoUrl: true,
            },
          },
          applications: {
            where: { userId },
            select: { status: true },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: pagination.skip,
    take: pagination.pageSize,
  });
  const totalCount = await prisma.savedJob.count({
    where: { userId, job: { is: { status: { not: "DRAFT" } } } },
  });

  const jobs = savedJobs.map((saved) => {
    const { applications, ...job } = saved.job;
    return {
      ...job,
      isSaved: true,
      ...getApplicationState(applications),
    };
  });

  return {
    jobs,
    ...buildPaginationMeta(pagination.page, pagination.pageSize, totalCount),
  };
};
