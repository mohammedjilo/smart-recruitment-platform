import { z } from "zod";

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const optionalDateOnlySchema = dateOnlySchema.nullable().optional();
