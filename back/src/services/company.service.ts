import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { z } from "zod";
import { updateCompanyProfileSchema } from "../validation/company.validation";
import { cityLocationPredicate, resolveLocation } from "../utils/locationData";

type UpdateCompanyProfileInput = z.infer<typeof updateCompanyProfileSchema> & {
  logoId?: string;
};

type GetCompanyUsersOptions = {
  page?: number;
  pageSize?: number;
  search?: string;
  experience?: "ALL" | "0-2" | "3-5" | "6+";
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
  city?: string;
  cityGeonameId?: number;
};

export const getCompanyUsers = async (options: GetCompanyUsersOptions = {}) => {
  const page =
    Number.isFinite(options.page) && options.page! > 0
      ? Math.floor(options.page!)
      : 1;
  const pageSize = options.pageSize ?? 10;
  const search = options.search?.trim();
  const experienceFilter =
    options.experience && options.experience !== "ALL"
      ? options.experience === "0-2"
        ? { gte: 0, lte: 2 }
        : options.experience === "3-5"
          ? { gte: 3, lte: 5 }
          : { gte: 6 }
      : undefined;

  const locationFilters: Prisma.UserWhereInput[] = [];
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
          ? [{ state: { equals: options.state, mode: "insensitive" as const } }]
          : []),
      ],
    });
  }
  if (options.cityGeonameId) {
    locationFilters.push(
      cityLocationPredicate(options.cityGeonameId, options.city),
    );
  }

  const where: Prisma.UserWhereInput = {
    role: "USER",
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            {
              profile: {
                jobTitle: { contains: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {}),
    ...(experienceFilter
      ? { profile: { yearsOfExperience: experienceFilter } }
      : {}),
    ...(locationFilters.length ? { AND: locationFilters } : {}),
  };

  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        country: true,
        state: true,
        city: true,
        profilePicId: true,
        profilePicUrl: true,
        createdAt: true,
        profile: {
          select: {
            jobTitle: true,
            summary: true,
            yearsOfExperience: true,
          },
        },
        skills: {
          select: { skill: { select: { skillName: true } } },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map(({ profile, skills, ...user }) => ({
      ...user,
      professionalProfile: profile,
      skills: skills.map(({ skill }) => skill.skillName),
    })),
    pagination: {
      totalCount,
      page,
      pageSize,
    },
  };
};

export const getDashboardCompany = async (companyId: string) => {
  // Ensure the company exists.
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, companyName: true },
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  // Run all queries in parallel.
  const [
    activeJobsCount,
    totalApplications,
    interviewsCount,
    recentApplications,
    recentJobs,
    topJobsByApplications,
  ] = await Promise.all([
    // 1. Count open jobs.
    prisma.job.count({
      where: {
        companyId,
        status: "OPEN",
      },
    }),

    // 2. Count applications across all company jobs.
    prisma.application.count({
      where: {
        job: {
          companyId,
        },
      },
    }),

    // 3. Count applications in the INTERVIEW status.
    prisma.application.count({
      where: {
        job: {
          companyId,
        },
        status: "INTERVIEW",
      },
    }),

    // 4. Get the five most recent applications with user and job details.
    prisma.application.findMany({
      where: {
        job: {
          companyId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        createdAt: true,
        status: true,
        matchScore: true,
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
    }),

    // 5. Get the five most recent jobs with company and skill details.
    prisma.job.findMany({
      where: {
        companyId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        employmentType: true,
        _count: {
          select: { applications: true },
        },
      },
    }),

    // 6. Get the three jobs with the most applications.
    prisma.job.findMany({
      where: {
        companyId,
      },
      select: {
        id: true,
        title: true,
        employmentType: true,
        slug: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: {
        applications: {
          _count: "desc",
        },
      },
      take: 3,
    }),
  ]);

  // Return the aggregated data without initialization.
  return {
    stats: {
      activeJobs: activeJobsCount,
      totalApplications,
      interviews: interviewsCount,
    },
    recentApplications,
    recentJobs,
    topJobs: topJobsByApplications,
  };
};

export const updateCompanyProfile = async (
  companyId: string,
  input: UpdateCompanyProfileInput,
) => {
  const existingCompany = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!existingCompany) {
    throw new AppError("Company not found", 404);
  }
  if (existingCompany.id !== companyId) {
    throw new AppError("You are not authorized to update this company", 403);
  }
  const data: Prisma.CompanyUpdateInput = {};

  if (input.companyName !== undefined) {
    data.companyName = input.companyName;
  }

  if (input.slug !== undefined) {
    data.slug = input.slug;
  }

  if (input.description !== undefined) {
    data.description = input.description ?? null;
  }

  if (input.phone !== undefined) {
    data.phone = input.phone;
  }

  if (input.website !== undefined) {
    data.website = input.website ?? null;
  }

  const hasLocationSelection =
    input.country !== undefined ||
    input.countryCode !== undefined ||
    input.state !== undefined ||
    input.stateCode !== undefined ||
    input.city !== undefined ||
    input.cityGeonameId !== undefined;

  if (hasLocationSelection) {
    if (
      !input.country ||
      !input.countryCode ||
      !input.city ||
      !input.cityGeonameId
    ) {
      throw new AppError(
        "Select a valid country and city.",
        400,
        "VALIDATION_ERROR",
        {
          country: "Select a valid country.",
          city: "Select a city from the suggestions.",
        },
      );
    }
    const location = await resolveLocation({
      country: input.country,
      countryCode: input.countryCode,
      city: input.city,
      cityGeonameId: input.cityGeonameId,
    });
    data.location = [
      location.city,
      location.state,
      location.country,
    ].filter(Boolean).join(", ");
    data.country = location.country;
    data.countryCode = location.countryCode;
    data.state = location.state || null;
    data.stateCode = location.stateCode || null;
    data.city = location.city;
    data.cityGeonameId = location.cityGeonameId;
  } else if (input.location !== undefined) {
    data.location = input.location || null;
    data.country = null;
    data.countryCode = null;
    data.state = null;
    data.stateCode = null;
    data.city = null;
  }

  if (input.logoUrl !== undefined) {
    data.logoUrl = input.logoUrl ?? null;
  }
  if (input.logoId !== undefined) {
    data.logoId = input.logoId;
  }
  return prisma.company.update({
    where: { id: companyId },
    data,
    select: {
      id: true,
      companyName: true,
      slug: true,
      email: true,
      logoUrl: true,
    },
  });
};

export const getCompanyProfile = async (companyId: string) => {
  const [company, totalJobsPosted, totalApplicationsReceived] =
    await Promise.all([
      prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          companyName: true,
          slug: true,
          description: true,
          logoId: true,
          logoUrl: true,
          phone: true,
          email: true,
          website: true,
          location: true,
          country: true,
          countryCode: true,
          state: true,
          stateCode: true,
          city: true,
          cityGeonameId: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.job.count({ where: { companyId } }),
      prisma.application.count({ where: { job: { companyId } } }),
    ]);

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  return {
    ...company,
    stats: {
      totalJobsPosted,
      totalApplicationsReceived,
    },
  };
};
