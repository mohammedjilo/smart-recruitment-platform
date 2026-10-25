import type { Request, Response } from "express";
import { searchLocationCities } from "../services/locationData.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { getLocationCitiesQuerySchema } from "../validation/location.validation";

/**
 * @desc Search cities for location selection
 * @route /api/locations/cities
 * @method GET
 * @access public
 */
export const getLocationCitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    const query = getLocationCitiesQuerySchema.parse(req.query);
    const result = await searchLocationCities(query);
    sendSuccess(res, 200, result.places, { meta: result.pagination });
  }
);
