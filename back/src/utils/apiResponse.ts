import { Response } from "express";
import { toResourceDto } from "../dtos/index.js";

/**
 * Shared response boundary. DTO mapping happens before data leaves the API;
 * controllers may still use legacy envelopes because `apiContract` normalizes
 * them at the application boundary.
 */

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalCount: number;
};

export type SuccessResponseOptions<S = unknown> = {
  meta?: PaginationMeta;
  stats?: S;
  message?: string;
};

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  options: SuccessResponseOptions = {}
) =>
  res.status(statusCode).json({
    success: true,
    ...(options.message ? { message: options.message } : {}),
    data: toResourceDto(data),
    ...(options.meta ? { meta: options.meta } : {}),
    ...(options.stats !== undefined ? { stats: options.stats } : {}),
  });
