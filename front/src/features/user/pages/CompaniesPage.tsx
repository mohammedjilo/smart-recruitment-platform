import { useState } from "react"

import { Box, Button, Typography } from "@mui/material"

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"
import { useGetCompaniesQuery } from "@/features/user/services/userApiCalls"
import CompaniesHeader from "@/features/user/components/companies/CompaniesHeader"
import CompanySearch from "@/features/user/components/companies/CompanySearch"
import CompaniesList from "@/features/user/components/companies/CompaniesList"
import PaginationFooter from "@/components/common/PaginationFooter"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import {
   emptyLocationSelection,
   isLocationSelectionComplete,
   type LocationSelection
} from "@/components/common/CountryCitySelector"

const PAGE_SIZE = 10

const CompaniesPage = () => {
   const [page, setPage] = useState(1)
   const [search, setSearch] = useState("")
   const [location, setLocation] = useState<LocationSelection>(emptyLocationSelection)
   const hasCompleteLocation = isLocationSelectionComplete(location)

   const query = useGetCompaniesQuery({
      page,
      pageSize: PAGE_SIZE,
      search: search.trim() || undefined,
      country: hasCompleteLocation ? location.countryName : undefined,
      countryCode: hasCompleteLocation ? location.countryCode : undefined,
      city: hasCompleteLocation ? location.cityName : undefined,
      cityGeonameId: hasCompleteLocation
         ? (location.cityGeonameId ?? undefined)
         : undefined
   })
   const response = query.currentData
   const companies = response?.data ?? []
   const pagination = response?.meta
   const queryState = getQueryState(query, {
      isEmpty: () => companies.length === 0,
      noResults:
         (Boolean(search.trim()) || hasCompleteLocation) &&
         companies.length === 0 &&
         pagination?.totalCount === 0
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const isLoading = queryPresentation.category === "loading"

   const handleSearchChange = (value: string) => {
      setSearch(value)
      setPage(1)
   }

   return (
      <Box className="w-full">
         <CompaniesHeader />

         {isLoading ? (
            <FiltersBarSkeleton fields={["search"]} />
         ) : (
            <CompanySearch
               location={location}
               search={search}
               onLocationChange={value => {
                  setLocation(value)
                  setPage(1)
               }}
               onSearchChange={handleSearchChange}
            />
         )}

         {(queryPresentation.category === "page_error" ||
            queryPresentation.category === "authentication_notice" ||
            queryPresentation.category === "access_denied" ||
            queryPresentation.category === "resource_not_found") && (
            <Box
               className="border-border bg-surface mt-6 flex min-h-100 flex-col items-center justify-center rounded-xl border px-6 text-center"
               aria-live="assertive"
               role="alert">
               <ErrorOutlineOutlinedIcon className="mb-3 text-[44px]! text-red-400" />

               <Typography className="text-content text-lg font-semibold">
                  Failed to load companies
               </Typography>

               <Typography
                  className="mt-2 text-sm"
                  color="textSecondary">
                  {queryPresentation.message}
               </Typography>
               <Button
                  className="mt-3! normal-case!"
                  onClick={query.refetch}>
                  Try again
               </Button>
            </Box>
         )}

         {queryPresentation.category === "stale_error" && (
            <Box
               className="mt-6 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
               aria-live="polite"
               role="status">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button
                  className="normal-case!"
                  onClick={query.refetch}>
                  Try again
               </Button>
            </Box>
         )}

         {queryPresentation.category !== "page_error" &&
            queryPresentation.category !== "authentication_notice" &&
            queryPresentation.category !== "access_denied" &&
            queryPresentation.category !== "resource_not_found" &&
            (queryPresentation.category !== "stale_error" || companies.length > 0) &&
            queryPresentation.category !== "silent" && (
               <Box className="contents">
                  <Box className="mt-6">
                     <CompaniesList
                        companies={companies}
                        isLoading={queryPresentation.category === "loading"}
                        isSearching={Boolean(search.trim()) || hasCompleteLocation}
                     />
                  </Box>

                  {pagination && companies.length > 0 && (
                     <PaginationFooter
                        isFetching={queryPresentation.category === "refreshing"}
                        itemLabel="companies"
                        page={page}
                        pageSize={pagination.pageSize}
                        queryState={queryState}
                        setPage={setPage}
                        totalCount={pagination.totalCount}
                     />
                  )}
               </Box>
            )}
         {queryPresentation.category === "section_error" && (
            <Box
               className="border-border bg-surface flex min-h-100 items-center justify-center rounded-xl border"
               aria-live="assertive"
               role="alert">
               <Typography className="text-sm!" color="textSecondary">
                  {queryPresentation.message}
               </Typography>
            </Box>
         )}
      </Box>
   )
}

export default CompaniesPage
