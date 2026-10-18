import type { NextFunction, Request, Response } from "express";
import {
  assertAnyPermission,
  assertPermission,
} from "../authorization/permission.service.js";
import type { PermissionCode } from "../authorization/permissions.js";
import { AppError } from "../utils/appError.js";

export const requirePermission =
  (permission: PermissionCode) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("Authentication required", 401, "UNAUTHORIZED")
      );
    }

    try {
      await assertPermission(req.user.id, permission);
      return next();
    } catch (error) {
      return next(error);
    }
  };

export const requireAnyPermission =
  (permissions: readonly PermissionCode[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError("Authentication required", 401, "UNAUTHORIZED")
      );
    }

    try {
      await assertAnyPermission(req.user.id, permissions);
      return next();
    } catch (error) {
      return next(error);
    }
  };
