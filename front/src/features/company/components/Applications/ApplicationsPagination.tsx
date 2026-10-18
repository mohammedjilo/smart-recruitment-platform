import React from "react"

import PaginationFooter from "@/components/common/PaginationFooter"

interface ApplicationsPaginationProps {
   page: number
   pageSize: number
   totalCount: number
   isLoading?: boolean

   onPageChange: (page: number) => void
}

const ApplicationsPagination: React.FC<ApplicationsPaginationProps> = ({
   page,
   pageSize,
   totalCount,
   isLoading,
   onPageChange
}) => {
   return (
      <PaginationFooter
         page={page}
         pageSize={pageSize}
         totalCount={totalCount}
         setPage={onPageChange}
         itemLabel="applications"
         isFetching={isLoading}
      />
   )
}

export default ApplicationsPagination
