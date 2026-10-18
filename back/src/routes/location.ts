import Express from "express";
import { getLocationCitiesController } from "../controllers/locationControllers";
import { validate } from "../middlewares/validate";
import { getLocationCitiesQuerySchema } from "../validation/location.validation";

const locationRouter = Express.Router();
locationRouter.get(
  "/cities",
  validate(getLocationCitiesQuerySchema, "query"),
  getLocationCitiesController,
);

export default locationRouter;
