import { Pagination, type PaginationProps } from "@mui/material"

type CustomPaginationProps = {
   page: number
   totalCount: number
   pageSize: number
   setPage: (page: number) => void
   isFetching?: boolean
} & Omit<PaginationProps, "page" | "onChange" | "count">

const CustomPagination = ({
   page,
   totalCount,
   pageSize,
   setPage,
   isFetching = false,
   ...rest
}: CustomPaginationProps) => {
   const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))

   return (
      <Pagination
         {...rest}
         disabled={isFetching}
         color="primary"
         count={totalPages}
         page={page}
         shape="circular"
         showFirstButton
         showLastButton
         size="large"
         onChange={(_, value) => setPage(value)}
      />
   )
}

export default CustomPagination
