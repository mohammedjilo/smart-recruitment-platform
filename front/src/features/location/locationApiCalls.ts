import { smartApi } from "@/services/api/baseApi"
import type { GetLocationCitiesResult } from "@/types/location"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      getLocationCities: builder.query<
         GetLocationCitiesResult,
         { countryCode: string; q?: string; page?: number; limit?: number }
      >({
         query: ({ countryCode, q, page = 1, limit = 25 }) => ({
            url: "/api/locations/cities",
            params: { countryCode, q: q || undefined, page, limit }
         }),
         keepUnusedDataFor: 60
      })
   })
})

export const { useGetLocationCitiesQuery } = extendedSmartApi
