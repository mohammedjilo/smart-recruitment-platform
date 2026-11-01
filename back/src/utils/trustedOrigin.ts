import type { NextFunction, Request, Response } from "express";
import { AppError } from "./appError.js";

export const getTrustedFrontendOrigins = () => {
  const configured = (process.env.FRONTEND_URL ?? "")
    .split(",")
    .map((origin) => origin.trim().replace(/\/+$/, ""))
    .filter(Boolean);

  if (configured.length > 0) return configured;
  return process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:5173"];
};

export const requireTrustedOrigin = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const origin = req.get("Origin");
  if (origin === undefined || getTrustedFrontendOrigins().includes(origin)) {
    return next();
  }
  return next(new AppError("Untrusted request origin", 403, "FORBIDDEN"));
};
