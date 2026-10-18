import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import type { PermissionCode } from "./permissions.js";

const loadUserPermissions = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      accountStatus: true,
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

  if (!user || user.role !== "ADMIN" || user.accountStatus !== "ACTIVE") {
    return new Set<string>();
  }

  return new Set(
    user.adminRoleAssignments.flatMap((assignment) =>
      assignment.adminRole.permissions.map((item) => item.permission.code)
    )
  );
};

export const getUserPermissions = async (userId: string) => {
  const permissions = await loadUserPermissions(userId);
  return [...permissions] as PermissionCode[];
};

export const hasPermission = async (
  userId: string,
  permission: PermissionCode
) => {
  const permissions = await loadUserPermissions(userId);
  return permissions.has(permission);
};

export const assertPermission = async (
  userId: string,
  permission: PermissionCode
) => {
  if (!(await hasPermission(userId, permission))) {
    throw new AppError(
      "You do not have permission to perform this action",
      403
    );
  }
};

export const assertAnyPermission = async (
  userId: string,
  permissions: readonly PermissionCode[]
) => {
  const granted = await loadUserPermissions(userId);
  if (!permissions.some((permission) => granted.has(permission))) {
    throw new AppError(
      "You do not have permission to perform this action",
      403
    );
  }
};

export const createAuditLog = async (input: {
  actorUserId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Prisma.InputJsonObject;
}) =>
  prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      resource: input.resource,
      resourceId: input.resourceId,
      metadata: input.metadata,
    },
  });
