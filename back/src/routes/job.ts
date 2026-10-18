import Express from "express";
import {
  getJobsController,
  createJobController,
  getJobByIdController,
  getQuestionsController,
  getBasicInformationsController,
  updateJobStatusController,
} from "../controllers/jobControllers";
import {
  authMiddleware,
  requireApprovedCompany,
  requireUser,
} from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createJobSchema,
  updateJobStatusSchema,
} from "../validation/job.validation";
import {
  getSaveJobsController,
  toggleSaveJobsController,
} from "../controllers/savedJobsControllers";
const jobRouter = Express.Router();

jobRouter.get("/", authMiddleware, requireUser, getJobsController);
jobRouter.post(
  "/",
  authMiddleware,
  requireApprovedCompany,
  validate(createJobSchema),
  createJobController
);
jobRouter.patch(
  "/:id/status",
  authMiddleware,
  requireApprovedCompany,
  validate(updateJobStatusSchema),
  updateJobStatusController
);
jobRouter.get(
  "/info",
  authMiddleware,
  requireUser,
  getBasicInformationsController
);
jobRouter.get("/saved", authMiddleware, requireUser, getSaveJobsController);
jobRouter.post(
  "/saved/toggle",
  authMiddleware,
  requireUser,
  toggleSaveJobsController
);

jobRouter.get(
  "/:id/questions",
  authMiddleware,
  requireUser,
  getQuestionsController
);
jobRouter.get("/:id/:slug", authMiddleware, requireUser, getJobByIdController);

export default jobRouter;
