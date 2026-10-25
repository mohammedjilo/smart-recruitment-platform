import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  getNotificationsController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from "../controllers/notificationControllers";

const notificationRouter = Express.Router();

notificationRouter.get("/", authMiddleware, getNotificationsController);
notificationRouter.patch(
  "/read-all",
  authMiddleware,
  markAllNotificationsAsReadController
);
notificationRouter.patch(
  "/:notificationId/read",
  authMiddleware,
  markNotificationAsReadController
);
export default notificationRouter;
