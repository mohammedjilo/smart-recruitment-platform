import PaginationFooter from "@/components/common/PaginationFooter"

type CompanyRequestsPaginationProps = {
   page: number
   pageSize: number
   totalCount: number
   onPageChange: (page: number) => void
}

const CompanyRequestsPagination = ({
   page,
   pageSize,
   totalCount,
   onPageChange
}: CompanyRequestsPaginationProps) => {
   return (
      <PaginationFooter
         page={page}
         pageSize={pageSize}
         totalCount={totalCount}
         setPage={onPageChange}
         itemLabel="requests"
      />
   )
}

export default CompanyRequestsPagination
