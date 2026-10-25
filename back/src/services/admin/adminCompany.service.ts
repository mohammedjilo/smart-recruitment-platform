import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/appError.js";
import { createNotification } from "../notification.service";
import { z } from "zod";
import {
  updateCompanyStatusSchema,
  getCompanyRequestsQuerySchema,
  getAllCompaniesQuerySchema,
} from "../../validation/admin.validation";
import { cityLocationPredicate } from "../../utils/locationData";

type UpdateCompanyStatusInput = z.infer<typeof updateCompanyStatusSchema>;
type CompanyRequestsQuery = z.infer<typeof getCompanyRequestsQuerySchema>;
type AllCompaniesQuery = z.infer<typeof getAllCompaniesQuerySchema>;

type RejectCompanyInput = z.infer<
  typeof import("../../validation/admin.validation").rejectCompanySchema
>;

const companyAdminSelect = {
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
  approvalStatus: true,
  rejectionReason: true,
  reviewedAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const getAllCompaniesAdmin = async (options: AllCompaniesQuery) => {
  const pageSize = 6;
  const page = options.page;
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
    ...(options.status !== "ALL" ? { status: options.status } : {}),
    ...(options.approvalStatus !== "ALL"
      ? { approvalStatus: options.approvalStatus }
      : {}),
    ...(locationFilters.length ? { AND: locationFilters } : {}),
  };

  const [
    companies,
    totalCount,
    totalCompanies,
    activeCompanies,
    pendingApproval,
    rejectedCompanies,
  ] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: { createdAt: options.sortByNewest ? "desc" : "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        companyName: true,
        slug: true,
        description: true,
        logoId: true,
        logoUrl: true,
        location: true,
        status: true,
        approvalStatus: true,
        rejectionReason: true,
        reviewedAt: true,
        _count: { select: { jobs: true } },
      },
    }),
    prisma.company.count({ where }),
    prisma.company.count(),
    prisma.company.count({
      where: { status: "ACTIVE", approvalStatus: "APPROVED" },
    }),
    prisma.company.count({ where: { approvalStatus: "PENDING" } }),
    prisma.company.count({ where: { approvalStatus: "REJECTED" } }),
  ]);

  return {
    companies,
    stats: {
      totalCompanies,
      activeCompanies,
      pendingApproval,
      rejectedCompanies,
    },
    pagination: {
      totalCount,
      page,
      pageSize,
    },
  };
};

export const approveCompanyByAdmin = async (companyId: string) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) throw new AppError("Company not found", 404);

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: {
      approvalStatus: "APPROVED",
      rejectionReason: null,
      reviewedAt: new Date(),
    },
    select: companyAdminSelect,
  });

  await createNotification({
    companyId: company.id,
    message: "Your company registration has been approved.",
    type: "SYSTEM",
  });

  return updatedCompany;
};

export const rejectCompanyByAdmin = async (
  companyId: string,
  input: RejectCompanyInput = {},
) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { id: true },
  });

  if (!company) throw new AppError("Company not found", 404);

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: {
      approvalStatus: "REJECTED",
      rejectionReason: input.rejectionReason ?? null,
      reviewedAt: new Date(),
    },
    select: companyAdminSelect,
  });

  await createNotification({
    companyId: company.id,
    message: "Your company registration was rejected.",
    type: "SYSTEM",
  });

  return updatedCompany;
};

export const getCompanyRequests = async (options: CompanyRequestsQuery) => {
  const pageSize = 6;
  const page = options.page;
  const search = options.search?.trim();
  const where: Prisma.CompanyWhereInput = {
    ...(options.approvalStatus !== "ALL"
      ? { approvalStatus: options.approvalStatus }
      : {}),
    ...(options.status !== "ALL" ? { status: options.status } : {}),
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  if (options.requestedDate) {
    const startDate = new Date(`${options.requestedDate}T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    where.createdAt = { gte: startDate, lt: endDate };
  }

  const [companies, totalCount, pending, approved, rejected] =
    await Promise.all([
      prisma.company.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          companyName: true,
          slug: true,
          logoId: true,
          logoUrl: true,
          phone: true,
          email: true,
          location: true,
          status: true,
          approvalStatus: true,
          rejectionReason: true,
          reviewedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.company.count({ where }),
      prisma.company.count({
        where: {
          ...(options.requestedDate ? { createdAt: where.createdAt } : {}),
          ...(search
            ? {
                OR: [
                  { companyName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
          approvalStatus: "PENDING",
        },
      }),
      prisma.company.count({
        where: {
          ...(options.requestedDate ? { createdAt: where.createdAt } : {}),
          ...(search
            ? {
                OR: [
                  { companyName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
          approvalStatus: "APPROVED",
        },
      }),
      prisma.company.count({
        where: {
          ...(options.requestedDate ? { createdAt: where.createdAt } : {}),
          ...(search
            ? {
                OR: [
                  { companyName: { contains: search, mode: "insensitive" } },
                  { email: { contains: search, mode: "insensitive" } },
                ],
              }
            : {}),
          approvalStatus: "REJECTED",
        },
      }),
    ]);

  return {
    companies,
    stats: {
      pending,
      approved,
      rejected,
      totalCompanies: pending + approved + rejected,
    },
    pagination: {
      totalCount,
      page,
      pageSize,
    },
  };
};

export const getCompanyByAdmin = async (companyId: string) => {
  const [company, totalJobs, totalApplications, recentJobs] = await Promise.all(
    [
      prisma.company.findUnique({
        where: { id: companyId },
        select: companyAdminSelect,
      }),
      prisma.job.count({ where: { companyId } }),
      prisma.application.count({ where: { job: { companyId } } }),
      prisma.job.findMany({
        where: { companyId, status: { not: "DRAFT" } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          status: true,
          slug: true,
          createdAt: true,
          _count: { select: { applications: true } },
        },
      }),
    ],
  );

  if (!company) throw new AppError("Company not found", 404);

  return {
    company,
    stats: {
      totalJobs,
      totalApplications,
    },
    recentJobs,
  };
};

export const updateCompanyStatusByAdmin = async (
  companyId: string,
  input: UpdateCompanyStatusInput,
) => {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) throw new AppError("Company not found", 404);

  const updatedCompany = await prisma.company.update({
    where: { id: companyId },
    data: { status: input.status },
  });

  if (company.status !== updatedCompany.status) {
    await createNotification({
      companyId: company.id,
      message:
        updatedCompany.status === "ACTIVE"
          ? "Your company account has been activated."
          : "Your company account has been deactivated.",
      type: "SYSTEM",
    });
  }

  return updatedCompany;
};
