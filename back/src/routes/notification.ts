import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  deleteNotificationController,
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
notificationRouter.delete(
  "/:notificationId",
  authMiddleware,
  deleteNotificationController
);

export default notificationRouter;
