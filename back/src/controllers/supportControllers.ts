import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AppError } from "../utils/appError.js";
import {
  addSupportMessage,
  assignSupportTicket,
  createSupportTicket,
  getMySupportTickets,
  getSupportCategories,
  getSupportTicketById,
  getSupportDashboard,
  listAllSupportTickets,
  unassignSupportTicket,
  updateSupportTicketPriority,
  updateSupportTicketStatus,
} from "../services/support.service.js";
import { sendSuccess } from "../utils/apiResponse";

const getSupportActor = (req: Request) => {
  if (req.user) {
    return {
      type: "user" as const,
      id: req.user.id,
      role: req.user.role,
    };
  }

  if (req.company) {
    return {
      type: "company" as const,
      id: req.company.id,
    };
  }

  throw new AppError("Authentication required", 401);
};

/**
 * @desc Get the support administration dashboard
 * @route /api/support/admin/dashboard
 * @method GET
 * @access private
 */
export const getSupportDashboardController = asyncHandler(
  async (req: Request, res: Response) => {
    sendSuccess(res, 200, await getSupportDashboard(getSupportActor(req)));
  }
);

/**
 * @desc Create a support ticket
 * @route /api/support/tickets
 * @route /api/support-only/tickets
 * @method POST
 * @access private
 */
export const createSupportTicketController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const ticket = await createSupportTicket(actor, req.body as any);

    sendSuccess(res, 201, ticket, {
      message: "Support ticket created successfully",
    });
  }
);

/**
 * @desc List support tickets belonging to the authenticated account
 * @route /api/support/tickets
 * @route /api/support-only/tickets
 * @method GET
 * @access private
 */
export const getMySupportTicketsController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);

    const result = await getMySupportTickets(actor, page, pageSize);

    sendSuccess(res, 200, result.data, { meta: result.meta });
  }
);

/**
 * @desc Get a support ticket by ID
 * @route /api/support/tickets/:ticketId
 * @route /api/support-only/tickets/:ticketId
 * @method GET
 * @access private
 */
export const getSupportTicketByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const ticket = await getSupportTicketById(
      actor,
      req.params.ticketId as string
    );

    sendSuccess(res, 200, ticket);
  }
);

/**
 * @desc Add a message to a support ticket
 * @route /api/support/tickets/:ticketId/messages
 * @route /api/support-only/tickets/:ticketId/messages
 * @method POST
 * @access private
 */
export const addSupportMessageController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const message = await addSupportMessage(
      actor,
      req.params.ticketId as string,
      req.body.content as string,
      req.body.requiresUserResponse === true
    );

    sendSuccess(res, 201, message, {
      message: "Support message added successfully",
    });
  }
);

/**
 * @desc List support categories available to the authenticated account
 * @route /api/support/categories
 * @method GET
 * @access private
 */
export const getSupportCategoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const audience = req.query.audience as "USER" | "COMPANY" | undefined;

    const categories = await getSupportCategories(actor, audience);

    sendSuccess(res, 200, categories);
  }
);

/**
 * @desc List support categories available in support-only mode
 * @route /api/support-only/categories
 * @method GET
 * @access private
 */
export const getSupportOnlyCategoriesController = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await getSupportCategories(getSupportActor(req));

    sendSuccess(res, 200, categories);
  }
);

/**
 * @desc List and filter all support tickets for administrators
 * @route /api/support/admin/tickets
 * @method GET
 * @access private
 */
export const listAllSupportTicketsController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const page = Number(req.query.page ?? 1);
    const pageSize = Number(req.query.pageSize ?? 20);

    const result = await listAllSupportTickets(actor, page, pageSize, {
      search:
        typeof req.query.search === "string" ? req.query.search : undefined,
      status:
        typeof req.query.status === "string"
          ? (req.query.status as
              | "OPEN"
              | "IN_PROGRESS"
              | "WAITING_FOR_USER"
              | "RESOLVED"
              | "CLOSED")
          : undefined,
      priority:
        typeof req.query.priority === "string"
          ? (req.query.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT")
          : undefined,
      audience:
        typeof req.query.audience === "string"
          ? (req.query.audience as "USER" | "COMPANY")
          : undefined,
      categoryId:
        typeof req.query.categoryId === "string"
          ? req.query.categoryId
          : undefined,
      assignedAdminId:
        typeof req.query.assignedAdminId === "string"
          ? req.query.assignedAdminId
          : undefined,
    });

    sendSuccess(res, 200, result.data, {
      meta: result.meta,
      stats: result.stats,
    });
  }
);

/**
 * @desc Assign a support ticket to an administrator
 * @route /api/support/admin/tickets/:ticketId/assign
 * @method PATCH
 * @access private
 */
export const assignSupportTicketController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const ticket = await assignSupportTicket(
      actor,
      req.params.ticketId as string,
      req.body.assignedAdminId as string
    );

    sendSuccess(res, 200, ticket, {
      message: "Support ticket assigned successfully",
    });
  }
);

/**
 * @desc Remove the administrator assigned to a support ticket
 * @route /api/support/admin/tickets/:ticketId/unassign
 * @method PATCH
 * @access private
 */
export const unassignSupportTicketController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const ticket = await unassignSupportTicket(
      actor,
      req.params.ticketId as string
    );

    sendSuccess(res, 200, ticket, {
      message: "Support ticket unassigned successfully",
    });
  }
);

/**
 * @desc Update the status of a support ticket
 * @route /api/support/admin/tickets/:ticketId/status
 * @method PATCH
 * @access private
 */
export const updateSupportTicketStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const ticket = await updateSupportTicketStatus(
      actor,
      req.params.ticketId as string,
      req.body.status as any
    );

    sendSuccess(res, 200, ticket, {
      message: "Support ticket status updated successfully",
    });
  }
);

/**
 * @desc Update the priority of a support ticket
 * @route /api/support/admin/tickets/:ticketId/priority
 * @method PATCH
 * @access private
 */
export const updateSupportTicketPriorityController = asyncHandler(
  async (req: Request, res: Response) => {
    const actor = getSupportActor(req);
    const ticket = await updateSupportTicketPriority(
      actor,
      req.params.ticketId as string,
      req.body.priority as any
    );

    sendSuccess(res, 200, ticket, {
      message: "Support ticket priority updated successfully",
    });
  }
);
