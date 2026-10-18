import Express from "express";
import { authMiddleware, requireAdmin } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createSkillController,
  updateSkillController,
  deleteSkillController,
  addUserSkillsController,
  updateUserSkillsController,
  removeUserSkillController,
} from "../controllers/skillControllers";
import {
  userSkillsSchema,
  updateSkillSchema,
} from "../validation/skill.validation";

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
skillRouter.delete("/me/:skillId", authMiddleware, removeUserSkillController);
skillRouter.put(
  "/:skillId",
  authMiddleware,
  requireAdmin,
  validate(updateSkillSchema),
  updateSkillController
);
skillRouter.delete(
  "/:skillId",
  authMiddleware,
  requireAdmin,
  deleteSkillController
);

export default skillRouter;
