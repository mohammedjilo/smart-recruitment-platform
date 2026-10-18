import type { Response } from "express";

const globalErrorResponses = new WeakSet<Response>();

export const markGlobalErrorResponse = (res: Response) => {
  globalErrorResponses.add(res);
};

export const isGlobalErrorResponse = (res: Response) =>
  globalErrorResponses.has(res);
