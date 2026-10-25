import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/appError.js";
import { z } from "zod";
import { getAdminApplicationsQuerySchema } from "../../validation/admin.validation";

type AdminApplicationsQuery = z.infer<typeof getAdminApplicationsQuerySchema>;

export const getApplicationByAdmin = async (applicationId: string) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
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
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          birthdate: true,
          profilePicUrl: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          slug: true,
          employmentType: true,
          salary: true,
          status: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              companyName: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
      },
    },
  });

  if (!application) throw new AppError("Application not found", 404);

  return application;
};

export const getProfileSnapshotByAdmin = async (applicationId: string) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      userId: true,
      profileSnapshot: true,
    },
  });

  if (!application) throw new AppError("Application not found", 404);

  return {
    applicationId: application.id,
    userId: application.userId,
    profileSnapshot: application.profileSnapshot,
  };
};

export const getApplicationsByAdmin = async (
  options: AdminApplicationsQuery
) => {
  const where: Prisma.ApplicationWhereInput = {
    ...(options.search
      ? {
          OR: [
            {
              user: {
                firstName: { contains: options.search, mode: "insensitive" },
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
            {
              job: {
                title: { contains: options.search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
  };

  const [
    applications,
    pending,
    reviewing,
    shortlisted,
    interview,
    accepted,
    rejected,
  ] = await Promise.all([
    prisma.application.findMany({
      where,
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
            profilePicUrl: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            slug: true,
            company: {
              select: {
                id: true,
                companyName: true,
                slug: true,
                logoUrl: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.application.count({ where: { ...where, status: "PENDING" } }),
    prisma.application.count({ where: { ...where, status: "REVIEWING" } }),
    prisma.application.count({ where: { ...where, status: "SHORTLISTED" } }),
    prisma.application.count({ where: { ...where, status: "INTERVIEW" } }),
    prisma.application.count({ where: { ...where, status: "ACCEPTED" } }),
    prisma.application.count({ where: { ...where, status: "REJECTED" } }),
  ]);

  const filteredApplications = applications.filter((application) => {
    if (options.status !== "ALL" && application.status !== options.status) {
      return false;
    }

    const score = application.matchScore;
    if (
      options.matchScore === "HIGH" &&
      (score === null || score < 85)
    ) {
      return false;
    }
    if (
      options.matchScore === "GOOD" &&
      (score === null || score < 70 || score >= 85)
    ) {
      return false;
    }
    if (
      options.matchScore === "FAIR" &&
      (score === null || score < 50 || score >= 70)
    ) {
      return false;
    }
    if (
      options.matchScore === "LOW" &&
      (score === null || score >= 50)
    ) {
      return false;
    }

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
    .map((application) => ({
      ...application,
      experience:
        application.profileSnapshot &&
        typeof application.profileSnapshot === "object" &&
        !Array.isArray(application.profileSnapshot) &&
        typeof application.profileSnapshot.yearsOfExperience === "number"
          ? application.profileSnapshot.yearsOfExperience
          : null,
      profileSnapshot: undefined,
    }));

  const stats: Partial<
    Record<
      | "PENDING"
      | "REVIEWING"
      | "SHORTLISTED"
      | "INTERVIEW"
      | "ACCEPTED"
      | "REJECTED",
      number
    >
  > = {
    PENDING: pending,
    REVIEWING: reviewing,
    SHORTLISTED: shortlisted,
    INTERVIEW: interview,
    ACCEPTED: accepted,
    REJECTED: rejected,
  };

  return {
    data,
    stats,
    pagination: {
      totalCount: filteredApplications.length,
      page: options.page,
      pageSize,
    },
  };
};
