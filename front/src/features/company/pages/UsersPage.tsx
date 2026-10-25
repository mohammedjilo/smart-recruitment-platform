import { useState } from "react"

import { Box } from "@mui/material"

import type { ExperienceFilter } from "@/types/company"
import { useGetCompanyUsersQuery } from "@/features/company/services/companyApiCalls"
import UsersFilters from "@/features/company/components/users/UsersFilters"
import UsersTable from "@/features/company/components/users/UsersTable"
import PaginationFooter from "@/components/common/PaginationFooter"
import PageHeader from "@/components/common/PageHeader"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import {
   emptyLocationSelection,
   isLocationSelectionComplete,
   type LocationSelection
} from "@/components/common/CountryCitySelector"

const UsersPage = () => {
   const [page, setPage] = useState(1)

   const [search, setSearch] = useState("")

   const [experience, setExperience] = useState<ExperienceFilter>("ALL")
   const [location, setLocation] = useState<LocationSelection>(emptyLocationSelection)
   const hasCompleteLocation = isLocationSelectionComplete(location)

   const query = useGetCompanyUsersQuery({
      page,
      search: search.trim() || undefined,
      experience,
      country: hasCompleteLocation ? location.countryName : undefined,
      countryCode: hasCompleteLocation ? location.countryCode : undefined,
      city: hasCompleteLocation ? location.cityName : undefined,
      cityGeonameId: hasCompleteLocation
         ? (location.cityGeonameId ?? undefined)
         : undefined
   })
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults:
         Boolean(search.trim()) ||
         experience !== "ALL" ||
         hasCompleteLocation ||
         (query.currentData?.data.length === 0 &&
            (query.currentData?.meta?.totalCount ?? 0) > 0)
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   const users = response?.data ?? []

   const pagination = response?.meta

   const handleSearchChange = (value: string) => {
      setSearch(value)
      setPage(1)
   }

   const handleExperienceChange = (value: ExperienceFilter) => {
      setExperience(value)
      setPage(1)
   }

   return (
      <Box className="w-full">
         <PageHeader
            description="Explore and discover talented professionals."
            title="Users"
         />

         {/* Filters */}
         {isLoading ? (
            <FiltersBarSkeleton fields={["search", "control"]} />
         ) : (
            <UsersFilters
               experience={experience}
               location={location}
               search={search}
               onExperienceChange={handleExperienceChange}
               onLocationChange={value => {
                  setLocation(value)
                  setPage(1)
               }}
               onSearchChange={handleSearchChange}
            />
         )}

         {/* Loading */}
         {/* Error */}
         {/* UsersPage Table */}
         <Box className="mt-6">
            <UsersTable
               hasFilters={
                  Boolean(search.trim()) ||
                  experience !== "ALL" ||
                  hasCompleteLocation
               }
               isFetching={queryPresentation.category === "refreshing"}
               isLoading={isLoading}
               queryState={queryState}
               users={users}
               onRetry={query.refetch}
            />

            {pagination && pagination.totalCount > 0 && (
               <PaginationFooter
                  isFetching={queryPresentation.category === "refreshing"}
                  itemLabel="users"
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  queryState={queryState}
                  setPage={setPage}
                  totalCount={pagination.totalCount}
               />
            )}
         </Box>
      </Box>
   )
}

export default UsersPage
