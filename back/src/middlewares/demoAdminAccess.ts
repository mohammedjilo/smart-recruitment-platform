import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { isDemoAdminUser } from "../authorization/permission.service.js";
import { AppError } from "../utils/appError.js";
import { verifyAccessToken } from "../utils/tokens.js";

const demoAdminReadPaths = [
  /^\/api\/admin\/dashboard$/,
  /^\/api\/admin\/operations\/dashboard$/,
  /^\/api\/admin\/me\/permissions$/,
  /^\/api\/admin\/companies$/,
  /^\/api\/admin\/companies\/[^/]+$/,
  /^\/api\/admin\/companies\/[^/]+\/jobs$/,
  /^\/api\/admin\/companies\/[^/]+\/applications$/,
  /^\/api\/admin\/company-requests$/,
  /^\/api\/admin\/users$/,
  /^\/api\/admin\/users\/[^/]+$/,
  /^\/api\/admin\/users\/[^/]+\/professional-profile$/,
  /^\/api\/admin\/jobs$/,
  /^\/api\/admin\/jobs\/[^/]+$/,
  /^\/api\/admin\/jobs\/[^/]+\/questions$/,
  /^\/api\/admin\/jobs\/[^/]+\/applications$/,
  /^\/api\/admin\/applications$/,
  /^\/api\/admin\/applications\/[^/]+$/,
  /^\/api\/admin\/applications\/[^/]+\/profile-snapshot$/,
  /^\/api\/support\/admin\/dashboard$/,
  /^\/api\/support\/admin\/tickets$/,
  /^\/api\/support\/tickets\/[^/]+$/,
  /^\/api\/support\/tickets$/,
  /^\/api\/support\/categories$/,
  /^\/api\/notification$/,
  /^\/api\/locations\/cities$/,
];

export const isDemoAdminRequestAllowed = (method: string, path: string) => {
  const normalizedPath = path.split("?")[0].replace(/\/+$/, "") || "/";

  if (
    method.toUpperCase() === "POST" &&
    ["/api/auth/login", "/api/auth/refresh", "/api/auth/logout"].includes(
      normalizedPath
    )
  ) {
    return true;
  }

  return (
    method.toUpperCase() === "GET" &&
    demoAdminReadPaths.some((allowedPath) => allowedPath.test(normalizedPath))
  );
};

export const enforceDemoAdminBoundary = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  if (req.method === "OPTIONS") return next();

  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return next();

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) return next();

  let payload: ReturnType<typeof verifyAccessToken>;
  try {
    payload = verifyAccessToken(token);
  } catch (error: unknown) {
    if (error instanceof jwt.JsonWebTokenError) return next();
    return next(error);
  }

  const userId =
    typeof payload.id === "string"
      ? payload.id
      : typeof payload.sub === "string"
        ? payload.sub
        : undefined;
  if (!userId || payload.role !== "user") return next();

  try {
    if (!(await isDemoAdminUser(userId))) return next();

    req.isDemoAdmin = true;
    if (!isDemoAdminRequestAllowed(req.method, req.path)) {
      return next(new AppError("Not found", 404));
    }

    return next();
  } catch (error: unknown) {
    return next(error);
  }
};
