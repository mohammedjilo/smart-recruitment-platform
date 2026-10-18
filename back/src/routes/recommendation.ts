import Express from "express";
import { authMiddleware, requireUser } from "../middlewares/auth";
import { recommendedJobs } from "../controllers/recommendationControllers";

const recommendationRouter = Express.Router();
recommendationRouter.get("/", authMiddleware, requireUser, recommendedJobs);
export default recommendationRouter;
