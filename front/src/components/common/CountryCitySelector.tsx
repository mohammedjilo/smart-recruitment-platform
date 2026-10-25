import { useEffect, useMemo, useState } from "react"
import { Autocomplete, Box, MenuItem, TextField } from "@mui/material"
import { getCountries, type ICountry } from "@countrystatecity/countries-browser"
import { useGetLocationCitiesQuery } from "@/services/shared/locationApiCalls"
import type { GeoNamesCity } from "@/types/location"

export type LocationSelection = {
   countryCode: string
   countryName: string
   stateCode: string
   stateName: string
   cityName: string
   cityGeonameId: number | null
}

type CountryCitySelectorProps = {
   value: LocationSelection
   onChange: (value: LocationSelection) => void
   errors?: Partial<Record<"country" | "state" | "city" | "cityGeonameId", string>>
   required?: boolean
   size?: "small" | "medium"
}

export const emptyLocationSelection: LocationSelection = {
   countryCode: "",
   countryName: "",
   stateCode: "",
   stateName: "",
   cityName: "",
   cityGeonameId: null
}

export const isLocationSelectionComplete = (location: LocationSelection) =>
   Boolean(location.countryCode && location.cityGeonameId !== null)

export default function CountryCitySelector({
   value,
   onChange,
   errors,
   required = false,
   size = "small"
}: CountryCitySelectorProps) {
   const [countries, setCountries] = useState<ICountry[]>([])
   const [cityInputValue, setCityInputValue] = useState(value.cityName)
   const [searchQuery, setSearchQuery] = useState(value.cityName)
   const [selectedCity, setSelectedCity] = useState<GeoNamesCity | null>(null)
   const [countryLoadError, setCountryLoadError] = useState(false)
   const [loadingCountries, setLoadingCountries] = useState(true)
   const cityQuery = useGetLocationCitiesQuery(
      {
         countryCode: value.countryCode,
         q: searchQuery || undefined,
         limit: 25
      },
      { skip: !value.countryCode }
   )
   const cities = useMemo(
      () => cityQuery.currentData?.data ?? [],
      [cityQuery.currentData?.data]
   )

   useEffect(() => {
      let isCurrent = true
      getCountries()
         .then(results => {
            if (isCurrent) setCountries(results)
         })
         .catch(() => {
            if (isCurrent) setCountryLoadError(true)
         })
         .finally(() => {
            if (isCurrent) setLoadingCountries(false)
         })
      return () => {
         isCurrent = false
      }
   }, [])

   useEffect(() => {
      setCityInputValue(value.cityName)
      setSearchQuery(value.cityName)
   }, [value.cityName, value.cityGeonameId])

   useEffect(() => {
      if (!value.cityGeonameId) {
         setSelectedCity(null)
         return
      }
      const city = cities.find(option => option.geonameId === value.cityGeonameId)
      if (city) setSelectedCity(city)
   }, [value.cityGeonameId, cities])

   const handleCountryChange = (countryCode: string) => {
      const country = countries.find(item => item.iso2 === countryCode)
      setCityInputValue("")
      setSearchQuery("")
      setSelectedCity(null)
      onChange({
         ...emptyLocationSelection,
         countryCode,
         countryName: country?.name ?? ""
      })
   }

   const handleCityChange = (city: GeoNamesCity | null) => {
      setSelectedCity(city)
      setCityInputValue(city?.name ?? "")
      setSearchQuery(city?.name ?? "")
      onChange({
         ...value,
         stateName: city?.admin1Name ?? "",
         stateCode: "",
         cityName: city?.name ?? "",
         cityGeonameId: city?.geonameId ?? null
      })
   }

   return (
      <Box className="grid grid-cols-1 items-center gap-5 sm:grid-cols-2">
         <TextField
            className="min-w-50"
            disabled={loadingCountries}
            required={required}
            value={value.countryCode}
            error={Boolean(errors?.country || countryLoadError)}
            fullWidth
            helperText={
               errors?.country ??
               (countryLoadError
                  ? "Countries could not be loaded."
                  : loadingCountries
                    ? "Loading countries..."
                    : undefined)
            }
            label="Country"
            select
            size={size}
            onChange={event => handleCountryChange(event.target.value)}>
            <MenuItem value="">Select a country</MenuItem>
            {!loadingCountries && countries.length === 0 && (
               <MenuItem
                  disabled
                  value="">
                  No countries available
               </MenuItem>
            )}
            {countries.map(country => (
               <MenuItem
                  key={country.iso2}
                  value={country.iso2}>
                  {country.name}
               </MenuItem>
            ))}
         </TextField>
         <Autocomplete
            className="min-w-50"

            disabled={!value.countryCode}
            value={selectedCity}
            filterOptions={options => options}
            fullWidth
            getOptionLabel={city => city.name}
            inputValue={cityInputValue}
            isOptionEqualToValue={(option, selected) =>
               option.geonameId === selected.geonameId
            }
            loading={cityQuery.isFetching}
            loadingText="Searching populated places..."
            noOptionsText={
               cityQuery.isError
                  ? "City suggestions could not be loaded."
                  : "No matching populated places found in GeoNames."
            }
            options={cities}
            renderInput={params => (
               <TextField
                  {...params}
                  placeholder={
                     value.countryCode
                        ? "Search city or populated place"
                        : "Select a country first"
                  }
                  required={required}
                  error={Boolean(
                     errors?.city || errors?.cityGeonameId || cityQuery.isError
                  )}
                  helperText={
                     errors?.cityGeonameId ??
                     errors?.city ??
                     (cityQuery.isError
                        ? "City suggestions could not be loaded."
                        : undefined)
                  }
                  label="City"
                  size={size}
               />
            )}
            renderOption={(props, city) => (
               <li
                  {...props}
                  key={city.geonameId}>
                  {city.name}
               </li>
            )}
            onChange={(_event, city) => handleCityChange(city)}
            onInputChange={(_event, text, reason) => {
               setCityInputValue(text)
               if (reason === "input") {
                  setSearchQuery(text)
                  if (value.cityGeonameId && text !== value.cityName) {
                     setSelectedCity(null)
                     onChange({
                        ...value,
                        stateCode: "",
                        stateName: "",
                        cityName: text,
                        cityGeonameId: null
                     })
                  }
               }
            }}
         />
      </Box>
   )
}
