import Express from "express";
import { authMiddleware } from "../middlewares/auth";
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
} from "../controllers/userControllers";

const userRouter = Express.Router();

userRouter.get("/profile", authMiddleware, getCompleteUserProfileController);
userRouter.put(
  "/profile",
  authMiddleware,
  validate(personalInformationUpdateSchema),
  updateUserPersonalInformationController
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
userRouter.get("/dashboard", authMiddleware, getDashboardUserController);

export default userRouter;
