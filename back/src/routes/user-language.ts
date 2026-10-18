import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  addUserLanguageController,
  deleteUserLanguageController,
  getUserLanguagesController,
  updateUserLanguageController,
} from "../controllers/userLanguageControllers";

const userLanguageRouter = Express.Router();

userLanguageRouter.get("/", authMiddleware, getUserLanguagesController);
userLanguageRouter.post("/", authMiddleware, addUserLanguageController);
userLanguageRouter.put(
  "/:userLanguageId",
  authMiddleware,
  updateUserLanguageController
);
userLanguageRouter.delete(
  "/:userLanguageId",
  authMiddleware,
  deleteUserLanguageController
);

export default userLanguageRouter;
