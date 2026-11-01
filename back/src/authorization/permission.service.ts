import { Prisma } from "@prisma/client";
import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import {
  ADMIN_ROLE_NAMES,
  DEMO_ADMIN_READ_PERMISSION_CODES,
  type PermissionCode,
} from "./permissions.js";

const demoAdminReadPermissionSet: ReadonlySet<string> = new Set(
  DEMO_ADMIN_READ_PERMISSION_CODES
);

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
              name: true,
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
    return { permissions: new Set<string>(), isDemoAdmin: false };
  }

  const isDemoAdmin = user.adminRoleAssignments.some(
    (assignment) => assignment.adminRole.name === ADMIN_ROLE_NAMES.DEMO_ADMIN
  );
  const permissions = new Set(
    user.adminRoleAssignments.flatMap((assignment) =>
      assignment.adminRole.permissions.map((item) => item.permission.code)
    )
  );

  return {
    permissions: isDemoAdmin
      ? new Set(demoAdminReadPermissionSet)
      : permissions,
    isDemoAdmin,
  };
};

export const getUserPermissions = async (userId: string) => {
  const { permissions } = await loadUserPermissions(userId);
  return [...permissions] as PermissionCode[];
};

export const hasPermission = async (
  userId: string,
  permission: PermissionCode
) => {
  const { permissions } = await loadUserPermissions(userId);
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
  if (!permissions.some((permission) => granted.permissions.has(permission))) {
    throw new AppError(
      "You do not have permission to perform this action",
      403
    );
  }
};

export const isDemoAdminUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      accountStatus: true,
      adminRoleAssignments: {
        where: { adminRole: { active: true } },
        select: { adminRole: { select: { name: true } } },
      },
    },
  });

  return Boolean(
    user?.role === "ADMIN" &&
    user.accountStatus === "ACTIVE" &&
    user.adminRoleAssignments.some(
      (assignment) => assignment.adminRole.name === ADMIN_ROLE_NAMES.DEMO_ADMIN
    )
  );
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
