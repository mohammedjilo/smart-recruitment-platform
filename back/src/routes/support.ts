import Express from "express";
import { authMiddleware, requireAdmin } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  addSupportMessageSchema,
  assignSupportTicketSchema,
  createSupportTicketSchema,
  supportAdminTicketsQuerySchema,
  updateSupportTicketPrioritySchema,
  updateSupportTicketStatusSchema,
} from "../validation/support.validation";
import {
  addSupportMessageController,
  assignSupportTicketController,
  createSupportTicketController,
  getMySupportTicketsController,
  getSupportCategoriesController,
  getSupportDashboardController,
  getSupportTicketByIdController,
  listAllSupportTicketsController,
  unassignSupportTicketController,
  updateSupportTicketPriorityController,
  updateSupportTicketStatusController,
} from "../controllers/supportControllers";

const supportRouter = Express.Router();

supportRouter.use(authMiddleware);

supportRouter.post(
  "/tickets",
  validate(createSupportTicketSchema),
  createSupportTicketController
);
supportRouter.get("/tickets", getMySupportTicketsController);
supportRouter.get("/tickets/:ticketId", getSupportTicketByIdController);
supportRouter.post(
  "/tickets/:ticketId/messages",
  validate(addSupportMessageSchema),
  addSupportMessageController
);
supportRouter.get("/categories", getSupportCategoriesController);

supportRouter.get(
  "/admin/dashboard",
  requireAdmin,
  getSupportDashboardController
);
supportRouter.get(
  "/admin/tickets",
  requireAdmin,
  validate(supportAdminTicketsQuerySchema, "query"),
  listAllSupportTicketsController
);
supportRouter.patch(
  "/admin/tickets/:ticketId/assign",
  requireAdmin,
  validate(assignSupportTicketSchema),
  assignSupportTicketController
);
supportRouter.patch(
  "/admin/tickets/:ticketId/unassign",
  requireAdmin,
  unassignSupportTicketController
);
supportRouter.patch(
  "/admin/tickets/:ticketId/status",
  requireAdmin,
  validate(updateSupportTicketStatusSchema),
  updateSupportTicketStatusController
);
supportRouter.patch(
  "/admin/tickets/:ticketId/priority",
  requireAdmin,
  validate(updateSupportTicketPrioritySchema),
  updateSupportTicketPriorityController
);
export default supportRouter;
