import { z } from "zod";

export const cityNameSchema = z
  .string()
  .trim()
  .min(1, "City is required")
  .max(100, "City name must be 100 characters or fewer")
  .regex(
    /^[\p{L}\p{M}][\p{L}\p{M}\p{N} .,'’()\-]*$/u,
    "Enter a valid city name",
  );
