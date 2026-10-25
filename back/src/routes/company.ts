import Express from "express";
import {
  getDashboardCompanyController,
  getCompanyJobsController,
  getCompanyJobByIdController,
  getCompanyProfileController,
  getCompanyUsersController,
  updateCompanyProfileController,
  updateJobController,
} from "../controllers/companyControllers";
import { validate } from "../middlewares/validate";
import {
  updateCompanyProfileSchema,
  updateJobSchema,
} from "../validation/company.validation";
import { authMiddleware, requireApprovedCompany } from "../middlewares/auth";
import {
  handleUploadError,
  imageUpload,
  validateUploadedFile,
} from "../utils/upload";

const companyRouter = Express.Router();
companyRouter.get(
  "/dashboard",
  authMiddleware,
  requireApprovedCompany,
  getDashboardCompanyController
);
companyRouter.put(
  "/profile",
  authMiddleware,
  requireApprovedCompany,
  handleUploadError(imageUpload.single("logo")),
  validateUploadedFile("image"),
  validate(updateCompanyProfileSchema),
  updateCompanyProfileController
);
companyRouter.get(
  "/profile",
  authMiddleware,
  requireApprovedCompany,
  getCompanyProfileController
);
companyRouter.get(
  "/users",
  authMiddleware,
  requireApprovedCompany,
  getCompanyUsersController
);
companyRouter.get(
  "/jobs",
  authMiddleware,
  requireApprovedCompany,
  getCompanyJobsController
);
companyRouter.get(
  "/jobs/:id/:slug",
  authMiddleware,
  requireApprovedCompany,
  getCompanyJobByIdController
);
companyRouter.put(
  "/jobs/:id",
  authMiddleware,
  requireApprovedCompany,
  validate(updateJobSchema),
  updateJobController
);
export default companyRouter;
