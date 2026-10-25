import { prisma } from "../config/db.js";
import { hashPassword } from "./auth.service.js";
import { AppError } from "../utils/appError.js";
import {
  assertAnyPermission,
  assertPermission,
  createAuditLog,
  getUserPermissions,
} from "../authorization/permission.service.js";
import { PERMISSIONS } from "../authorization/permissions.js";

const adminSummarySelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  accountStatus: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  adminRoleAssignments: {
    select: {
      adminRole: {
        select: { name: true },
      },
    },
  },
} as const;

export const getCurrentAdminPermissions = async (userId: string) => {
  const [permissions, admin] = await Promise.all([
    getUserPermissions(userId),
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        adminRoleAssignments: {
          select: { adminRole: { select: { name: true } } },
        },
      },
    }),
  ]);

  return {
    permissions,
    adminRoleNames:
      admin?.adminRoleAssignments.map(({ adminRole }) => adminRole.name) ?? [],
  };
};

export const createAdmin = async (
  actorUserId: string,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
    country: string;
    roleName: "SUPER_ADMIN" | "SUPPORT_ADMIN" | "OPERATIONS_ADMIN";
  }
) => {
  await assertPermission(actorUserId, PERMISSIONS.CREATE_ADMIN);

  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  const existingCompany = await prisma.company.findUnique({
    where: { email: input.email },
    select: { id: true },
  });
  if (existingUser || existingCompany) {
    throw new AppError("Email already registered", 409);
  }

  const role = await prisma.adminRole.findUnique({
    where: { name: input.roleName },
    select: { id: true, active: true },
  });
  if (!role || !role.active) {
    throw new AppError("Admin role not found", 404);
  }

  if (input.roleName === "SUPER_ADMIN") {
    await assertPermission(actorUserId, PERMISSIONS.MANAGE_ADMIN_PERMISSIONS);
  }

  const admin = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        password: hashPassword(input.password),
        phone: input.phone,
        country: input.country,
        role: "ADMIN",
        accountStatus: "ACTIVE",
      },
      select: adminSummarySelect,
    });

    await transaction.userAdminRole.create({
      data: { userId: user.id, adminRoleId: role.id },
    });
    await transaction.auditLog.create({
      data: {
        actorUserId,
        action: "ADMIN_CREATED",
        resource: "USER",
        resourceId: user.id,
        metadata: { roleName: input.roleName },
      },
    });

    return user;
  });

  return admin;
};

export const listAdminRoles = async (actorUserId: string) => {
  await assertPermission(actorUserId, PERMISSIONS.VIEW_ADMINS);

  return prisma.adminRole.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
      permissions: {
        select: {
          permission: { select: { code: true, resource: true, action: true } },
        },
        orderBy: { permission: { code: "asc" } },
      },
    },
  });
};

export const listAdmins = async (actorUserId: string) => {
  await assertAnyPermission(actorUserId, [
    PERMISSIONS.VIEW_ADMINS,
    PERMISSIONS.ASSIGN_SUPPORT,
    PERMISSIONS.REASSIGN_SUPPORT,
  ]);

  return prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: adminSummarySelect,
  });
};

export const getAdminAuthorization = async (
  actorUserId: string,
  targetUserId: string
) => {
  await assertPermission(actorUserId, PERMISSIONS.VIEW_ADMINS);

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: adminSummarySelect,
  });

  if (!target || target.role !== "ADMIN") {
    throw new AppError("Admin user not found", 404);
  }

  return {
    ...target,
    permissions: await getUserPermissions(targetUserId),
  };
};

export const assignAdminRole = async (
  actorUserId: string,
  targetUserId: string,
  roleName: "SUPER_ADMIN" | "SUPPORT_ADMIN" | "OPERATIONS_ADMIN"
) => {
  await assertPermission(actorUserId, PERMISSIONS.ASSIGN_ADMIN_ROLE);

  const [actor, target, role] = await Promise.all([
    prisma.user.findUnique({
      where: { id: actorUserId },
      select: { id: true, role: true, accountStatus: true },
    }),
    prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, accountStatus: true },
    }),
    prisma.adminRole.findUnique({
      where: { name: roleName },
      select: { id: true, name: true, active: true },
    }),
  ]);

  if (!actor || actor.role !== "ADMIN" || actor.accountStatus !== "ACTIVE") {
    throw new AppError("Admin actor not found", 403);
  }
  if (!target || target.role !== "ADMIN") {
    throw new AppError("Target user must already be an admin", 400);
  }
  if (!role || !role.active) {
    throw new AppError("Admin role not found", 404);
  }
  if (targetUserId === actorUserId) {
    throw new AppError("Admins cannot change their own admin role", 400);
  }

  if (roleName === "SUPER_ADMIN") {
    await assertPermission(actorUserId, PERMISSIONS.MANAGE_ADMIN_PERMISSIONS);
  }

  const previousRoles = await prisma.userAdminRole.findMany({
    where: { userId: targetUserId },
    select: { adminRole: { select: { name: true } } },
  });
  const wasSuperAdmin = previousRoles.some(
    (assignment) => assignment.adminRole.name === "SUPER_ADMIN"
  );

  if (wasSuperAdmin && roleName !== "SUPER_ADMIN") {
    const activeSuperAdmins = await prisma.userAdminRole.count({
      where: {
        adminRole: { name: "SUPER_ADMIN" },
        user: { role: "ADMIN", accountStatus: "ACTIVE" },
      },
    });
    if (activeSuperAdmins <= 1) {
      throw new AppError("At least one active Super Admin must remain", 409);
    }
  }

  await prisma.$transaction(async (transaction) => {
    await transaction.userAdminRole.deleteMany({
      where: { userId: targetUserId },
    });
    await transaction.userAdminRole.create({
      data: { userId: targetUserId, adminRoleId: role.id },
    });
    await transaction.auditLog.create({
      data: {
        actorUserId,
        action: "ADMIN_ROLE_CHANGED",
        resource: "USER",
        resourceId: targetUserId,
        metadata: {
          previousRoles: previousRoles.map((item) => item.adminRole.name),
          roleName,
        },
      },
    });
  });

  return getAdminAuthorization(actorUserId, targetUserId);
};

export const updateAdminStatus = async (
  actorUserId: string,
  targetUserId: string,
  status: "ACTIVE" | "DEACTIVATED"
) => {
  await assertPermission(actorUserId, PERMISSIONS.DISABLE_ADMIN);

  if (actorUserId === targetUserId) {
    throw new AppError("Admins cannot deactivate their own account", 400);
  }

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      id: true,
      role: true,
      accountStatus: true,
      adminRoleAssignments: {
        select: { adminRole: { select: { name: true } } },
      },
    },
  });

  if (!target || target.role !== "ADMIN") {
    throw new AppError("Admin user not found", 404);
  }

  const isSuperAdmin = target.adminRoleAssignments.some(
    (assignment) => assignment.adminRole.name === "SUPER_ADMIN"
  );
  if (isSuperAdmin && status === "DEACTIVATED") {
    const activeSuperAdmins = await prisma.userAdminRole.count({
      where: {
        adminRole: { name: "SUPER_ADMIN" },
        user: { role: "ADMIN", accountStatus: "ACTIVE" },
      },
    });
    if (activeSuperAdmins <= 1) {
      throw new AppError("At least one active Super Admin must remain", 409);
    }
  }

  const updated = await prisma.$transaction(async (transaction) => {
    const user = await transaction.user.update({
      where: { id: targetUserId },
      data: { accountStatus: status },
      select: adminSummarySelect,
    });
    await transaction.auditLog.create({
      data: {
        actorUserId,
        action: "ADMIN_STATUS_CHANGED",
        resource: "USER",
        resourceId: targetUserId,
        metadata: { previousStatus: target.accountStatus, status },
      },
    });
    return user;
  });

  return updated;
};
