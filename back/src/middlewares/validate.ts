import { NextFunction, Response, Request } from "express";
import { AppError } from "../utils/appError.js";
import { z } from "zod";

type Target = "body" | "params" | "query";

export const validate =
  (schema: z.ZodTypeAny, target: Target = "body") =>
  (req: Request, res: Response, next: NextFunction) => {
    const data =
      target === "body"
        ? (req.body ?? {})
        : target === "params"
          ? req.params
          : req.query;

    const result = schema.safeParse(data);

    if (!result.success) {
      const fieldErrors = result.error.issues.reduce<Record<string, string>>(
        (errors, issue) => {
          const field = issue.path.join(".") || "form";
          if (!errors[field]) errors[field] = issue.message;
          return errors;
        },
        {}
      );

      return next(
        new AppError(
          "Please correct the highlighted fields.",
          400,
          "VALIDATION_ERROR",
          fieldErrors
        )
      );
    }

    // Merge validated values into the existing request objects instead of replacing
    if (target === "body") {
      req.body = result.data as any;
    } else if (target === "params") {
      // params may be read-only as a whole in some environments, so copy properties
      const dest: any = req.params as any;
      const validated = result.data as Record<string, any>;
      Object.keys(validated).forEach((k) => {
        dest[k] = validated[k];
      });
    } else {
      // req.query can be a getter-backed object; mutate its properties instead of replacing
      const dest: any = req.query as any;
      const validated = result.data as Record<string, any>;
      Object.keys(validated).forEach((k) => {
        dest[k] = validated[k];
      });
    }

    next();
  };
