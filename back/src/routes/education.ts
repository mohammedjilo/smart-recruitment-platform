import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createEducationController,
  updateEducationController,
} from "../controllers/educationControllers";
import {
  educationSchema,
  updateEducationSchema,
} from "../validation/education.validation";

const educationRouter = Express.Router();

educationRouter.post(
  "/",
  authMiddleware,
  validate(educationSchema),
  createEducationController
);
educationRouter.put(
  "/:educationId",
  authMiddleware,
  validate(updateEducationSchema),
  updateEducationController
);
export default educationRouter;
