import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createProjectController,
  updateProjectController,
} from "../controllers/projectControllers";
import {
  projectSchema,
  updateProjectSchema,
} from "../validation/project.validation";

const projectRouter = Express.Router();

projectRouter.post(
  "/",
  authMiddleware,
  validate(projectSchema),
  createProjectController
);
projectRouter.put(
  "/:projectId",
  authMiddleware,
  validate(updateProjectSchema),
  updateProjectController
);
export default projectRouter;
