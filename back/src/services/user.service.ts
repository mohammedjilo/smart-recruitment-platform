import { CompanyApprovalStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { z } from "zod";
import { professionalProfileSchema } from "../validation/professionalProfile.validation";
import { certificateSchema } from "../validation/certificate.validation";
import { educationSchema } from "../validation/education.validation";
import { experienceSchema } from "../validation/experience.validation";
import { projectSchema } from "../validation/project.validation";
import { calculateMatch } from "./ai.service.js";
import { getRecommendedJobs } from "./recommendation.service.js"; // استيراد الخدمة
import { getCompaniesQuerySchema } from "../validation/user.validation";
import { cityLocationPredicate } from "../utils/locationData";

/**
 * User and dashboard service. It owns profile composition, user-owned profile
 * updates, and dashboard aggregation; controllers remain HTTP adapters.
 */

type ProfessionalProfileInput = z.infer<typeof professionalProfileSchema>;
type EducationInput = z.infer<typeof educationSchema>;
type ExperienceInput = z.infer<typeof experienceSchema>;
type ProjectInput = z.infer<typeof projectSchema>;
type CertificateInput = z.infer<typeof certificateSchema>;
type GetCompaniesQuery = z.infer<typeof getCompaniesQuerySchema>;

type ProfessionalProfilePayload = ProfessionalProfileInput & {
  educations?: EducationInput[];
  experiences?: ExperienceInput[];
  projects?: ProjectInput[];
  certificates?: CertificateInput[];
  education?: EducationInput[];
  experience?: ExperienceInput[];
  project?: ProjectInput[];
  certificate?: CertificateInput[];
};

const normalizeNestedItems = <T>(...values: Array<T[] | undefined>) => {
  for (const value of values) {
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [] as T[];
};

const buildProfileData = (input: ProfessionalProfilePayload) => ({
  jobTitle: input.jobTitle,
  summary: input.summary ?? null,
  yearsOfExperience: input.yearsOfExperience,
  cvPath: input.cvPath ?? null,
});

export const updateUserPhoto = async (
  userId: string,
  profilePicId: string,
  profilePicUrl: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  return prisma.user.update({
    where: { id: userId },
    data: {
      profilePicId,
      profilePicUrl,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      country: true,
      profilePicId: true,
      profilePicUrl: true,
    },
  });
};

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
  status?: "OPEN" | "CLOSED" | "EXPIRED",
) => {
  const pageSize = 10;
  const page =
    Number.isFinite(pageNumber) && pageNumber > 0 ? Math.floor(pageNumber) : 1;
  const searchTerm = search?.trim();
  const where: Prisma.JobWhereInput = {
    companyId,
    status: status ?? { in: ["OPEN", "CLOSED", "EXPIRED"] },
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

export const upsertProfessionalProfile = async (
  userId: string,
  input: ProfessionalProfilePayload,
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const existingProfile = await prisma.professionalProfile.findUnique({
    where: { userId },
  });

  const educations = normalizeNestedItems(input.educations, input.education);
  const experiences = normalizeNestedItems(input.experiences, input.experience);
  const projects = normalizeNestedItems(input.projects, input.project);
  const certificates = normalizeNestedItems(
    input.certificates,
    input.certificate,
  );

  const baseProfileData = buildProfileData(input);

  if (existingProfile) {
    return prisma.$transaction(async (tx) => {
      const profile = await tx.professionalProfile.update({
        where: { userId },
        data: baseProfileData,
      });

      if (educations.length > 0) {
        await tx.education.createMany({
          data: educations.map((item) => ({
            profileId: profile.id,
            university: item.university,
            degree: item.degree,
            major: item.major,
            startDate: new Date(item.startDate),
            endDate: item.endDate ? new Date(item.endDate) : null,
          })),
        });
      }

      if (experiences.length > 0) {
        await tx.experience.createMany({
          data: experiences.map((item) => ({
            profileId: profile.id,
            companyName: item.companyName,
            position: item.position,
            description: item.description ?? null,
            startDate: new Date(item.startDate),
            endDate: item.endDate ? new Date(item.endDate) : null,
          })),
        });
      }

      if (projects.length > 0) {
        await tx.project.createMany({
          data: projects.map((item) => ({
            profileId: profile.id,
            title: item.title,
            description: item.description ?? null,
          })),
        });
      }

      if (certificates.length > 0) {
        await tx.certificate.createMany({
          data: certificates.map((item) => ({
            profileId: profile.id,
            certificateName: item.certificateName,
            organization: item.organization,
          })),
        });
      }

      return tx.professionalProfile.findUniqueOrThrow({
        where: { id: profile.id },
        include: {
          educations: true,
          experiences: true,
          projects: true,
          certificates: true,
        },
      });
    });
  }

  return prisma.$transaction(async (tx) => {
    const profile = await tx.professionalProfile.create({
      data: {
        userId,
        ...baseProfileData,
      },
    });

    if (educations.length > 0) {
      await tx.education.createMany({
        data: educations.map((item) => ({
          profileId: profile.id,
          university: item.university,
          degree: item.degree,
          major: item.major,
          startDate: new Date(item.startDate),
          endDate: item.endDate ? new Date(item.endDate) : null,
        })),
      });
    }

    if (experiences.length > 0) {
      await tx.experience.createMany({
        data: experiences.map((item) => ({
          profileId: profile.id,
          companyName: item.companyName,
          position: item.position,
          description: item.description ?? null,
          startDate: new Date(item.startDate),
          endDate: item.endDate ? new Date(item.endDate) : null,
        })),
      });
    }

    if (projects.length > 0) {
      await tx.project.createMany({
        data: projects.map((item) => ({
          profileId: profile.id,
          title: item.title,
          description: item.description ?? null,
        })),
      });
    }

    if (certificates.length > 0) {
      await tx.certificate.createMany({
        data: certificates.map((item) => ({
          profileId: profile.id,
          certificateName: item.certificateName,
          organization: item.organization,
        })),
      });
    }

    return tx.professionalProfile.findUniqueOrThrow({
      where: { id: profile.id },
      include: {
        educations: true,
        experiences: true,
        projects: true,
        certificates: true,
      },
    });
  });
};

export const getDashboardData = async (userId: string, requestId?: string) => {
  // التأكد من وجود المستخدم
  // const user = await prisma.user.findUnique({
  //   where: { id: userId },
  //   select: { id: true },
  // });

  // if (!user) {
  //   throw new AppError("User not found", 404);
  // }

  // // تنفيذ الاستعلامات بالتوازي
  // const [savedJobsCount, recentApplications, totalApplications, recommendedJobs] =
  //   await Promise.all([
  //     // 1. عدد الوظائف المحفوظة
  //     prisma.savedJob.count({
  //       where: { userId },
  //     }),

  //     // 2. أحدث 5 طلبات
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

  //     // 3. العدد الإجمالي للطلبات
  //     prisma.application.count({
  //       where: { userId },
  //     }),

  //     // 4. استدعاء خدمة التوصيات الذكية (باستخدام الذكاء الاصطناعي)
  //     getRecommendedJobs(userId),
  //   ]);

  // // إرجاع البيانات المجمعة
  // return {
  //   stats: {
  //     savedJobs: savedJobsCount,
  //     applications: totalApplications,
  //   },
  //   recentApplications,
  //   recommendedJobs, // ← الآن يحتوي على الوظائف الموصى بها من الـ AI
  // };
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // تنفيذ الاستعلامات بالتوازي
  const [
    savedJobsCount,
    recentApplications,
    totalApplications,
    recommendedJobs,
    notificationsCount,
  ] = await Promise.all([
    // 1. عدد الوظائف المحفوظة
    prisma.savedJob.count({
      where: { userId },
    }),

    // 2. أحدث 5 طلبات (باستخدام appliedDate بدلاً من createdAt)
    prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }, // ✅ التصحيح هنا
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

    // 3. العدد الإجمالي للطلبات
    prisma.application.count({
      where: { userId },
    }),

    // 4. استدعاء خدمة التوصيات الذكية
    getRecommendedJobs(userId, requestId),

    prisma.notification.count({
      where: { userId },
    }),
  ]);

  // إرجاع البيانات المجمعة
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
