import { z } from "zod";
import {
  locationFilterFields,
  validateLocationFilter,
} from "../utils/locationData";

export const getCompaniesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    search: z.string().trim().optional(),
    ...locationFilterFields,
  })
  .superRefine(validateLocationFilter);
