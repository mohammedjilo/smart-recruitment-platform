import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db.js";
import { AppError } from "../../utils/appError.js";
import { z } from "zod";
import { updateUserStatusSchema } from "../../validation/admin.validation";
import { cityLocationPredicate } from "../../utils/locationData";

type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

type AdminUsersQuery = z.infer<
  typeof import("../../validation/admin.validation").getAdminUsersQuerySchema
>;

export const getUsersByAdmin = async (options: AdminUsersQuery) => {
  const pageSize = 6;
  const search = options.search?.trim();
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

  const where: Prisma.UserWhereInput = {
    role: "USER",
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(options.status !== "ALL" ? { accountStatus: options.status } : {}),
    ...(locationFilters.length ? { AND: locationFilters } : {}),
  };

  const [users, totalUsers, activeUsers, inactiveUsers] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      skip: (options.page - 1) * pageSize,
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
        profilePicUrl: true,
        role: true,
        accountStatus: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
    prisma.user.count({ where: { ...where, accountStatus: "ACTIVE" } }),
    prisma.user.count({ where: { ...where, accountStatus: "DEACTIVATED" } }),
  ]);

  return {
    users,
    stats: { totalUsers, activeUsers, inactiveUsers },
    pagination: {
      totalCount: await prisma.user.count({ where }),
      page: options.page,
      pageSize,
    },
  };
};

export const getUserByAdmin = async (userId: string) => {
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
      _count: {
        select: {
          applications: true,
          savedJobs: true,
          messagesSent: true,
          messagesReceived: true,
          languages: true,
          skills: true,
          notifications: true,
        },
      },
    },
  });

  if (!user) throw new AppError("User not found", 404);

  const { _count, ...userData } = user;

  return {
    user: userData,
    stats: {
      applications: _count.applications,
      savedJobs: _count.savedJobs,
      messages: _count.messagesSent + _count.messagesReceived,
      languages: _count.languages,
      skills: _count.skills,
      notifications: _count.notifications,
    },
  };
};

export const updateUserStatusByAdmin = async (
  userId: string,
  input: UpdateUserStatusInput,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "ADMIN") {
    throw new AppError("Manage admin accounts through Admin Management", 403);
  }

  return prisma.user.update({
    where: { id: userId },
    data: { accountStatus: input.status },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      accountStatus: true,
    },
  });
};
