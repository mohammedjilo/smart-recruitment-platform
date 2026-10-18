export type GeoNamesCity = {
   geonameId: number
   name: string
   asciiName: string
   countryCode: string
   admin1Code: string
   admin1Name: string
   admin2Code: string
   admin2Name: string
   population: number
}

export type GetLocationCitiesResult = {
   success: true
   data: GeoNamesCity[]
   meta: {
      page: number
      pageSize: number
      totalCount: number
   }
}
