import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createExperienceController,
  updateExperienceController,
} from "../controllers/experienceControllers";
import {
  experienceSchema,
  updateExperienceSchema,
} from "../validation/experience.validation";

const experienceRouter = Express.Router();

experienceRouter.post(
  "/",
  authMiddleware,
  validate(experienceSchema),
  createExperienceController
);
experienceRouter.put(
  "/:experienceId",
  authMiddleware,
  validate(updateExperienceSchema),
  updateExperienceController
);
export default experienceRouter;
