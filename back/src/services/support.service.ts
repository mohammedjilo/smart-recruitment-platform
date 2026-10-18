import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import {
  createNotification,
  findEligibleAdminIdsForNotificationType,
} from "./notification.service.js";
import {
  assertAnyPermission,
  assertPermission,
  createAuditLog,
  getUserPermissions,
} from "../authorization/permission.service.js";
import {
  PERMISSIONS,
  type PermissionCode,
} from "../authorization/permissions.js";

export type SupportActor =
  | { type: "user"; id: string; role: "USER" | "ADMIN" }
  | { type: "company"; id: string };

export type SupportCategoryAudience = "USER" | "COMPANY";
type SupportTicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FOR_USER"
  | "RESOLVED"
  | "CLOSED";

const basicUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
} as const;

const basicCompanySelect = {
  id: true,
  companyName: true,
  email: true,
} as const;

const categorySelect = {
  id: true,
  name: true,
  audience: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

const getSupportCategoryAudience = (
  actor: SupportActor
): SupportCategoryAudience => {
  if (actor.type === "company") {
    return "COMPANY";
  }

  return "USER";
};

const messageSelect = {
  id: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  authorUserId: true,
  authorCompanyId: true,
  authorUser: {
    select: basicUserSelect,
  },
  authorCompany: {
    select: basicCompanySelect,
  },
} as const;

const ticketSelect = {
  id: true,
  subject: true,
  description: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true,
  creatorUserId: true,
  creatorCompanyId: true,
  assignedAdminId: true,
  categoryId: true,
  category: {
    select: categorySelect,
  },
  creatorUser: {
    select: basicUserSelect,
  },
  creatorCompany: {
    select: basicCompanySelect,
  },
  assignedAdmin: {
    select: basicUserSelect,
  },
  messages: {
    orderBy: {
      createdAt: "asc",
    },
    select: messageSelect,
  },
} as const;

const supportTicketListSelect = {
  id: true,
  subject: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const adminTicketListSelect = {
  id: true,
  subject: true,
  status: true,
  priority: true,
  createdAt: true,
  updatedAt: true,
  creatorUserId: true,
  creatorCompanyId: true,
  assignedAdminId: true,
  categoryId: true,
  category: {
    select: { id: true, name: true },
  },
  creatorUser: {
    select: basicUserSelect,
  },
  creatorCompany: {
    select: basicCompanySelect,
  },
  assignedAdmin: {
    select: basicUserSelect,
  },
} as const;

const parseSupportActor = (actor: SupportActor) => {
  if (actor.type === "company") {
    return { creatorCompanyId: actor.id };
  }

  return { creatorUserId: actor.id };
};

const ensureTicketBelongsToActor = (
  actor: SupportActor,
  ticket: {
    creatorUserId: string | null;
    creatorCompanyId: string | null;
    assignedAdminId: string | null;
  }
) => {
  if (actor.type === "user" && actor.role === "ADMIN") {
    return;
  }

  if (actor.type === "company") {
    if (ticket.creatorCompanyId !== actor.id) {
      throw new AppError("You do not have access to this ticket", 403);
    }
    return;
  }

  if (ticket.creatorUserId !== actor.id) {
    throw new AppError("You do not have access to this ticket", 403);
  }
};

const ensureAdmin = (actor: SupportActor) => {
  if (actor.type !== "user" || actor.role !== "ADMIN") {
    throw new AppError("Admin access required", 403);
  }
};

const ensureAdminPermission = async (
  actor: SupportActor,
  permission: PermissionCode
) => {
  ensureAdmin(actor);
  await assertPermission(actor.id, permission);
};

const ensureAnyAdminPermission = async (
  actor: SupportActor,
  permissions: PermissionCode[]
) => {
  ensureAdmin(actor);
  await assertAnyPermission(actor.id, permissions);
};

const supportReplyPermissions = [
  PERMISSIONS.REPLY_SUPPORT_TICKETS,
  PERMISSIONS.REPLY_SUPPORT,
] as PermissionCode[];
const supportViewPermissions = [
  PERMISSIONS.VIEW_SUPPORT_TICKETS,
  PERMISSIONS.VIEW_SUPPORT,
] as PermissionCode[];
const assignPermissions = [
  PERMISSIONS.ASSIGN_SUPPORT_TICKET,
  PERMISSIONS.ASSIGN_SUPPORT,
] as PermissionCode[];
const reassignPermissions = [
  PERMISSIONS.REASSIGN_SUPPORT_TICKET,
  PERMISSIONS.REASSIGN_SUPPORT,
] as PermissionCode[];
const closePermissions = [
  PERMISSIONS.CLOSE_SUPPORT_TICKET,
  PERMISSIONS.CLOSE_SUPPORT,
] as PermissionCode[];

const isValidSupportAdmin = async (userId: string) => {
  const permissions = await getUserPermissions(userId);
  return permissions.some((permission) =>
    supportViewPermissions.includes(permission)
  );
};

const assertValidStatusTransition = (
  current: SupportTicketStatus,
  next: SupportTicketStatus
) => {
  const allowed: Record<SupportTicketStatus, SupportTicketStatus[]> = {
    OPEN: ["IN_PROGRESS"],
    IN_PROGRESS: ["WAITING_FOR_USER", "RESOLVED"],
    WAITING_FOR_USER: ["IN_PROGRESS"],
    RESOLVED: ["CLOSED"],
    CLOSED: [],
  };

  if (current !== next && !allowed[current].includes(next)) {
    throw new AppError(
      `Invalid support status transition: ${current} -> ${next}`,
      400
    );
  }
};

const ensureCategoryExists = async (
  categoryId: string | undefined | null,
  actor?: SupportActor
) => {
  if (!categoryId) return;

  const category = await prisma.supportCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, audience: true },
  });

  if (!category) {
    throw new AppError("Support category not found", 404);
  }

  if (!actor || (actor.type === "user" && actor.role === "ADMIN")) {
    return;
  }

  if (category.audience !== getSupportCategoryAudience(actor)) {
    throw new AppError(
      `This category is not available for ${actor.type === "company" ? "company" : "user"} support requests`,
      400
    );
  }
};

const notifyAdmins = async (message: string) => {
  const adminIds = await findEligibleAdminIdsForNotificationType("SUPPORT");

  await Promise.all(
    adminIds.map((adminId) =>
      createNotification({
        userId: adminId,
        message,
        type: "SUPPORT",
        supportTicketId: undefined,
      })
    )
  );
};

const notifyTicketCreators = async (
  ticket: {
    id: string;
    creatorUserId: string | null;
    creatorCompanyId: string | null;
    assignedAdminId: string | null;
  },
  message: string
) => {
  if (ticket.creatorUserId) {
    await createNotification({
      userId: ticket.creatorUserId,
      message,
      type: "SUPPORT",
      supportTicketId: ticket.id,
    });
  }

  if (ticket.creatorCompanyId) {
    await createNotification({
      companyId: ticket.creatorCompanyId,
      message,
      type: "SUPPORT",
      supportTicketId: ticket.id,
    });
  }
};

const notifyAssignedAdmin = async (
  ticket: {
    id: string;
    assignedAdminId: string | null;
    creatorUserId: string | null;
    creatorCompanyId: string | null;
  },
  message: string
) => {
  if (!ticket.assignedAdminId) {
    return;
  }

  await createNotification({
    userId: ticket.assignedAdminId,
    message,
    type: "SUPPORT",
    supportTicketId: ticket.id,
  });
};

export const createSupportTicket = async (
  actor: SupportActor,
  input: {
    subject: string;
    description: string;
    categoryId?: string;
  }
) => {
  await ensureCategoryExists(input.categoryId, actor);

  const data = {
    subject: input.subject.trim(),
    description: input.description.trim(),
    status: "OPEN" as const,
    priority: "MEDIUM" as const,
    assignedAdminId: null,
    categoryId: input.categoryId ?? null,
    ...parseSupportActor(actor),
  };

  const ticket = await prisma.supportTicket.create({
    data,
    select: ticketSelect,
  });

  await notifyAdmins(
    `New support ticket created: "${ticket.subject}". Please review the queue.`
  );

  return ticket;
};

export const getMySupportTickets = async (
  actor: SupportActor,
  page = 1,
  pageSize = 20
) => {
  if (actor.type === "company") {
    const [data, totalCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where: {
          creatorCompanyId: actor.id,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: supportTicketListSelect,
      }),
      prisma.supportTicket.count({
        where: {
          creatorCompanyId: actor.id,
        },
      }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        totalCount,
      },
    };
  }

  const [data, totalCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where: {
        creatorUserId: actor.id,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: supportTicketListSelect,
    }),
    prisma.supportTicket.count({
      where: {
        creatorUserId: actor.id,
      },
    }),
  ]);

  return {
    data,
    meta: {
      page,
      pageSize,
      totalCount,
    },
  };
};

export const getSupportTicketById = async (
  actor: SupportActor,
  ticketId: string
) => {
  if (actor.type === "user" && actor.role === "ADMIN") {
    await ensureAnyAdminPermission(actor, supportViewPermissions);
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: ticketSelect,
  });

  if (!ticket) {
    throw new AppError("Support ticket not found", 404);
  }

  ensureTicketBelongsToActor(actor, ticket);

  return ticket;
};

export const addSupportMessage = async (
  actor: SupportActor,
  ticketId: string,
  content: string,
  requiresUserResponse = false
) => {
  if (actor.type === "user" && actor.role === "ADMIN") {
    await ensureAnyAdminPermission(actor, supportReplyPermissions);
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      creatorUserId: true,
      creatorCompanyId: true,
      assignedAdminId: true,
      subject: true,
      status: true,
    },
  });

  if (!ticket) {
    throw new AppError("Support ticket not found", 404);
  }

  ensureTicketBelongsToActor(actor, ticket);

  if (ticket.status === "CLOSED") {
    throw new AppError(
      "Closed support tickets cannot receive new messages",
      400
    );
  }

  const nextStatus: SupportTicketStatus =
    actor.type === "user" && actor.role === "ADMIN"
      ? requiresUserResponse && ticket.status === "IN_PROGRESS"
        ? "WAITING_FOR_USER"
        : ticket.status === "OPEN"
          ? "IN_PROGRESS"
          : ticket.status
      : ticket.status === "WAITING_FOR_USER"
        ? "IN_PROGRESS"
        : ticket.status;

  const message = await prisma.$transaction(async (transaction) => {
    const createdMessage = await transaction.supportMessage.create({
      data: {
        ticketId,
        content: content.trim(),
        ...(actor.type === "company"
          ? { authorCompanyId: actor.id }
          : { authorUserId: actor.id }),
      },
      select: messageSelect,
    });

    if (nextStatus !== ticket.status) {
      await transaction.supportTicket.update({
        where: { id: ticketId },
        data: { status: nextStatus },
      });
    }

    return createdMessage;
  });

  if (actor.type === "user" && actor.role === "ADMIN") {
    await notifyTicketCreators(
      ticket,
      `Admin replied to ticket "${ticket.subject}".`
    );
    return message;
  }

  await notifyAssignedAdmin(
    ticket,
    `A new message was added to ticket "${ticket.subject}".`
  );

  return message;
};

export const listAllSupportTickets = async (
  actor: SupportActor,
  page = 1,
  pageSize = 20,
  filters: {
    search?: string;
    status?:
      | "OPEN"
      | "IN_PROGRESS"
      | "WAITING_FOR_USER"
      | "RESOLVED"
      | "CLOSED";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    audience?: "USER" | "COMPANY";
    categoryId?: string;
    assignedAdminId?: string;
  } = {}
) => {
  await ensureAnyAdminPermission(actor, supportViewPermissions);

  const where = {
    ...(filters.search
      ? {
          OR: [
            {
              subject: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: filters.search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.priority ? { priority: filters.priority } : {}),
    ...(filters.audience
      ? {
          creatorCompanyId:
            filters.audience === "COMPANY" ? { not: null } : null,
        }
      : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.assignedAdminId === "UNASSIGNED"
      ? { assignedAdminId: null }
      : filters.assignedAdminId
        ? { assignedAdminId: filters.assignedAdminId }
        : {}),
  };

  const [data, totalCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: adminTicketListSelect,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  const [open, inProgress, waitingForUser, resolved, closed] =
    await Promise.all([
      prisma.supportTicket.count({ where: { ...where, status: "OPEN" } }),
      prisma.supportTicket.count({
        where: { ...where, status: "IN_PROGRESS" },
      }),
      prisma.supportTicket.count({
        where: { ...where, status: "WAITING_FOR_USER" },
      }),
      prisma.supportTicket.count({ where: { ...where, status: "RESOLVED" } }),
      prisma.supportTicket.count({ where: { ...where, status: "CLOSED" } }),
    ]);

  return {
    data,
    meta: {
      page,
      pageSize,
      totalCount,
    },
    stats: { open, inProgress, waitingForUser, resolved, closed },
  };
};

export const getSupportDashboard = async (actor: SupportActor) => {
  await ensureAdminPermission(actor, PERMISSIONS.VIEW_SUPPORT_DASHBOARD);

  const [open, inProgress, waitingForUser, resolved, assignedToMe, recent] =
    await Promise.all([
      prisma.supportTicket.count({ where: { status: "OPEN" } }),
      prisma.supportTicket.count({ where: { status: "IN_PROGRESS" } }),
      prisma.supportTicket.count({ where: { status: "WAITING_FOR_USER" } }),
      prisma.supportTicket.count({ where: { status: "RESOLVED" } }),
      prisma.supportTicket.count({ where: { assignedAdminId: actor.id } }),
      prisma.supportTicket.findMany({
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: adminTicketListSelect,
      }),
    ]);

  return {
    stats: { open, inProgress, waitingForUser, resolved, assignedToMe },
    recent,
  };
};

export const listUnassignedSupportTickets = async (
  actor: SupportActor,
  page = 1,
  pageSize = 20
) => {
  await ensureAdminPermission(actor, PERMISSIONS.VIEW_SUPPORT);

  const [data, totalCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { assignedAdminId: null },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: ticketSelect,
    }),
    prisma.supportTicket.count({ where: { assignedAdminId: null } }),
  ]);

  return {
    data,
    meta: {
      page,
      pageSize,
      totalCount,
    },
  };
};

export const listAssignedSupportTickets = async (
  actor: SupportActor,
  page = 1,
  pageSize = 20
) => {
  await ensureAdminPermission(actor, PERMISSIONS.VIEW_SUPPORT);

  const [data, totalCount] = await Promise.all([
    prisma.supportTicket.findMany({
      where: { assignedAdminId: { not: null } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: ticketSelect,
    }),
    prisma.supportTicket.count({ where: { assignedAdminId: { not: null } } }),
  ]);

  return {
    data,
    meta: {
      page,
      pageSize,
      totalCount,
    },
  };
};

export const assignSupportTicket = async (
  actor: SupportActor,
  ticketId: string,
  assignedAdminId: string
) => {
  if (actor.type === "user" && actor.role === "ADMIN") {
    await ensureAnyAdminPermission(actor, [
      ...assignPermissions,
      ...reassignPermissions,
    ]);
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      creatorUserId: true,
      creatorCompanyId: true,
      assignedAdminId: true,
      status: true,
    },
  });

  if (!ticket) {
    throw new AppError("Support ticket not found", 404);
  }

  await ensureAnyAdminPermission(
    actor,
    ticket.assignedAdminId ? reassignPermissions : assignPermissions
  );

  const admin = await prisma.user.findUnique({
    where: { id: assignedAdminId },
    select: { id: true, role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    throw new AppError("Assigned admin not found", 404);
  }
  if (!(await isValidSupportAdmin(assignedAdminId))) {
    throw new AppError("Assigned admin is not eligible for Support", 400);
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      assignedAdminId,
      status: ticket.status === "OPEN" ? "IN_PROGRESS" : ticket.status,
    },
    select: ticketSelect,
  });

  await createNotification({
    userId: assignedAdminId,
    message: `You were assigned to ticket "${updatedTicket.subject}".`,
    type: "SUPPORT",
    supportTicketId: updatedTicket.id,
  });
  await createAuditLog({
    actorUserId: actor.id,
    action: ticket.assignedAdminId
      ? "SUPPORT_TICKET_REASSIGNED"
      : "SUPPORT_TICKET_ASSIGNED",
    resource: "SUPPORT_TICKET",
    resourceId: ticketId,
    metadata: { previousAdminId: ticket.assignedAdminId, assignedAdminId },
  });

  return updatedTicket;
};

export const unassignSupportTicket = async (
  actor: SupportActor,
  ticketId: string
) => {
  await ensureAnyAdminPermission(actor, reassignPermissions);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      creatorUserId: true,
      creatorCompanyId: true,
      assignedAdminId: true,
    },
  });

  if (!ticket) {
    throw new AppError("Support ticket not found", 404);
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { assignedAdminId: null },
    select: ticketSelect,
  });

  await createAuditLog({
    actorUserId: actor.id,
    action: "SUPPORT_TICKET_UNASSIGNED",
    resource: "SUPPORT_TICKET",
    resourceId: ticketId,
    metadata: { previousAdminId: ticket.assignedAdminId },
  });

  return updatedTicket;
};

export const updateSupportTicketStatus = async (
  actor: SupportActor,
  ticketId: string,
  status: "OPEN" | "IN_PROGRESS" | "WAITING_FOR_USER" | "RESOLVED" | "CLOSED"
) => {
  await ensureAnyAdminPermission(
    actor,
    status === "CLOSED" ? closePermissions : [PERMISSIONS.CHANGE_SUPPORT_STATUS]
  );

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      creatorUserId: true,
      creatorCompanyId: true,
      assignedAdminId: true,
      status: true,
    },
  });

  if (!ticket) {
    throw new AppError("Support ticket not found", 404);
  }
  assertValidStatusTransition(ticket.status, status);

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status },
    select: ticketSelect,
  });

  await createAuditLog({
    actorUserId: actor.id,
    action:
      status === "CLOSED"
        ? "SUPPORT_TICKET_CLOSED"
        : "SUPPORT_TICKET_STATUS_CHANGED",
    resource: "SUPPORT_TICKET",
    resourceId: ticketId,
    metadata: { status },
  });

  if (ticket.assignedAdminId) {
    await createNotification({
      userId: ticket.assignedAdminId,
      message: `Ticket "${updatedTicket.subject}" status changed to ${status}.`,
      type: "SUPPORT",
      supportTicketId: ticket.id,
    });
  }

  return updatedTicket;
};

export const updateSupportTicketPriority = async (
  actor: SupportActor,
  ticketId: string,
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
) => {
  await ensureAdminPermission(actor, PERMISSIONS.CHANGE_SUPPORT_PRIORITY);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      creatorUserId: true,
      creatorCompanyId: true,
      assignedAdminId: true,
    },
  });

  if (!ticket) {
    throw new AppError("Support ticket not found", 404);
  }

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { priority },
    select: ticketSelect,
  });

  await createAuditLog({
    actorUserId: actor.id,
    action: "SUPPORT_TICKET_PRIORITY_CHANGED",
    resource: "SUPPORT_TICKET",
    resourceId: ticketId,
    metadata: { priority },
  });

  return updatedTicket;
};

export const closeSupportTicket = async (
  actor: SupportActor,
  ticketId: string
) => {
  await ensureAnyAdminPermission(actor, closePermissions);

  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      subject: true,
      creatorUserId: true,
      creatorCompanyId: true,
      assignedAdminId: true,
      status: true,
    },
  });

  if (!ticket) {
    throw new AppError("Support ticket not found", 404);
  }
  assertValidStatusTransition(ticket.status, "CLOSED");

  const updatedTicket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { status: "CLOSED" },
    select: ticketSelect,
  });

  await createAuditLog({
    actorUserId: actor.id,
    action: "SUPPORT_TICKET_CLOSED",
    resource: "SUPPORT_TICKET",
    resourceId: ticketId,
  });

  return updatedTicket;
};

export const getSupportCategories = async (
  actor?: SupportActor,
  audience?: SupportCategoryAudience
) => {
  const where: {
    active: boolean;
    audience?: SupportCategoryAudience;
  } = {
    active: true,
  };

  if (actor) {
    if (actor.type === "company") {
      where.audience = "COMPANY";
    } else if (actor.role !== "ADMIN") {
      where.audience = "USER";
    }
  }

  if (audience) {
    where.audience = audience;
  }

  const categories = await prisma.supportCategory.findMany({
    where,
    orderBy: { name: "asc" },
    select: categorySelect,
  });

  return categories;
};

export const createSupportCategory = async (
  actor: SupportActor,
  input: {
    name: string;
    audience?: SupportCategoryAudience;
    active?: boolean;
  }
) => {
  ensureAdmin(actor);

  const categoryAudience = input.audience ?? "USER";

  const existing = await prisma.supportCategory.findFirst({
    where: {
      name: input.name.trim(),
      audience: categoryAudience,
    },
    select: { id: true },
  });

  if (existing) {
    throw new AppError("Support category already exists", 409);
  }

  return prisma.supportCategory.create({
    data: {
      name: input.name.trim(),
      audience: categoryAudience,
      active: input.active ?? true,
    },
    select: categorySelect,
  });
};

export const updateSupportCategory = async (
  actor: SupportActor,
  categoryId: string,
  input: {
    name?: string;
    audience?: SupportCategoryAudience;
    active?: boolean;
  }
) => {
  ensureAdmin(actor);

  const category = await prisma.supportCategory.findUnique({
    where: { id: categoryId },
    select: { id: true, audience: true },
  });

  if (!category) {
    throw new AppError("Support category not found", 404);
  }

  if (input.name) {
    const existing = await prisma.supportCategory.findFirst({
      where: {
        name: input.name.trim(),
        audience: input.audience ?? category.audience,
      },
      select: { id: true },
    });

    if (existing && existing.id !== categoryId) {
      throw new AppError("Support category already exists", 409);
    }
  }

  return prisma.supportCategory.update({
    where: { id: categoryId },
    data: {
      ...(input.name ? { name: input.name.trim() } : {}),
      ...(input.audience ? { audience: input.audience } : {}),
      ...(input.active !== undefined ? { active: input.active } : {}),
    },
    select: categorySelect,
  });
};

export const deleteSupportCategory = async (
  actor: SupportActor,
  categoryId: string
) => {
  ensureAdmin(actor);

  const category = await prisma.supportCategory.findUnique({
    where: { id: categoryId },
    select: { id: true },
  });

  if (!category) {
    throw new AppError("Support category not found", 404);
  }

  await prisma.supportCategory.delete({
    where: { id: categoryId },
  });

  return { message: "Support category deleted successfully" };
};
