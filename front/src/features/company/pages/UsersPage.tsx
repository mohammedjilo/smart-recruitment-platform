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
   type LocationSelection
} from "@/components/common/CountryCitySelector"

const UsersPage = () => {
   const [page, setPage] = useState(1)

   const [search, setSearch] = useState("")

   const [experience, setExperience] = useState<ExperienceFilter>("ALL")
   const [location, setLocation] = useState<LocationSelection>(emptyLocationSelection)

   const query = useGetCompanyUsersQuery({
      page,
      search: search.trim() || undefined,
      experience,
      country: location.countryName || undefined,
      countryCode: location.countryCode || undefined,
      city: location.cityName || undefined,
      cityGeonameId: location.cityGeonameId ?? undefined
   })
   const hasLocationFilter = Boolean(
      location.countryName || location.cityGeonameId
   )
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults:
         Boolean(search.trim()) ||
         experience !== "ALL" ||
         hasLocationFilter ||
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
            title="Users"
            description="Explore and discover talented professionals."
         />

         {/* Filters */}
         {isLoading ? (
            <FiltersBarSkeleton fields={["search", "control"]} />
         ) : (
            <UsersFilters
               search={search}
               experience={experience}
               location={location}
               onSearchChange={handleSearchChange}
               onExperienceChange={handleExperienceChange}
               onLocationChange={value => {
                  setLocation(value)
                  setPage(1)
               }}
            />
         )}

         {/* Loading */}
         {/* Error */}
         {/* UsersPage Table */}
         <Box className="mt-6">
            <UsersTable
               users={users}
               hasFilters={
                  Boolean(search.trim()) || experience !== "ALL" || hasLocationFilter
               }
               isLoading={isLoading}
               isFetching={queryPresentation.category === "refreshing"}
               queryState={queryState}
               onRetry={query.refetch}
            />

            {pagination && pagination.totalCount > 0 && (
               <PaginationFooter
                  totalCount={pagination.totalCount}
                  page={pagination.page}
                  pageSize={pagination.pageSize}
                  setPage={setPage}
                  itemLabel="users"
                  isFetching={queryPresentation.category === "refreshing"}
                  queryState={queryState}
               />
            )}
         </Box>
      </Box>
   )
}

export default UsersPage
