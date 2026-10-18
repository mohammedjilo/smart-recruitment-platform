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
         count={totalPages}
         page={page}
         onChange={(_, value) => setPage(value)}
         color="primary"
         shape="circular"
         size="large"
         showFirstButton
         showLastButton
         disabled={isFetching}
      />
   )
}

export default CustomPagination
