import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { buildPaginationMeta, parsePagination } from "../utils/pagination";
import { createNotification } from "./notification.service";

type MessageActor =
  | { type: "user"; id: string }
  | { type: "company"; id: string };

const CONVERSATION_MESSAGE_BATCH_SIZE = 10;

const messageSummarySelect = {
  id: true,
  content: true,
  isRead: true,
  readByUser: true,
  readByCompany: true,
  createdAt: true,
  updatedAt: true,
  conversationId: true,
  senderUserId: true,
  senderCompanyId: true,
  senderUser: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      profilePicUrl: true,
    },
  },
  senderCompany: {
    select: {
      id: true,
      companyName: true,
      email: true,
      logoUrl: true,
    },
  },
} as const;

const resolveSenderName = (message: {
  senderUser?: { firstName?: string | null; lastName?: string | null } | null;
  senderCompany?: { companyName?: string | null } | null;
}) => {
  if (message.senderUser) {
    return `${message.senderUser.firstName ?? ""} ${message.senderUser.lastName ?? ""}`.trim();
  }

  if (message.senderCompany) {
    return message.senderCompany.companyName ?? "Company";
  }

  return "System";
};

const assertValidApplicationForUserCompany = async (
  actor: MessageActor,
  applicationId: string
) => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      id: true,
      userId: true,
      job: {
        select: {
          id: true,
          companyId: true,
          title: true,
        },
      },
    },
  });

  if (!application) {
    throw new AppError("Application not found", 404);
  }

  if (actor.type === "user") {
    if (application.userId !== actor.id) {
      throw new AppError("You do not own this application", 403);
    }
    return {
      userId: actor.id,
      companyId: application.job.companyId,
      applicationId: application.id,
      jobTitle: application.job.title,
    };
  }

  if (application.job.companyId !== actor.id) {
    throw new AppError("This application does not belong to your company", 403);
  }

  return {
    userId: application.userId,
    companyId: actor.id,
    applicationId: application.id,
    jobTitle: application.job.title,
  };
};

const getOrCreateConversationForApplication = async (
  actor: MessageActor,
  applicationId: string
) => {
  const context = await assertValidApplicationForUserCompany(
    actor,
    applicationId
  );

  const conversation = await prisma.conversation.upsert({
    where: {
      userId_companyId_applicationId: {
        userId: context.userId,
        companyId: context.companyId,
        applicationId: context.applicationId,
      },
    },
    update: {},
    create: {
      userId: context.userId,
      companyId: context.companyId,
      applicationId: context.applicationId,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true },
      },
      company: {
        select: { id: true, companyName: true, logoUrl: true },
      },
      application: {
        select: { id: true, status: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return conversation;
};

const ensureConversationParticipant = async (
  actor: MessageActor,
  conversationId: string
) => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: {
      id: true,
      userId: true,
      companyId: true,
    },
  });

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  if (actor.type === "user" && conversation.userId !== actor.id) {
    throw new AppError("You are not a participant in this conversation", 403);
  }

  if (actor.type === "company" && conversation.companyId !== actor.id) {
    throw new AppError("You are not a participant in this conversation", 403);
  }

  return conversation;
};

export const sendApplicationMessage = async (
  actor: MessageActor,
  applicationId: string,
  content: string
) => {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new AppError("Message content is required", 400);
  }

  const conversation = await getOrCreateConversationForApplication(
    actor,
    applicationId
  );

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      content: trimmed,
      isRead: false,
      readByUser: actor.type === "user",
      readByCompany: actor.type === "company",
      senderId: actor.type === "user" ? actor.id : null,
      receiverId: null,
      senderUserId: actor.type === "user" ? actor.id : null,
      senderCompanyId: actor.type === "company" ? actor.id : null,
    },
    select: messageSummarySelect,
  });

  if (actor.type === "user") {
    await createNotification({
      companyId: conversation.companyId,
      message: `New message from ${conversation.user.firstName} ${conversation.user.lastName}.`,
      type: "MESSAGE",
      conversationId: conversation.id,
    });
  } else {
    await createNotification({
      userId: conversation.userId,
      message: `New message from ${conversation.company.companyName}.`,
      type: "MESSAGE",
      conversationId: conversation.id,
    });
  }

  return message;
};

export const getUserConversations = async (
  userId: string,
  page = 1,
  pageSize = 20
) => {
  const pagination = parsePagination({ page, pageSize }, pageSize);
  const [data, totalCount] = await Promise.all([
    prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: pagination.pageSize,
      select: {
        id: true,
        userId: true,
        companyId: true,
        applicationId: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: { id: true, companyName: true, logoUrl: true },
        },
        application: {
          select: { id: true, job: { select: { id: true, title: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: messageSummarySelect,
        },
      },
    }),
    prisma.conversation.count({ where: { userId } }),
  ]);

  const conversations = data.map((conversation) => ({
    ...conversation,
    unreadCount: conversation.messages.filter((message) => {
      return message.senderCompanyId !== null && !message.readByUser;
    }).length,
    lastMessage: conversation.messages[0] ?? null,
  }));

  return {
    data: conversations,
    meta: buildPaginationMeta(pagination.page, pagination.pageSize, totalCount),
  };
};

export const getCompanyConversations = async (
  companyId: string,
  page = 1,
  pageSize = 20
) => {
  const pagination = parsePagination({ page, pageSize }, pageSize);
  const [data, totalCount] = await Promise.all([
    prisma.conversation.findMany({
      where: { companyId },
      orderBy: { updatedAt: "desc" },
      skip: pagination.skip,
      take: pagination.pageSize,
      select: {
        id: true,
        userId: true,
        companyId: true,
        applicationId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePicUrl: true,
          },
        },
        application: {
          select: { id: true, job: { select: { id: true, title: true } } },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: messageSummarySelect,
        },
      },
    }),
    prisma.conversation.count({ where: { companyId } }),
  ]);

  const conversations = data.map((conversation) => ({
    ...conversation,
    unreadCount: conversation.messages.filter((message) => {
      return message.senderUserId !== null && !message.readByCompany;
    }).length,
    lastMessage: conversation.messages[0] ?? null,
  }));

  return {
    data: conversations,
    meta: buildPaginationMeta(pagination.page, pagination.pageSize, totalCount),
  };
};

export const getConversationMessages = async (
  actor: MessageActor,
  conversationId: string,
  before?: string
) => {
  await ensureConversationParticipant(actor, conversationId);
  const cursor = before
    ? await prisma.message.findFirst({
        where: { id: before, conversationId },
        select: { id: true, createdAt: true },
      })
    : null;

  if (before && !cursor) {
    throw new AppError(
      "Message cursor does not belong to this conversation",
      400
    );
  }

  const cursorFilter = cursor
    ? {
        OR: [
          { createdAt: { lt: cursor.createdAt } },
          { createdAt: cursor.createdAt, id: { lt: cursor.id } },
        ],
      }
    : {};
  const messages = await prisma.message.findMany({
    where: { conversationId, ...cursorFilter },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: CONVERSATION_MESSAGE_BATCH_SIZE + 1,
    select: messageSummarySelect,
  });

  const hasMore = messages.length > CONVERSATION_MESSAGE_BATCH_SIZE;

  return {
    messages: messages.slice(0, CONVERSATION_MESSAGE_BATCH_SIZE).reverse(),
    hasMore,
  };
};

export const markConversationAsRead = async (
  actor: MessageActor,
  conversationId: string
) => {
  const conversation = await ensureConversationParticipant(
    actor,
    conversationId
  );

  if (actor.type === "user") {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderCompanyId: { not: null },
        readByUser: false,
      },
      data: { readByUser: true, isRead: true },
    });
  } else {
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderUserId: { not: null },
        readByCompany: false,
      },
      data: { readByCompany: true, isRead: true },
    });
  }

  return {
    message: "Conversation marked as read",
    conversation,
  };
};

export const getUserMessages = async (
  userId: string,
  page = 1,
  pageSize = 20
) => {
  return getUserConversations(userId, page, pageSize);
};
