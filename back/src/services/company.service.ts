import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { z } from "zod";
import { updateCompanyProfileSchema } from "../validation/company.validation";
import { cityLocationPredicate } from "../utils/locationData";

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
  // التأكد من وجود الشركة
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true, companyName: true },
  });

  if (!company) {
    throw new AppError("Company not found", 404);
  }

  // تنفيذ جميع الاستعلامات بالتوازي
  const [
    activeJobsCount,
    totalApplications,
    interviewsCount,
    recentApplications,
    recentJobs,
    topJobsByApplications,
  ] = await Promise.all([
    // 1. عدد الوظائف النشطة (OPEN)
    prisma.job.count({
      where: {
        companyId,
        status: "OPEN",
      },
    }),

    // 2. إجمالي الطلبات على جميع وظائف الشركة
    prisma.application.count({
      where: {
        job: {
          companyId,
        },
      },
    }),

    // 3. عدد المقابلات (الطلبات التي حالتها INTERVIEW)
    prisma.application.count({
      where: {
        job: {
          companyId,
        },
        status: "INTERVIEW",
      },
    }),

    // 4. أحدث 5 طلبات (مع بيانات المستخدم والوظيفة)
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

    // 5. أحدث 5 وظائف (مع بيانات الشركة والمهارات)
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

    // 6. أفضل 3 وظائف من حيث عدد الطلبات
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

  // إرجاع البيانات المجمعة (بدون تهيئة)
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

export const updateCompanyLogo = async (
  companyId: string,
  logoId: string,
  logoUrl: string,
) => {
  const existingCompany = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!existingCompany) {
    throw new AppError("Company not found", 404);
  }

  return prisma.company.update({
    where: { id: companyId },
    data: {
      logoId,
      logoUrl,
    },
  });
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
  const data: Record<string, string | null> = {};

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

  if (input.location !== undefined) {
    data.location = input.location ?? null;
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
