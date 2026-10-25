import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  addUserLanguageController,
  updateUserLanguageController,
} from "../controllers/userLanguageControllers";

const userLanguageRouter = Express.Router();

userLanguageRouter.post("/", authMiddleware, addUserLanguageController);
userLanguageRouter.put(
  "/:userLanguageId",
  authMiddleware,
  updateUserLanguageController
);
export default userLanguageRouter;
