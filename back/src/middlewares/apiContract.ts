import { NextFunction, Request, Response } from "express";
import { toResourceDto } from "../dtos/index.js";
import { AppError } from "../utils/appError.js";
import { isGlobalErrorResponse } from "./globalErrorResponse.js";

/**
 * Compatibility response middleware. It preserves existing controller calls
 * while exposing one predictable envelope to clients during migration.
 */

type LegacyResponse = {
  status?: string;
  success?: boolean;
  data?: unknown;
  meta?: unknown;
  pagination?: unknown;
  results?: number;
  message?: string;
  stats?: unknown;
  [key: string]: unknown;
};

export const apiContract = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (isGlobalErrorResponse(res)) {
      return originalJson(body);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return originalJson(body);
    }

    const legacy = body as LegacyResponse;
    if (legacy.success === false) {
      const statusCode =
        Number.isInteger(res.statusCode) &&
        res.statusCode >= 400 &&
        res.statusCode <= 599
          ? res.statusCode
          : 500;
      next(new AppError("Request failed", statusCode));
      return res;
    }

    if (
      legacy.success === true &&
      legacy.status === undefined &&
      legacy.pagination === undefined &&
      legacy.results === undefined
    ) {
      return originalJson({
        success: true,
        ...(legacy.message ? { message: legacy.message } : {}),
        data: toResourceDto(legacy.data),
        ...(legacy.meta !== undefined ? { meta: legacy.meta } : {}),
        ...(legacy.stats !== undefined ? { stats: legacy.stats } : {}),
      });
    }

    const nested =
      legacy.data &&
      typeof legacy.data === "object" &&
      !Array.isArray(legacy.data)
        ? (legacy.data as LegacyResponse)
        : undefined;
    const stats = legacy.stats ?? nested?.stats;
    const meta =
      legacy.meta ??
      legacy.pagination ??
      nested?.meta ??
      nested?.pagination ??
      (typeof legacy.results === "number"
        ? { totalCount: legacy.results }
        : undefined);
    const directData =
      legacy.data !== undefined
        ? legacy.data
        : Object.fromEntries(
            Object.entries(legacy).filter(
              ([key]) =>
                ![
                  "status",
                  "success",
                  "message",
                  "meta",
                  "pagination",
                  "results",
                  "stats",
                ].includes(key)
            )
          );
    const data = nested?.data !== undefined ? nested.data : directData;

    const normalized: Record<string, unknown> = {
      success: true,
      ...(legacy.message ? { message: legacy.message } : {}),
      data: toResourceDto(data),
      ...(meta ? { meta } : {}),
      ...(stats ? { stats } : {}),
    };
    return originalJson(normalized);
  }) as Response["json"];

  next();
};
