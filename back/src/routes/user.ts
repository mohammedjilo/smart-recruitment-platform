import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import {
  handleUploadError,
  imageUpload,
  validateUploadedFile,
} from "../utils/upload";
import { validate } from "../middlewares/validate";
import {
  professionalProfileSchema,
  updateProfessionalProfileSchema,
} from "../validation/professionalProfile.validation";
import {
  updateUserPhotoController,
  getCompleteUserProfileController,
  getCompaniesController,
  getCompanyDetailsController,
  getCompanyJobsController,
  upsertProfessionalProfileController,
  getDashboardUserController,
} from "../controllers/userControllers";

const userRouter = Express.Router();

userRouter.get("/profile", authMiddleware, getCompleteUserProfileController);
userRouter.get(
  "/profile/:userId",
  authMiddleware,
  getCompleteUserProfileController
);
userRouter.get("/companies", authMiddleware, getCompaniesController);
userRouter.get(
  "/companies/:companyId",
  authMiddleware,
  getCompanyDetailsController
);
userRouter.get(
  "/companies/:companyId/jobs",
  authMiddleware,
  getCompanyJobsController
);

userRouter.post(
  "/photo",
  authMiddleware,
  handleUploadError(imageUpload.single("photo")),
  validateUploadedFile("image"),
  updateUserPhotoController
);

userRouter.put(
  "/professional-profile",
  authMiddleware,
  validate(updateProfessionalProfileSchema),
  upsertProfessionalProfileController
);

userRouter.post(
  "/professional-profile",
  authMiddleware,
  validate(professionalProfileSchema),
  upsertProfessionalProfileController
);
userRouter.get("/dashboard", authMiddleware, getDashboardUserController);

export default userRouter;
