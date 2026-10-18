import Express from "express";
import rateLimit from "express-rate-limit";
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
  supportAccessController,
  supportAccessLogoutController,
} from "../controllers/authControllers";
import { validate } from "../middlewares/validate";
import {
  handleUploadError,
  imageUpload,
  validateUploadedFile,
} from "../utils/upload";
import { loginSchema, registerSchema } from "../validation/auth.validation";

const authRouter = Express.Router();
const supportAccessLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const registerUpload = imageUpload.fields([
  { name: "image", maxCount: 1 },
  { name: "logo", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

authRouter.post(
  "/register",
  handleUploadError(registerUpload),
  validateUploadedFile("image"),
  validate(registerSchema),
  registerController
);
authRouter.post("/login", validate(loginSchema), loginController);
authRouter.post(
  "/support-access",
  supportAccessLimit,
  validate(loginSchema),
  supportAccessController
);
authRouter.post("/support-access/logout", supportAccessLogoutController);
authRouter.post("/refresh", refreshController);
authRouter.post("/logout", logoutController);

export default authRouter;
