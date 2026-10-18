import Express from "express";
import {
  createJobController,
  deleteJobController,
  getDashboardCompanyController,
  getCompanyJobsController,
  getCompanyJobByIdController,
  getCompanyProfileController,
  getCompanyUsersController,
  updateCompanyProfileController,
  updateJobController,
  uploadCompanyLogoController,
} from "../controllers/companyControllers";
import { validate } from "../middlewares/validate";
import {
  createJobSchema,
  updateCompanyProfileSchema,
  updateJobSchema,
} from "../validation/company.validation";
import { authMiddleware, requireApprovedCompany } from "../middlewares/auth";
import {
  handleUploadError,
  imageUpload,
  upload,
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
companyRouter.post(
  "/logo",
  authMiddleware,
  requireApprovedCompany,
  handleUploadError(imageUpload.single("logo")),
  validateUploadedFile("image"),
  uploadCompanyLogoController
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
companyRouter.get(
  "/jobs/:id",
  authMiddleware,
  requireApprovedCompany,
  getCompanyJobByIdController
);
companyRouter.post(
  "/jobs",
  authMiddleware,
  requireApprovedCompany,
  validate(createJobSchema),
  createJobController
);
companyRouter.put(
  "/jobs/:id",
  authMiddleware,
  requireApprovedCompany,
  validate(updateJobSchema),
  updateJobController
);
companyRouter.delete(
  "/jobs/:id",
  authMiddleware,
  requireApprovedCompany,
  deleteJobController
);

export default companyRouter;
