import { z } from "zod";
import {
  locationFilterFields,
  validateLocationFilter,
} from "../utils/locationData";

export { createJobSchema, updateJobSchema } from "./job.validation";
export {
  companyProfileUpdateSchema as updateCompanyProfileSchema,
  type CompanyProfileUpdateInput,
} from "@smart-recruitment/validation";

export const getCompanyUsersQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    search: z.string().trim().optional(),
    experience: z.enum(["ALL", "0-2", "3-5", "6+"]).optional().default("ALL"),
    ...locationFilterFields,
  })
  .superRefine(validateLocationFilter);
