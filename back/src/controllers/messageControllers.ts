import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError";
import { parsePagination } from "../utils/pagination";
import {
  getCompanyConversations,
  getConversationMessages,
  getUserMessages,
  markConversationAsRead,
  sendApplicationMessage,
} from "../services/message.service";
import { sendSuccess } from "../utils/apiResponse";

/**
 * Message HTTP adapter. It validates participant-bound requests and delegates
 * message ownership, pagination, and read-state rules to the service layer.
 */

export const sendMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.company?.id;
    const applicationId = (req.params.applicationId ||
      req.body.applicationId) as string | undefined;
    const content = req.body.content as string | undefined;

    if (!userId && !companyId) {
      throw new AppError("Authentication required", 401);
    }

    if (!applicationId) {
      throw new AppError("Application id is required", 400);
    }

    if (!content || !content.trim()) {
      throw new AppError("Message content is required", 400);
    }

    const actor = userId
      ? { type: "user" as const, id: userId }
      : { type: "company" as const, id: companyId! };
    const message = await sendApplicationMessage(actor, applicationId, content);

    sendSuccess(res, 201, message, { message: "Message sent successfully" });
  }
);

export const getUserMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.company?.id;

    if (companyId) {
      const pagination = parsePagination(
        req.query as Record<string, string | string[] | undefined>
      );
      const conversations = await getCompanyConversations(
        companyId,
        pagination.page,
        pagination.pageSize
      );

      sendSuccess(res, 200, conversations.data, { meta: conversations.meta });
      return;
    }

    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const pagination = parsePagination(
      req.query as Record<string, string | string[] | undefined>
    );
    const messages = await getUserMessages(
      userId,
      pagination.page,
      pagination.pageSize
    );

    sendSuccess(res, 200, messages.data, { meta: messages.meta });
  }
);

export const getCompanyMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const companyId = req.company?.id;

    if (!companyId) {
      throw new AppError("Company authentication required", 401);
    }

    const pagination = parsePagination(
      req.query as Record<string, string | string[] | undefined>
    );
    const conversations = await getCompanyConversations(
      companyId,
      pagination.page,
      pagination.pageSize
    );

    sendSuccess(res, 200, conversations.data, { meta: conversations.meta });
  }
);

export const getConversationMessagesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.company?.id;
    const { conversationId } = req.params as { conversationId?: string };

    if (!userId && !companyId) {
      throw new AppError("Authentication required", 401);
    }

    if (!conversationId) {
      throw new AppError("Conversation id is required", 400);
    }

    const before = req.query.before;
    if (before !== undefined && typeof before !== "string") {
      throw new AppError("Invalid message cursor", 400);
    }
    const actor = userId
      ? { type: "user" as const, id: userId }
      : { type: "company" as const, id: companyId! };
    const messages = await getConversationMessages(
      actor,
      conversationId,
      before
    );

    sendSuccess(res, 200, messages);
  }
);

export const markConversationAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const companyId = req.company?.id;
    const { conversationId } = req.params as { conversationId?: string };

    if (!userId && !companyId) {
      throw new AppError("Authentication required", 401);
    }

    if (!conversationId) {
      throw new AppError("Conversation id is required", 400);
    }

    const actor = userId
      ? { type: "user" as const, id: userId }
      : { type: "company" as const, id: companyId! };
    const result = await markConversationAsRead(actor, conversationId);

    sendSuccess(res, 200, undefined, { message: result.message });
  }
);
