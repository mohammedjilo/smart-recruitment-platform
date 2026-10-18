import Express from "express";
import { authMiddleware, requireAdmin } from "../middlewares/auth";
import {
  createLanguageController,
  deleteLanguageController,
  getLanguagesController,
  updateLanguageController,
} from "../controllers/languageControllers";

const languageRouter = Express.Router();

languageRouter.get("/", authMiddleware, getLanguagesController);
languageRouter.post(
  "/",
  authMiddleware,
  requireAdmin,
  createLanguageController
);
languageRouter.put(
  "/:languageId",
  authMiddleware,
  requireAdmin,
  updateLanguageController
);
languageRouter.delete(
  "/:languageId",
  authMiddleware,
  requireAdmin,
  deleteLanguageController
);

export default languageRouter;
