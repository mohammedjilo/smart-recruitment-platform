import { CompanyApprovalStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { z } from "zod";
import { updateProfessionalProfileSchema } from "../validation/professionalProfile.validation";
import { getRecommendedJobs } from "./recommendation.service.js"; // Import the recommendation service.
import { getCompaniesQuerySchema } from "../validation/user.validation";
import {
  cityLocationPredicate,
  resolveLocation,
} from "../utils/locationData";
import type { PersonalInformationUpdateInput } from "@smart-recruitment/validation";

/**
 * User and dashboard service. It owns profile composition, user-owned profile
 * updates, and dashboard aggregation; controllers remain HTTP adapters.
 */

type ProfessionalProfileInput = z.infer<
  typeof updateProfessionalProfileSchema
>;
type GetCompaniesQuery = z.infer<typeof getCompaniesQuerySchema>;

type ProfileRequester =
  | { id: string; type: "user" }
  | {
      id: string;
      type: "company";
      approvalStatus: CompanyApprovalStatus;
    };

export const getCompleteUserProfile = async (
  userId: string,
  requester: ProfileRequester,
) => {
  if (requester.type === "user" && requester.id !== userId) {
    throw new AppError("User profile not found", 404);
  }
  if (
    requester.type === "company" &&
    requester.approvalStatus !== "APPROVED"
  ) {
    throw new AppError("Approved company access required", 403);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      country: true,
      countryCode: true,
      state: true,
      stateCode: true,
      city: true,
      cityGeonameId: true,
      birthdate: true,
      profilePicId: true,
      profilePicUrl: true,
      role: true,
      accountStatus: true,
      createdAt: true,
      updatedAt: true,
      profile: {
        include: {
          educations: true,
          experiences: true,
          projects: true,
          certificates: true,
        },
      },
      skills: {
        include: {
          skill: true,
        },
      },
      languages: {
        include: {
          language: true,
        },
      },
      _count: {
        select: {
          applications: true,
          savedJobs: true,
          messagesSent: true,
          messagesReceived: true,
          skills: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (requester.type === "company" && user.role === "ADMIN") {
    throw new AppError("Candidate profile not found", 404);
  }

  const { profile, _count, ...userData } = user;
  const requesterUser =
    requester.type === "user"
      ? await prisma.user.findUnique({
          where: { id: requester.id },
          select: { role: true },
        })
      : null;
  const canViewStats =
    requester.type === "user" &&
    (requester.id === userId || requesterUser?.role === "ADMIN");

  const profileData = {
    ...userData,
    professionalProfile: profile,
    skills: user.skills.map(({ skill, id: userSkillId }) => ({
      ...skill,
      userSkillId,
    })),
    languages: user.languages.map(({ language, ...userLanguage }) => ({
      ...language,
      userLanguageId: userLanguage.id,
      level: userLanguage.level,
    })),
    ...(canViewStats
      ? {
          stats: {
            applications: _count.applications,
            savedJobs: _count.savedJobs,
            messages: _count.messagesSent + _count.messagesReceived,
            skills: _count.skills,
            certificates: profile?.certificates.length ?? 0,
            projects: profile?.projects.length ?? 0,
            experiences: profile?.experiences.length ?? 0,
          },
        }
      : {}),
  };

  return profileData;
};

export const getCompaniesForUser = async (options: GetCompaniesQuery) => {
  const pageSize = 10;
  const search = options.search?.trim();
  const locationFilters: Prisma.CompanyWhereInput[] = [];
  if (options.countryCode || options.country) {
    locationFilters.push({
      OR: [
        ...(options.countryCode ? [{ countryCode: options.countryCode }] : []),
        ...(options.country
          ? [
              {
                country: {
                  equals: options.country,
                  mode: "insensitive" as const,
                },
              },
            ]
          : []),
      ],
    });
  }
  if (options.stateCode || options.state) {
    locationFilters.push({
      OR: [
        ...(options.stateCode ? [{ stateCode: options.stateCode }] : []),
        ...(options.state
          ? [
              {
                state: {
                  equals: options.state,
                  mode: "insensitive" as const,
                },
              },
            ]
          : []),
      ],
    });
  }
  if (options.cityGeonameId) {
    locationFilters.push(
      cityLocationPredicate(options.cityGeonameId, options.city),
    );
  }

  const where: Prisma.CompanyWhereInput = {
    approvalStatus: "APPROVED" as const,
    status: "ACTIVE" as const,
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(locationFilters.length ? { AND: locationFilters } : {}),
  };

  const [companies, totalCount] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { companyName: "asc" },
      skip: (options.page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        companyName: true,
        slug: true,
        description: true,
        logoId: true,
        logoUrl: true,
        website: true,
        location: true,
        _count: { select: { jobs: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    companies: companies.map((company) => ({
      ...company,
      description: company.description?.slice(0, 20) ?? null,
    })),
    pagination: {
      totalCount,
      page: options.page,
      pageSize,
    },
  };
};

export const getCompanyDetailsForUser = async (companyId: string) => {
  const [company, openJobs, closedJobs, expiredJobs] = await Promise.all([
    prisma.company.findFirst({
      where: {
        id: companyId,
        approvalStatus: "APPROVED",
        status: "ACTIVE",
      },
      select: {
        id: true,
        companyName: true,
        slug: true,
        description: true,
        logoId: true,
        logoUrl: true,
        status: true,
        approvalStatus: true,
        website: true,
        location: true,
        phone: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.job.count({ where: { companyId, status: "OPEN" } }),
    prisma.job.count({ where: { companyId, status: "CLOSED" } }),
    prisma.job.count({ where: { companyId, status: "EXPIRED" } }),
  ]);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  return {
    company,
    jobs: {
      total: openJobs + closedJobs + expiredJobs,
      open: openJobs,
      closed: closedJobs,
      expired: expiredJobs,
    },
  };
};

export const getCompanyJobsForUser = async (
  userId: string,
  companyId: string,
  pageNumber = 1,
  search?: string,
) => {
  const pageSize = 10;
  const page =
    Number.isFinite(pageNumber) && pageNumber > 0 ? Math.floor(pageNumber) : 1;
  const searchTerm = search?.trim();
  const where: Prisma.JobWhereInput = {
    companyId,
    status: "OPEN",
    ...(searchTerm
      ? { title: { contains: searchTerm, mode: "insensitive" as const } }
      : {}),
    company: {
      approvalStatus: "APPROVED" as const,
      status: "ACTIVE" as const,
    },
  };

  const [company, totalCount, jobs, savedJobs] = await Promise.all([
    prisma.company.findFirst({
      where: {
        id: companyId,
        approvalStatus: "APPROVED",
        status: "ACTIVE",
      },
      select: { id: true },
    }),
    prisma.job.count({ where }),
    prisma.job.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        title: true,
        salary: true,
        status: true,
        employmentType: true,
        experienceRequired: true,
        slug: true,
        createdAt: true,
        applications: {
          where: { userId },
          select: { status: true },
        },
      },
    }),
    prisma.savedJob.findMany({
      where: { userId },
      select: { jobId: true },
    }),
  ]);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  const savedJobIds = new Set(savedJobs.map(({ jobId }) => jobId));

  return {
    jobs: jobs.map((job) => {
      const { applications, ...jobData } = job;
      return {
        ...jobData,
        isSaved: savedJobIds.has(job.id),
        isApplied: applications.some(({ status }) => status !== "WITHDRAWN"),
        hasWithdrawnApplication: applications.some(
          ({ status }) => status === "WITHDRAWN",
        ),
      };
    }),
    pagination: {
      totalCount,
      page,
      pageSize,
    },
  };
};

export const updateUserPersonalInformation = async (
  userId: string,
  input: PersonalInformationUpdateInput,
) => {
  const location = await resolveLocation({
    country: input.country,
    countryCode: input.countryCode,
    state: input.state,
    stateCode: input.stateCode,
    city: input.city,
    cityGeonameId: input.cityGeonameId,
  });

  return prisma.user.update({
    where: { id: userId },
    data: {
      phone: input.phone,
      birthdate: new Date(`${input.birthdate}T00:00:00.000Z`),
      country: location.country,
      countryCode: location.countryCode,
      state: location.state || null,
      stateCode: location.stateCode || null,
      city: location.city,
      cityGeonameId: location.cityGeonameId,
    },
    select: {
      id: true,
      phone: true,
      birthdate: true,
      country: true,
      countryCode: true,
      state: true,
      stateCode: true,
      city: true,
      cityGeonameId: true,
      updatedAt: true,
    },
  });
};

export const updateProfessionalProfile = async (
  userId: string,
  input: ProfessionalProfileInput,
) => {
  const existingProfile = await prisma.professionalProfile.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!existingProfile) {
    throw new AppError("Professional profile not found", 404);
  }

  const data: Prisma.ProfessionalProfileUpdateInput = {};
  if (input.jobTitle !== undefined) data.jobTitle = input.jobTitle;
  if (input.summary !== undefined) data.summary = input.summary;
  if (input.yearsOfExperience !== undefined) {
    data.yearsOfExperience = input.yearsOfExperience;
  }
  if (input.cvPath !== undefined) data.cvPath = input.cvPath;

  return prisma.professionalProfile.update({
    where: { userId },
    data,
    include: {
      educations: true,
      experiences: true,
      projects: true,
      certificates: true,
    },
  });
};

export const getDashboardData = async (userId: string, requestId?: string) => {
  // Ensure the user exists.
  // const user = await prisma.user.findUnique({
  //   where: { id: userId },
  //   select: { id: true },
  // });

  // if (!user) {
  //   throw new AppError("User not found", 404);
  // }

  // // Run the queries in parallel.
  // const [savedJobsCount, recentApplications, totalApplications, recommendedJobs] =
  //   await Promise.all([
  //     // 1. Count saved jobs.
  //     prisma.savedJob.count({
  //       where: { userId },
  //     }),

  //     // 2. Get the five most recent applications.
  //     prisma.application.findMany({
  //       where: { userId },
  //       orderBy: { createdAt: "desc" },
  //       take: 5,
  //       include: {
  //         job: {
  //           select: {
  //             id: true,
  //             title: true,
  //             company: true,
  //             location: true,
  //             salary: true,
  //           },
  //         },
  //       },
  //     }),

  //     // 3. Count all applications.
  //     prisma.application.count({
  //       where: { userId },
  //     }),

  //     // 4. Call the AI-powered recommendations service.
  //     getRecommendedJobs(userId),
  //   ]);

  // // Return the aggregated data.
  // return {
  //   stats: {
  //     savedJobs: savedJobsCount,
  //     applications: totalApplications,
  //   },
  //   recentApplications,
  //   recommendedJobs, // This now contains AI-recommended jobs.
  // };
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Run the queries in parallel.
  const [
    savedJobsCount,
    recentApplications,
    totalApplications,
    recommendedJobs,
    notificationsCount,
  ] = await Promise.all([
    // 1. Count saved jobs.
    prisma.savedJob.count({
      where: { userId },
    }),

    // 2. Get the five most recent applications using appliedDate instead of createdAt.
    prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }, // Corrected ordering.
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
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
    }),

    // 3. Count all applications.
    prisma.application.count({
      where: { userId },
    }),

    // 4. Call the recommendations service.
    getRecommendedJobs(userId, requestId),

    prisma.notification.count({
      where: { userId },
    }),
  ]);

  // Return the aggregated data.
  return {
    stats: {
      savedJobs: savedJobsCount,
      applications: totalApplications,
      notificationsCount,
    },
    recentApplications,
    recommendedJobs,
  };
};
