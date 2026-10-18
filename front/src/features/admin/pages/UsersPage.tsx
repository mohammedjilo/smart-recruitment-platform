import { Box, Typography } from "@mui/material"

import { useEffect, useState } from "react"

import { useNavigate } from "react-router-dom"
import type { AdminUser, UserStatus } from "@/types/admin"
import { useGetUsersByAdminQuery } from "@/features/admin/services/adminApiCalls"
import UsersFilters from "@/features/admin/components/users/UsersFilters"
import UsersStats from "@/features/admin/components/users/UsersStats"
import UsersTable from "@/features/admin/components/users/UsersTable"
import { AdminStatsSkeleton } from "@/features/admin/components/AdminSkeletons"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import {
   emptyLocationSelection,
   type LocationSelection
} from "@/components/common/CountryCitySelector"

const UsersPage = () => {
   const navigate = useNavigate()

   const [page, setPage] = useState(1)

   const [search, setSearch] = useState("")

   const [debouncedSearch, setDebouncedSearch] = useState("")

   const [status, setStatus] = useState<UserStatus | "ALL">("ALL")
   const [location, setLocation] = useState<LocationSelection>(emptyLocationSelection)

   /*
    * Debounce Search
    */
   useEffect(() => {
      const timeout = setTimeout(() => {
         setDebouncedSearch(search)
         setPage(1)
      }, 400)

      return () => clearTimeout(timeout)
   }, [search])

   const query = useGetUsersByAdminQuery({
      page,
      search: debouncedSearch || undefined,
      status,
      role: "USER",
      country: location.countryName || undefined,
      countryCode: location.countryCode || undefined,
      city: location.cityName || undefined,
      cityGeonameId: location.cityGeonameId ?? undefined
   })
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults:
         Boolean(search.trim()) ||
         status !== "ALL" ||
         Boolean(location.countryName || location.cityGeonameId) ||
         (query.currentData?.data.length === 0 &&
            (query.currentData?.meta?.totalCount ?? 0) > 0)
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined

   const users: AdminUser[] = response?.data ?? []

   const stats = response?.stats || {
      totalUsers: 0,
      activeUsers: 0,
      inactiveUsers: 0
   }

   const pagination = response?.meta
   const isLoading = queryPresentation.category === "loading"

   const handleStatusChange = (value: UserStatus | "ALL") => {
      setStatus(value)
      setPage(1)
   }

   const handleViewUser = (userId: string) => {
      navigate(`/admin/users/${userId}`)
   }

   return (
      <Box className="w-full space-y-6">
         {/* Stats */}
         {isLoading ? (
            <AdminStatsSkeleton
               count={3}
               className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
            />
         ) : queryPresentation.category === "page_error" ||
           queryPresentation.category === "authentication_notice" ||
           queryPresentation.category === "access_denied" ||
           queryPresentation.category === "resource_not_found" ? (
            <Typography
               className="text-sm! text-red-500!"
               role="alert"
               aria-live="assertive">
               {queryPresentation.message}
            </Typography>
         ) : queryPresentation.category === "stale_error" ? (
            <Typography
               className="text-sm! text-amber-700!"
               role="status"
               aria-live="polite">
               {queryPresentation.message}
            </Typography>
         ) : response ? (
            <UsersStats stats={stats} />
         ) : null}

         {/* Filters */}
         {isLoading ? (
            <FiltersBarSkeleton fields={["search", "control"]} />
         ) : (
            <UsersFilters
               search={search}
               status={status}
               location={location}
               onSearchChange={setSearch}
               onStatusChange={handleStatusChange}
               onLocationChange={value => {
                  setLocation(value)
                  setPage(1)
               }}
            />
         )}

         {/* UsersPage Section */}
         <UsersTable
            users={users}
            onView={handleViewUser}
            isLoading={isLoading}
            isFetching={queryPresentation.category === "refreshing"}
            queryState={queryState}
            onRetry={query.refetch}
            pagination={pagination}
            onPageChange={setPage}
         />
      </Box>
   )
}

export default UsersPage
