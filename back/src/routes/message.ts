import Express from "express";
import {
  authMiddleware,
  requireApprovedCompanyIfCompany,
} from "../middlewares/auth";
import {
  getCompanyMessagesController,
  getConversationMessagesController,
  getUserMessagesController,
  markConversationAsReadController,
  sendMessageController,
} from "../controllers/messageControllers";
import { sendMessageSchema } from "@smart-recruitment/validation";
import { validate } from "../middlewares/validate";

const messageRouter = Express.Router();

messageRouter.post(
  "/application/:applicationId",
  authMiddleware,
  requireApprovedCompanyIfCompany,
  validate(sendMessageSchema),
  sendMessageController
);
messageRouter.post(
  "/",
  authMiddleware,
  requireApprovedCompanyIfCompany,
  validate(sendMessageSchema),
  sendMessageController
);
messageRouter.get(
  "/",
  authMiddleware,
  requireApprovedCompanyIfCompany,
  getUserMessagesController
);
messageRouter.get(
  "/company",
  authMiddleware,
  requireApprovedCompanyIfCompany,
  getCompanyMessagesController
);
messageRouter.get(
  "/conversation/:conversationId",
  authMiddleware,
  requireApprovedCompanyIfCompany,
  getConversationMessagesController
);
messageRouter.patch(
  "/conversation/:conversationId/read",
  authMiddleware,
  requireApprovedCompanyIfCompany,
  markConversationAsReadController
);

export default messageRouter;
