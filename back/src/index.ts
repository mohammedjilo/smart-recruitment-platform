import "dotenv/config";
import Express, { type Router } from "express";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import cors from "cors";
import { globalErrorHandler, notFoundHandler } from "./middlewares/error.js";
import { apiContract } from "./middlewares/apiContract";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth";
import companyRouter from "./routes/company";
import userRouter from "./routes/user";
import educationRouter from "./routes/education";
import experienceRouter from "./routes/experience";
import projectRouter from "./routes/project";
import certificateRouter from "./routes/certificate";
import skillRouter from "./routes/skill";
import adminRouter from "./routes/admin";
import languageRouter from "./routes/language";
import userLanguageRouter from "./routes/user-language";
import applicationRouter from "./routes/application";
import notificationRouter from "./routes/notification";
import messageRouter from "./routes/message";
import recommendationRouter from "./routes/recommendation";
import professionalProfileRouter from "./routes/professionalProfile";
import supportRouter from "./routes/support";
import supportOnlyRouter from "./routes/supportOnly.js";
import jobRouter from "./routes/job";
import locationRouter from "./routes/location";
import { startJobExpirationScheduler } from "./infrastructure/jobExpirationScheduler.js";
import {
  getErrorDiagnostics,
  writeStructuredLog,
} from "./utils/structuredLogger.js";

/**
 * Application composition root. This file wires middleware, domain routers,
 * and infrastructure startup; business rules belong below this boundary.
 */

export const createApp = (testRoutes?: Router) => {
  const app = Express();
  app.use((req, _res, next) => {
    req.requestId = req.header("x-request-id") || crypto.randomUUID();
    next();
  });
  const getAllowedOrigins = (): string[] => {
    const configured = (process.env.FRONTEND_URL ?? "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/+$/, ""))
      .filter(Boolean);

    return configured.length > 0 ? configured : ["http://localhost:5173"];
  };

  app.use(Express.json());
  app.use(Express.urlencoded());
  app.use(cookieParser());
  app.use(apiContract);
  app.use(
    cors({
      origin: getAllowedOrigins(),
      credentials: true,
    })
  );

  app.use("/api/user-languages", userLanguageRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/company", companyRouter);
  app.use("/api/user", userRouter);
  app.use("/api/professional-profile", professionalProfileRouter);
  app.use("/api/education", educationRouter);
  app.use("/api/experience", experienceRouter);
  app.use("/api/project", projectRouter);
  app.use("/api/certificate", certificateRouter);
  app.use("/api/skill", skillRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/languages", languageRouter);
  app.use("/api/application", applicationRouter);
  app.use("/api/notification", notificationRouter);
  app.use("/api/message", messageRouter);
  app.use("/api/support-only", supportOnlyRouter);
  app.use("/api/support", supportRouter);
  app.use("/api/recommendation", recommendationRouter);
  app.use("/api/jobs", jobRouter);
  app.use("/api/locations", locationRouter);
  if (testRoutes) app.use(testRoutes);

  app.use(notFoundHandler);
  app.use(globalErrorHandler);
  return app;
};

if (require.main === module) {
  connectDB()
    .then(() => {
      startJobExpirationScheduler();
      const app = createApp();
      const server = app.listen(process.env.PORT || 5000, () => {
        writeStructuredLog("info", "server.started", {
          port: process.env.PORT || 5000,
        });
      });
      server.on("error", (error: Error) => {
        writeStructuredLog("error", "server.listen_failed", {
          source: "internal",
          ...getErrorDiagnostics(error),
        });
        process.exit(1);
      });
    })
    .catch((error: unknown) => {
      writeStructuredLog("error", "server.startup_failed", {
        source: "database",
        ...getErrorDiagnostics(error),
      });
      process.exit(1);
    });
}
