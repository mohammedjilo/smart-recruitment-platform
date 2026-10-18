import Express from "express";
import {
  addSupportMessageController,
  createSupportTicketController,
  getMySupportTicketsController,
  getSupportOnlyCategoriesController,
  getSupportTicketByIdController,
} from "../controllers/supportControllers.js";
import { getSupportOnlySessionController } from "../controllers/supportOnlyControllers.js";
import { requireSupportOnlyAccess } from "../middlewares/supportOnlyAuth.js";
import { validate } from "../middlewares/validate.js";
import {
  addSupportMessageSchema,
  createSupportTicketSchema,
} from "../validation/support.validation.js";

const supportOnlyRouter = Express.Router();
supportOnlyRouter.use(requireSupportOnlyAccess);

supportOnlyRouter.get("/session", getSupportOnlySessionController);
supportOnlyRouter.get("/categories", getSupportOnlyCategoriesController);
supportOnlyRouter.get("/tickets", getMySupportTicketsController);
supportOnlyRouter.post(
  "/tickets",
  validate(createSupportTicketSchema),
  createSupportTicketController
);
supportOnlyRouter.get("/tickets/:ticketId", getSupportTicketByIdController);
supportOnlyRouter.post(
  "/tickets/:ticketId/messages",
  validate(addSupportMessageSchema),
  addSupportMessageController
);

export default supportOnlyRouter;
