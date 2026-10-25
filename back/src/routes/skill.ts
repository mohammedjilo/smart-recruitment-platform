import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  addUserSkillsController,
  updateUserSkillsController,
} from "../controllers/skillControllers";
import { userSkillsSchema } from "../validation/skill.validation";

const skillRouter = Express.Router();

skillRouter.post(
  "/me",
  authMiddleware,
  validate(userSkillsSchema),
  addUserSkillsController
);
skillRouter.put(
  "/me",
  authMiddleware,
  validate(userSkillsSchema),
  updateUserSkillsController
);
export default skillRouter;
