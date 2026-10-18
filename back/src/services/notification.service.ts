import { NotificationType } from "@prisma/client";
import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
import {
  PERMISSIONS,
  type PermissionCode,
} from "../authorization/permissions.js";

/**
 * Notification service. Recipient ownership is part of every read/update/
 * delete query, and list operations are paginated to avoid unbounded payloads.
 */

type NotificationRecipient =
  | { userId: string; companyId?: never }
  | { companyId: string; userId?: never };

type CreateNotificationInput = NotificationRecipient & {
  message: string;
  type: NotificationType;
  jobId?: string;
  applicationId?: string;
  supportTicketId?: string;
  conversationId?: string;
};

const supportPermissionCodes = [
  PERMISSIONS.VIEW_SUPPORT,
  PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
  PERMISSIONS.VIEW_SUPPORT_TICKETS,
  PERMISSIONS.REPLY_SUPPORT,
  PERMISSIONS.REPLY_SUPPORT_TICKETS,
  PERMISSIONS.ASSIGN_SUPPORT,
  PERMISSIONS.ASSIGN_SUPPORT_TICKET,
  PERMISSIONS.REASSIGN_SUPPORT,
  PERMISSIONS.REASSIGN_SUPPORT_TICKET,
  PERMISSIONS.CLOSE_SUPPORT,
  PERMISSIONS.CLOSE_SUPPORT_TICKET,
  PERMISSIONS.CHANGE_SUPPORT_STATUS,
  PERMISSIONS.CHANGE_SUPPORT_PRIORITY,
] as const;

const companyRequestPermissionCodes = [
  PERMISSIONS.VIEW_COMPANIES,
  PERMISSIONS.VIEW_COMPANY_DETAILS,
  PERMISSIONS.EDIT_COMPANIES,
  PERMISSIONS.SUSPEND_COMPANIES,
  PERMISSIONS.DELETE_COMPANIES,
] as const;

export const getAllowedNotificationTypesForAdmin = (
  permissions: readonly PermissionCode[]
): NotificationType[] => {
  const allowed: NotificationType[] = [];

  if (
    supportPermissionCodes.some((permission) =>
      permissions.includes(permission)
    )
  ) {
    allowed.push("SUPPORT");
  }

  if (
    companyRequestPermissionCodes.some((permission) =>
      permissions.includes(permission)
    )
  ) {
    allowed.push("COMPANY_REQUEST" as NotificationType);
  }

  return allowed;
};

export const findEligibleAdminIdsForNotificationType = async (
  notificationType: NotificationType
) => {
  const admins = await prisma.user.findMany({
    where: {
      role: "ADMIN",
      accountStatus: "ACTIVE",
    },
    select: {
      id: true,
      adminRoleAssignments: {
        where: { adminRole: { active: true } },
        select: {
          adminRole: {
            select: {
              permissions: {
                where: { permission: { active: true } },
                select: {
                  permission: {
                    select: { code: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return admins
    .filter((admin) => {
      const permissions = admin.adminRoleAssignments.flatMap(
        (assignment): PermissionCode[] =>
          assignment.adminRole.permissions.map(
            (item) => item.permission.code as PermissionCode
          )
      );
      return getAllowedNotificationTypesForAdmin(permissions).includes(
        notificationType
      );
    })
    .map((admin) => admin.id);
};

const notificationSelect = {
  id: true,
  message: true,
  type: true,
  isRead: true,
  createdAt: true,
  jobId: true,
  applicationId: true,
  supportTicketId: true,
  conversationId: true,
  job: { select: { slug: true } },
} as const;

export const createNotification = async (data: CreateNotificationInput) => {
  if ((data.userId && data.companyId) || (!data.userId && !data.companyId)) {
    throw new AppError("A notification must have exactly one recipient", 400);
  }

  if (data.userId) {
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      select: { id: true },
    });

    if (!user) throw new AppError("User not found", 404);
  }

  if (data.companyId) {
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
      select: { id: true },
    });

    if (!company) throw new AppError("Company not found", 404);
  }

  return prisma.notification.create({
    data: {
      userId: data.userId,
      companyId: data.companyId,
      jobId: data.jobId,
      applicationId: data.applicationId,
      supportTicketId: data.supportTicketId,
      conversationId: data.conversationId,
      message: data.message,
      type: data.type,
    },
    select: notificationSelect,
  });
};

export const getAdminNotifications = async (
  userId: string,
  page = 1,
  pageSize = 20,
  type?: NotificationType
) => {
  const permissions = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      adminRoleAssignments: {
        where: { adminRole: { active: true } },
        select: {
          adminRole: {
            select: {
              permissions: {
                where: { permission: { active: true } },
                select: { permission: { select: { code: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!permissions) {
    return {
      data: [],
      meta: buildPaginationMeta(page, pageSize, 0),
    };
  }

  const allowedTypes = getAllowedNotificationTypesForAdmin(
    permissions.adminRoleAssignments.flatMap((assignment): PermissionCode[] =>
      assignment.adminRole.permissions.map(
        (item) => item.permission.code as PermissionCode
      )
    )
  );

  if (allowedTypes.length === 0) {
    return {
      data: [],
      meta: buildPaginationMeta(page, pageSize, 0),
    };
  }

  if (type && !allowedTypes.includes(type)) {
    throw new AppError(
      "You are not allowed to view this notification type",
      403
    );
  }

  const finalType = type ?? undefined;
  const pagination = parsePagination({ page, pageSize }, pageSize);
  const where = {
    userId,
    ...(finalType ? { type: finalType } : { type: { in: allowedTypes } }),
  };

  const [data, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: notificationSelect,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data,
    meta: buildPaginationMeta(pagination.page, pagination.pageSize, totalCount),
  };
};

export const getUserNotifications = async (
  userId: string,
  page = 1,
  pageSize = 20,
  type?: NotificationType
) => {
  const pagination = parsePagination({ page, pageSize }, pageSize);
  const where = {
    userId,
    ...(type ? { type } : {}),
  };
  const [data, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: notificationSelect,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.pageSize,
    }),
    prisma.notification.count({ where }),
  ]);
  return {
    data,
    meta: buildPaginationMeta(pagination.page, pagination.pageSize, totalCount),
  };
};
export const getCompanyNotifications = async (
  companyId: string,
  page = 1,
  pageSize = 20,
  type?: NotificationType
) => {
  const pagination = parsePagination({ page, pageSize }, pageSize);
  const where = {
    companyId,
    ...(type ? { type } : {}),
  };
  const [data, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: notificationSelect,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.pageSize,
    }),
    prisma.notification.count({ where }),
  ]);
  return {
    data,
    meta: buildPaginationMeta(pagination.page, pagination.pageSize, totalCount),
  };
};

export const markNotificationAsRead = async (
  recipient: NotificationRecipient,
  notificationId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, ...recipient },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
    select: notificationSelect,
  });
};

export const markAllNotificationsAsRead = async (
  recipient: NotificationRecipient
) => {
  await prisma.notification.updateMany({
    where: { ...recipient, isRead: false },
    data: { isRead: true },
  });

  return { message: "All notifications marked as read" };
};

export const deleteNotification = async (
  recipient: NotificationRecipient,
  notificationId: string
) => {
  const notification = await prisma.notification.findFirst({
    where: { id: notificationId, ...recipient },
  });

  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  await prisma.notification.delete({ where: { id: notificationId } });

  return { message: "Notification deleted successfully" };
};
