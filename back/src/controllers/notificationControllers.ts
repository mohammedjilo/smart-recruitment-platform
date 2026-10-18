import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { parsePagination } from "../utils/pagination";
import {
  deleteNotification,
  getAdminNotifications,
  getCompanyNotifications,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notification.service";
import { sendSuccess } from "../utils/apiResponse";

/**
 * Notification HTTP adapter. Every operation is delegated with the typed
 * recipient context so ownership stays in the notification service.
 */

export const getNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.company?.id;

    if (!userId && !companyId) {
      throw new AppError("Authentication required", 401);
    }

    const rawType = req.query.type;
    const typeFilter = Array.isArray(rawType) ? rawType[0] : rawType;

    if (
      typeFilter &&
      ![
        "APPLICATION",
        "MESSAGE",
        "INTERVIEW",
        "JOB",
        "SUPPORT",
        "COMPANY_REQUEST",
        "SYSTEM",
      ].includes(typeFilter as string)
    ) {
      throw new AppError("Invalid notification type filter", 400);
    }

    const pagination = parsePagination(
      req.query as Record<string, string | string[] | undefined>
    );
    const notifications =
      req.user?.role === "ADMIN"
        ? await getAdminNotifications(
            userId!,
            pagination.page,
            pagination.pageSize,
            typeFilter as
              | "APPLICATION"
              | "MESSAGE"
              | "INTERVIEW"
              | "JOB"
              | "SUPPORT"
              | "COMPANY_REQUEST"
              | "SYSTEM"
              | undefined
          )
        : companyId
          ? await getCompanyNotifications(
              companyId,
              pagination.page,
              pagination.pageSize,
              typeFilter as
                | "APPLICATION"
                | "MESSAGE"
                | "INTERVIEW"
                | "JOB"
                | "SUPPORT"
                | "COMPANY_REQUEST"
                | "SYSTEM"
                | undefined
            )
          : userId
            ? await getUserNotifications(
                userId,
                pagination.page,
                pagination.pageSize,
                typeFilter as
                  | "APPLICATION"
                  | "MESSAGE"
                  | "INTERVIEW"
                  | "JOB"
                  | "SUPPORT"
                  | "COMPANY_REQUEST"
                  | "SYSTEM"
                  | undefined
              )
            : {
                data: [],
                meta: {
                  page: pagination.page,
                  pageSize: pagination.pageSize,
                  totalCount: 0,
                },
              };

    sendSuccess(res, 200, notifications.data, { meta: notifications.meta });
  }
);

export const markNotificationAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.company?.id;
    const { notificationId } = req.params as { notificationId?: string };

    if (!userId && !companyId) {
      throw new AppError("Authentication required", 401);
    }

    if (!notificationId) {
      throw new AppError("Notification id is required", 400);
    }

    const notification = companyId
      ? await markNotificationAsRead({ companyId }, notificationId)
      : await markNotificationAsRead({ userId: userId! }, notificationId);

    sendSuccess(res, 200, notification, {
      message: "Notification marked as read",
    });
  }
);

export const markAllNotificationsAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.company?.id;

    if (!userId && !companyId) {
      throw new AppError("Authentication required", 401);
    }

    const result = companyId
      ? await markAllNotificationsAsRead({ companyId })
      : await markAllNotificationsAsRead({ userId: userId! });

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);

export const deleteNotificationController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.company?.id;
    const { notificationId } = req.params as { notificationId?: string };

    if (!userId && !companyId) {
      throw new AppError("Authentication required", 401);
    }

    if (!notificationId) {
      throw new AppError("Notification id is required", 400);
    }

    const result = companyId
      ? await deleteNotification({ companyId }, notificationId)
      : await deleteNotification({ userId: userId! }, notificationId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
