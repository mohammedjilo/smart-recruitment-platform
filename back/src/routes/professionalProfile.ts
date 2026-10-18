import Express from "express";
import { authMiddleware } from "../middlewares/auth";
import {
    getProfessionalProfileController
  } from "../controllers/professionalProfileControllers";

const professionalProfileRouter = Express.Router();

professionalProfileRouter.get(
    "/",
    authMiddleware,
    getProfessionalProfileController
  );

  // professionalProfileRouter.get(
  //   "/isCompleted",
  //   authMiddleware,
  //   professionalProfileIsCompletedController
  // );

export default professionalProfileRouter;
