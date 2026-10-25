import { Box, Typography } from "@mui/material"
import CustomPagination from "./CustomPagination"
import type { SemanticQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

type PaginationFooterProps = {
   page: number
   pageSize: number
   totalCount: number
   setPage: (page: number) => void
   itemLabel: string
   isFetching?: boolean
   queryState?: SemanticQueryState<unknown>
}

const PaginationFooter = ({
   page,
   pageSize,
   totalCount,
   setPage,
   itemLabel,
   isFetching = false,
   queryState
}: PaginationFooterProps) => {
   const showingFrom = totalCount === 0 ? 0 : (page - 1) * pageSize + 1
   const showingTo = Math.min(page * pageSize, totalCount)
   const queryPresentation = queryState
      ? getQueryPresentation(queryState, "section")
      : undefined
   const queryBusy =
      queryPresentation?.category === "loading" ||
      queryPresentation?.category === "refreshing" ||
      (!queryState && isFetching)

   return (
      <Box className="border-border bg-surface mt-6 flex flex-col gap-4 rounded-xl border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
         <Typography
            className="text-sm!"
            color="textSecondary">
            Showing <span className="text-content font-medium">{showingFrom}</span> to{" "}
            <span className="text-content font-medium">{showingTo}</span> of{" "}
            <span className="text-content font-medium">{totalCount}</span> {itemLabel}
         </Typography>

         <CustomPagination
            isFetching={queryBusy}
            page={page}
            pageSize={pageSize}
            setPage={setPage}
            totalCount={totalCount}
         />
      </Box>
   )
}

export default PaginationFooter
