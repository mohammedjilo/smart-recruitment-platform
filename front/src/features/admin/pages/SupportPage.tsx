import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { Alert, Box, Button } from "@mui/material"
import { useGetAdminsQuery } from "@/features/admin/services/adminApiCalls"
import {
   useGetSupportCategoriesQuery,
   useGetAdminSupportTicketsQuery
} from "@/services/shared/supportApiCalls"
import type { SupportPriority, SupportTicketStatus } from "@/types/entities/support"
import type { RootState } from "@/redux/store"
import SupportFilters, {
   type SupportAudience
} from "@/features/admin/components/support/SupportFilters"
import SupportHeader from "@/features/admin/components/support/SupportHeader"
import SupportStats, {
   type SupportStatsValues
} from "@/features/admin/components/support/SupportStats"
import SupportTicketsTable, {
   type TableTicket
} from "@/features/admin/components/support/SupportTicketsTable"
import { AdminStatsSkeleton } from "@/features/admin/components/AdminSkeletons"
import FiltersBarSkeleton from "@/components/common/FiltersBarSkeleton"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

export default function SupportPage() {
   const currentAdminId = useSelector((state: RootState) => state.auth.user?.id)
   const [page, setPage] = useState(1)
   const [search, setSearch] = useState("")
   const [debouncedSearch, setDebouncedSearch] = useState("")
   const [status, setStatus] = useState<SupportTicketStatus | "ALL">("ALL")
   const [priority, setPriority] = useState<SupportPriority | "ALL">("ALL")
   const [audience, setAudience] = useState<SupportAudience>("ALL")
   const [categoryId, setCategoryId] = useState("ALL")
   const [assignedAdminId, setAssignedAdminId] = useState("ALL")

   useEffect(() => {
      const timeout = setTimeout(() => {
         setDebouncedSearch(search.trim())
         setPage(1)
      }, 400)
      return () => clearTimeout(timeout)
   }, [search])

   const adminsQuery = useGetAdminsQuery()
   const adminsState = getQueryState(adminsQuery, {
      isEmpty: response => response.data.length === 0
   })
   const adminsPresentation = getQueryPresentation(adminsState, "section")
   const adminsResponse = "data" in adminsState ? adminsState.data : undefined
   const isLoadingAdmins = adminsPresentation.category === "loading"

   const categoriesQuery = useGetSupportCategoriesQuery()
   const categoriesState = getQueryState(categoriesQuery, {
      isEmpty: categories => categories.data.length === 0
   })
   const categoriesPresentation = getQueryPresentation(categoriesState, "section")
   const categoriesResponse = "data" in categoriesState ? categoriesState.data : undefined
   const isLoadingCategories = categoriesPresentation.category === "loading"

   const ticketsQuery = useGetAdminSupportTicketsQuery({
      page,
      pageSize: 20,
      search: debouncedSearch || undefined,
      status: status === "ALL" ? undefined : status,
      priority: priority === "ALL" ? undefined : priority,
      audience: audience === "ALL" ? undefined : audience,
      categoryId: categoryId === "ALL" ? undefined : categoryId,
      assignedAdminId: assignedAdminId === "ALL" ? undefined : assignedAdminId
   })
   const queryState = getQueryState(ticketsQuery, {
      isEmpty: response => response.data.length === 0,
      noResults:
         (ticketsQuery.currentData?.meta?.totalCount ?? 0) > 0 &&
         ticketsQuery.currentData?.data.length === 0
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   const admins = adminsResponse?.data ?? []
   const categories = (categoriesResponse?.data ?? []).filter(
      (category, index, allCategories) =>
         allCategories.findIndex(
            item => item.name.trim().toLowerCase() === category.name.trim().toLowerCase()
         ) === index
   )
   const tickets = (response?.data ?? []) as TableTicket[]
   const stats: SupportStatsValues | undefined = response?.stats

   return (
      <Box className="w-full space-y-6">
         <SupportHeader />
         {isLoading ? (
            <AdminStatsSkeleton
               count={5}
               className="grid grid-cols-2 gap-3 md:grid-cols-5"
            />
         ) : stats ? (
            <SupportStats stats={stats} />
         ) : queryPresentation.category === "page_error" ||
           queryPresentation.category === "authentication_notice" ||
           queryPresentation.category === "access_denied" ||
           queryPresentation.category === "resource_not_found" ? (
            <Alert
               severity="error"
               role="alert"
               aria-live="assertive"
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={() => void ticketsQuery.refetch()}>
                     Retry
                  </Button>
               }>
               {queryPresentation.message}
            </Alert>
         ) : null}
         {(adminsPresentation.category === "section_error" ||
            adminsPresentation.category === "access_denied" ||
            adminsPresentation.category === "authentication_notice" ||
            adminsPresentation.category === "resource_not_found" ||
            adminsPresentation.category === "stale_error") && (
            <Alert
               severity={
                  adminsPresentation.category === "stale_error" ? "warning" : "error"
               }
               role={adminsPresentation.category === "stale_error" ? "status" : "alert"}
               aria-live={
                  adminsPresentation.category === "stale_error" ? "polite" : "assertive"
               }
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={() => void adminsQuery.refetch()}>
                     Retry
                  </Button>
               }>
               {adminsPresentation.message}
            </Alert>
         )}
         {(categoriesPresentation.category === "section_error" ||
            categoriesPresentation.category === "access_denied" ||
            categoriesPresentation.category === "authentication_notice" ||
            categoriesPresentation.category === "resource_not_found" ||
            categoriesPresentation.category === "stale_error") && (
            <Alert
               severity={
                  categoriesPresentation.category === "stale_error" ? "warning" : "error"
               }
               role={
                  categoriesPresentation.category === "stale_error" ? "status" : "alert"
               }
               aria-live={
                  categoriesPresentation.category === "stale_error"
                     ? "polite"
                     : "assertive"
               }
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={() => void categoriesQuery.refetch()}>
                     Retry
                  </Button>
               }>
               {categoriesPresentation.message}
            </Alert>
         )}
         {isLoading ? (
            <FiltersBarSkeleton
               layout="grid"
               fields={["search", "control", "control", "control", "control", "control"]}
            />
         ) : (
            <SupportFilters
               search={search}
               status={status}
               priority={priority}
               audience={audience}
               categoryId={categoryId}
               assignedAdminId={assignedAdminId}
               admins={admins}
               categories={categories}
               isLoadingAdmins={isLoadingAdmins}
               isLoadingCategories={isLoadingCategories}
               currentAdminId={currentAdminId}
               onSearchChange={setSearch}
               onStatusChange={value => {
                  setStatus(value)
                  setPage(1)
               }}
               onPriorityChange={value => {
                  setPriority(value)
                  setPage(1)
               }}
               onAudienceChange={value => {
                  setAudience(value)
                  setPage(1)
               }}
               onCategoryChange={value => {
                  setCategoryId(value)
                  setPage(1)
               }}
               onAssignedAdminChange={value => {
                  setAssignedAdminId(value)
                  setPage(1)
               }}
            />
         )}
         <SupportTicketsTable
            tickets={tickets as TableTicket[]}
            isLoading={isLoading}
            isFetching={ticketsQuery.isFetching}
            onRetry={ticketsQuery.refetch}
            queryState={queryState}
            pagination={response?.meta}
            onPageChange={setPage}
         />
      </Box>
   )
}
