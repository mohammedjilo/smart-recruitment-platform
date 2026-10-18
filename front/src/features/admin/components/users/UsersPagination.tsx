import PaginationFooter from "@/components/common/PaginationFooter"

type UsersPaginationProps = {
   totalCount: number
   page: number
   pageSize: number

   onPageChange: (page: number) => void
}

const UsersPagination = ({
   totalCount,
   page,
   pageSize,
   onPageChange
}: UsersPaginationProps) => {
   return (
      <PaginationFooter
         page={page}
         pageSize={pageSize}
         totalCount={totalCount}
         setPage={onPageChange}
         itemLabel="results"
      />
   )
}

export default UsersPagination
