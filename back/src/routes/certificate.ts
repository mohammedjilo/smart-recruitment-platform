import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createCertificateController,
  updateCertificateController,
} from "../controllers/certificateControllers";
import {
  certificateSchema,
  updateCertificateSchema,
} from "../validation/certificate.validation";

const certificateRouter = Express.Router();

certificateRouter.post(
  "/",
  authMiddleware,
  validate(certificateSchema),
  createCertificateController
);
certificateRouter.put(
  "/:certificateId",
  authMiddleware,
  validate(updateCertificateSchema),
  updateCertificateController
);
export default certificateRouter;
