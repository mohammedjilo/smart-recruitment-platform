import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import {
  createCertificateController,
  updateCertificateController,
  deleteCertificateController,
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
certificateRouter.delete(
  "/:certificateId",
  authMiddleware,
  deleteCertificateController
);

export default certificateRouter;
