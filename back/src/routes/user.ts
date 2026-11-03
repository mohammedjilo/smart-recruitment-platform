import Express from "express";
import { authMiddleware, requireUser } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  personalInformationUpdateSchema,
  updateProfessionalProfileSchema,
} from "@smart-recruitment/validation";
import {
  updateUserPersonalInformationController,
  getCompleteUserProfileController,
  getCompaniesController,
  getCompanyDetailsController,
  getCompanyJobsController,
  updateProfessionalProfileController,
  getDashboardUserController,
  updateUserProfilePictureController,
} from "../controllers/userControllers";
import {
  getCandidateProfileCvController,
  replaceCandidateProfileCvController,
} from "../controllers/cvAccessControllers.js";
import {
  handleUploadError,
  imageUpload,
  upload,
  validateUploadedFile,
} from "../utils/upload.js";

const userRouter = Express.Router();

userRouter.get("/profile", authMiddleware, getCompleteUserProfileController);
userRouter.put(
  "/profile",
  authMiddleware,
  validate(personalInformationUpdateSchema),
  updateUserPersonalInformationController
);
userRouter.put(
  "/profile/picture",
  authMiddleware,
  requireUser,
  handleUploadError(imageUpload.single("picture")),
  validateUploadedFile("image"),
  updateUserProfilePictureController
);
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

userRouter.put(
  "/professional-profile",
  authMiddleware,
  validate(updateProfessionalProfileSchema),
  updateProfessionalProfileController
);
userRouter.get(
  "/professional-profile/cv",
  authMiddleware,
  requireUser,
  getCandidateProfileCvController
);
userRouter.put(
  "/professional-profile/cv",
  authMiddleware,
  requireUser,
  handleUploadError(upload.single("cv")),
  validateUploadedFile("pdf"),
  replaceCandidateProfileCvController
);
userRouter.get("/dashboard", authMiddleware, getDashboardUserController);

export default userRouter;
