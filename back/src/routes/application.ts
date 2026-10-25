import Express from "express";
import {
  authMiddleware,
  requireApprovedCompany,
  requireCompany,
  requireUser,
} from "../middlewares/auth";
import {
  applyToJobController,
  getCompanyApplicationsController,
  getUserApplicationDetailsController,
  getUserApplicationsController,
  updateApplicationStatusController,
  withdrawApplicationController,
} from "../controllers/applicationControllers";
import {
  handleUploadError,
  upload,
  validateUploadedFile,
} from "../utils/upload";
import { validate } from "../middlewares/validate";
import {
  applicationIdParamsSchema,
  applicationListQuerySchema,
  applicationStatusSchema,
  applicationSubmissionSchema,
  companyApplicationQuerySchema,
  jobIdParamsSchema,
} from "../validation/application.validation";

const applicationRouter = Express.Router();

applicationRouter.get(
  "/me",
  authMiddleware,
  requireUser,
  validate(applicationListQuerySchema, "query"),
  getUserApplicationsController
);
applicationRouter.get(
  "/me/:applicationId",
  authMiddleware,
  requireUser,
  validate(applicationIdParamsSchema, "params"),
  getUserApplicationDetailsController
);
applicationRouter.get(
  "/company",
  authMiddleware,
  requireCompany,
  requireApprovedCompany,
  validate(companyApplicationQuerySchema, "query"),
  getCompanyApplicationsController
);
// applicationRouter.post("/:jobId", authMiddleware, applyToJobController);
applicationRouter.post(
  "/:jobId",
  authMiddleware,
  requireUser,
  validate(jobIdParamsSchema, "params"),
  handleUploadError(upload.single("cv")),
  validateUploadedFile("pdf"),
  validate(applicationSubmissionSchema),
  applyToJobController
);
applicationRouter.patch(
  "/:applicationId/status",
  authMiddleware,
  requireCompany,
  requireApprovedCompany,
  validate(applicationIdParamsSchema, "params"),
  validate(applicationStatusSchema),
  updateApplicationStatusController
);
applicationRouter.patch(
  "/:applicationId/withdraw",
  authMiddleware,
  requireUser,
  validate(applicationIdParamsSchema, "params"),
  withdrawApplicationController
);
export default applicationRouter;
