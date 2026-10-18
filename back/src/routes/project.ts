import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createProjectController,
  updateProjectController,
  deleteProjectController,
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
projectRouter.delete("/:projectId", authMiddleware, deleteProjectController);

export default projectRouter;
