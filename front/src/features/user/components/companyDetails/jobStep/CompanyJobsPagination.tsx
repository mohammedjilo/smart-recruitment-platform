import type { CompanyJobsPagination } from "@/types/user"
import PaginationFooter from "@/components/common/PaginationFooter"

type Props = {
   pagination: CompanyJobsPagination
   page: number
   onPageChange: (page: number) => void
}

const CompanyJobsPagination = ({ pagination, page, onPageChange }: Props) => {
   if (pagination.totalCount === 0) {
      return null
   }

   return (
      <PaginationFooter
         page={page}
         pageSize={pagination.pageSize}
         totalCount={pagination.totalCount}
         setPage={onPageChange}
         itemLabel="jobs"
      />
   )
}

export default CompanyJobsPagination
