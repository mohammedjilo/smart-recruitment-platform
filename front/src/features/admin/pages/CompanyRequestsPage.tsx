import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Box } from "@mui/material"
import type { CompanyRequests, GetCompanyRequestsParams } from "@/types/admin"
import {
   useApproveCompanyRequestMutation,
   useGetCompanyRequestsQuery,
   useRejectCompanyRequestMutation
} from "@/features/admin/services/adminApiCalls"
import { showAlert } from "@/utils/swal"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import CompanyRequestStats from "@/features/admin/components/companyRequests/CompanyRequestStats"
import CompanyRequestsFilters from "@/features/admin/components/companyRequests/CompanyRequestsFilters"
import CompanyRequestsTable from "@/features/admin/components/companyRequests/CompanyRequestsTable"
import PaginationFooter from "@/components/common/PaginationFooter"
import { AdminListSkeleton } from "@/features/admin/components/AdminSkeletons"
import { getAdminCompanyDetailsPath } from "@/utils/companyRoutes"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const CompanyRequestsPage = () => {
   const navigate = useNavigate()

   const [pageNumber, setPageNumber] = useState(1)

   const [search, setSearch] = useState("")

   const [debouncedSearch, setDebouncedSearch] = useState("")

   const [approvalStatus, setApprovalStatus] = useState("ALL")

   const [companyStatus, setCompanyStatus] = useState("ALL")

   const [requestDate, setRequestDate] = useState("")

   /*
    * Debounce search
    */
   useEffect(() => {
      const timeout = setTimeout(() => {
         setDebouncedSearch(search)
      }, 500)

      return () => clearTimeout(timeout)
   }, [search])

   useEffect(() => {
      setPageNumber(1)
   }, [debouncedSearch, approvalStatus, companyStatus, requestDate])

   const queryParams: GetCompanyRequestsParams = {
      pageNumber,
      pageSize: 10,
      search: debouncedSearch || undefined,
      approvalStatus: approvalStatus as GetCompanyRequestsParams["approvalStatus"],
      status: companyStatus as GetCompanyRequestsParams["status"],
      requestDate: requestDate || undefined
   }

   const query = useGetCompanyRequestsQuery(queryParams)
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0,
      noResults:
         Boolean(debouncedSearch.trim()) ||
         approvalStatus !== "ALL" ||
         companyStatus !== "ALL" ||
         Boolean(requestDate) ||
         (query.currentData?.data.length === 0 &&
            (query.currentData?.meta?.totalCount ?? 0) > 0)
   })
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"
   const [approveCompanyRequest, approveResult] = useApproveCompanyRequestMutation()
   const approveState = getMutationState(approveResult)
   const approvePresentation = getMutationPresentation(approveState, {
      surface: "action",
      importance: "important"
   })
   const [rejectCompanyRequest, rejectResult] = useRejectCompanyRequestMutation()
   const rejectState = getMutationState(rejectResult)
   const rejectPresentation = getMutationPresentation(rejectState, {
      surface: "action",
      importance: "important"
   })

   const handleView = (company: CompanyRequests) => {
      navigate(getAdminCompanyDetailsPath(company.id))
   }
   const handleApprove = async (company: CompanyRequests) => {
      const confirmation = await showAlert({
         type: "confirm",
         title: "Approve company?",
         text: `Are you sure you want to approve ${company.companyName}?`,
         confirmText: "Approve"
      })

      if (!confirmation?.isConfirmed) return

      try {
         await approveCompanyRequest(company.id).unwrap()
         if (
            getMutationPresentation(
               { status: "success" },
               { surface: "action", importance: "important" }
            ).category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Company approved",
               text: `${company.companyName} has been approved successfully.`
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "important"
         })
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Approval failed",
            text: errorPresentation.message
         })
      }
   }

   const handleReject = async (company: CompanyRequests) => {
      const confirmation = await showAlert({
         type: "confirm",
         title: "Reject company?",
         text: `Are you sure you want to reject ${company.companyName}?`,
         confirmText: "Reject"
      })

      if (!confirmation?.isConfirmed) return

      try {
         await rejectCompanyRequest({ id: company.id }).unwrap()
         if (
            getMutationPresentation(
               { status: "success" },
               { surface: "action", importance: "important" }
            ).category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Company rejected",
               text: `${company.companyName} has been rejected successfully.`
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "important"
         })
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Rejection failed",
            text: errorPresentation.message
         })
      }
   }

   if (isLoading) {
      return (
         <AdminListSkeleton
            statCount={4}
            filterFields={["search", "control", "control", "control"]}
         />
      )
   }

   const companies = response?.data ?? []
   const stats = response?.stats
   const pagination = response?.meta

   return (
      <Box className="min-h-screen">
         <Box className="space-y-6">
            {/* Stats */}
            {stats ? (
               <CompanyRequestStats stats={stats} />
            ) : queryPresentation.category === "page_error" ||
              queryPresentation.category === "authentication_notice" ||
              queryPresentation.category === "access_denied" ||
              queryPresentation.category === "resource_not_found" ? (
               <Box
                  role="alert"
                  aria-live="assertive"
                  className="text-sm text-red-600">
                  {queryPresentation.message}
               </Box>
            ) : null}

            {/* Filters */}
            <CompanyRequestsFilters
               search={search}
               approvalStatus={approvalStatus}
               status={companyStatus}
               requestDate={requestDate}
               onSearchChange={setSearch}
               onApprovalStatusChange={setApprovalStatus}
               onStatusChange={setCompanyStatus}
               onRequestDateChange={setRequestDate}
            />

            {/* Table */}
            <Box>
               <CompanyRequestsTable
                  companies={companies}
                  onView={handleView}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isUpdating={
                     approvePresentation.category === "loading" ||
                     rejectPresentation.category === "loading"
                  }
                  isFetching={queryPresentation.category === "refreshing"}
                  queryState={queryState}
                  onRetry={query.refetch}
               />
            </Box>

            {pagination && companies.length > 0 && (
               <PaginationFooter
                  page={pagination.page}
                  totalCount={pagination.totalCount}
                  pageSize={pagination.pageSize}
                  setPage={setPageNumber}
                  itemLabel="requests"
                  isFetching={queryPresentation.category === "refreshing"}
                  queryState={queryState}
               />
            )}
         </Box>
      </Box>
   )
}

export default CompanyRequestsPage
