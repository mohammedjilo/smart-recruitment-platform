import {
   Box,
   Button,
   Paper,
   Skeleton,
   Table,
   TableBody,
   TableCell,
   TableContainer,
   TableHead,
   TableRow,
   Typography
} from "@mui/material"
import type { ReactNode } from "react"
import PaginationFooter from "./PaginationFooter"
import type { SemanticQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

export type DataTableColumn<T extends object> = {
   id: string
   header: ReactNode
   accessorKey?: keyof T | string
   render?: (row: T, index: number) => ReactNode
   align?: "left" | "center" | "right" | "justify" | "inherit"
   width?: number | string
   headerClassName?: string
   cellClassName?: string
}

export type DataTablePagination = {
   page: number
   pageSize: number
   totalCount: number
}

export type DataTableProps<T extends object> = {
   rows: T[]
   columns: DataTableColumn<T>[]
   getRowKey: (row: T, index: number) => string | number
   isLoading?: boolean
   isFetching?: boolean
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void
   loadingRows?: number
   emptyState?: ReactNode
   noResultsState?: ReactNode
   itemLabel?: string
   pagination?: DataTablePagination
   onPageChange?: (page: number) => void
   onRowClick?: (row: T, index: number) => void
   minWidth?: number | string
   scrollLabel?: string
   containerClassName?: string
   tableClassName?: string
}

const defaultEmptyState = (
   <Box className="flex min-h-60 items-center justify-center">
      <Typography
         className="text-sm! font-medium!"
         color="textSecondary">
         No records found.
      </Typography>
   </Box>
)

const defaultNoResultsState = (
   <Box className="flex min-h-60 items-center justify-center">
      <Typography
         className="text-sm! font-medium!"
         color="textSecondary">
         No matching records found.
      </Typography>
   </Box>
)

const defaultHeaderClassName = "text-xs! font-semibold! text-muted!"
const defaultCellClassName = "text-sm! font-medium! "

const getValueByAccessor = <T extends object>(
   row: T,
   accessorKey?: keyof T | string
): ReactNode | undefined => {
   if (!accessorKey) {
      return undefined
   }

   let resolvedValue: unknown

   if (typeof accessorKey === "string" && accessorKey.includes(".")) {
      resolvedValue = accessorKey.split(".").reduce<unknown>((value, key) => {
         if (value && typeof value === "object" && key in value) {
            return (value as Record<string, unknown>)[key]
         }

         return undefined
      }, row as unknown)
   } else if (typeof accessorKey === "string") {
      resolvedValue = row[accessorKey as keyof T]
   } else {
      resolvedValue = row[accessorKey]
   }

   if (resolvedValue === null || resolvedValue === undefined) {
      return undefined
   }

   return resolvedValue as ReactNode
}

const DataTable = <T extends object>({
   rows,
   columns,
   getRowKey,
   isLoading = false,
   isFetching = false,
   queryState,
   onRetry,
   loadingRows = 6,
   emptyState = defaultEmptyState,
   noResultsState = defaultNoResultsState,
   itemLabel,
   pagination,
   onPageChange,
   onRowClick,
   minWidth = 1000,
   scrollLabel = "Data table. Scroll horizontally to view all columns.",
   containerClassName,
   tableClassName
}: DataTableProps<T>) => {
   const hasPagination = Boolean(pagination && onPageChange)
   const queryPresentation = queryState
      ? getQueryPresentation(queryState, "section")
      : undefined
   const queryLoading = queryPresentation?.category === "loading" || isLoading
   const queryFetching =
      queryPresentation?.category === "refreshing" || (!queryState && isFetching)

   if (
      queryPresentation?.category === "section_error" ||
      queryPresentation?.category === "access_denied" ||
      queryPresentation?.category === "authentication_notice" ||
      queryPresentation?.category === "resource_not_found"
   ) {
      return (
         <Box
            className="rounded-xl border border-red-200 bg-red-50 p-8 text-center"
            aria-live="assertive"
            role="alert">
            <Typography className="text-sm! text-red-700!">
               {queryPresentation.message}
            </Typography>
            {onRetry && (
               <Button
                  className="mt-3! normal-case!"
                  onClick={onRetry}>
                  Try again
               </Button>
            )}
         </Box>
      )
   }

   if (
      queryPresentation?.category === "silent" &&
      (queryState?.status !== "aborted" || queryState.data === undefined)
   ) {
      return (
         <Box
            className="border-border bg-surface rounded-xl border p-8 text-center"
            aria-live="assertive"
            role="alert">
            <Typography className="text-sm!" color="textSecondary">
               {queryPresentation.message}
            </Typography>
            {onRetry && (
               <Button
                  className="mt-3! normal-case!"
                  onClick={onRetry}>
                  Try again
               </Button>
            )}
         </Box>
      )
   }
   if (queryPresentation?.category === "none") return null

   const canShowEmptyState =
      queryState === undefined || queryPresentation?.category === "empty"
   const canShowNoResultsState = queryPresentation?.category === "no_results"

   return (
      <Box className="contents">
         {queryPresentation?.category === "stale_error" && (
            <Box
               className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
               aria-live="polite"
               role="status">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               {onRetry && (
                  <Button
                     className="normal-case!"
                     size="small"
                     onClick={onRetry}>
                     Try again
                  </Button>
               )}
            </Box>
         )}
         <Box className="border-border bg-surface w-full min-w-0 overflow-hidden rounded-xl border">
            {queryFetching && !queryLoading && (
               <Box className="bg-primary-tint relative h-0.5 overflow-hidden">
                  <Box className="bg-primary h-full w-1/3 animate-[loading_1s_ease-in-out_infinite]" />
               </Box>
            )}

            <TableContainer
               className={`${containerClassName ?? "shadow-none!"} w-full! max-w-full! min-w-0! scrollbar-thin! overflow-x-auto! overscroll-x-contain! [-webkit-overflow-scrolling:touch]!`}
               aria-label={scrollLabel}
               component={Paper}
               elevation={0}
               role="region"
               tabIndex={0}>
               <Table
                  className={tableClassName}
                  sx={{
                     minWidth
                  }}>
                  <TableHead>
                     <TableRow className="bg-bg">
                        {columns.map(column => (
                           <TableCell
                              className={[defaultHeaderClassName, column.headerClassName]
                                 .filter(Boolean)
                                 .join(" ")}
                              key={column.id}
                              align={column.align ?? "left"}
                              width={column.width}>
                              {queryLoading ? (
                                 <Skeleton
                                    className="h-5! rounded-md"
                                    aria-hidden="true"
                                    variant="text"
                                    width="68%"
                                 />
                              ) : (
                                 column.header
                              )}
                           </TableCell>
                        ))}
                     </TableRow>
                  </TableHead>

                  <TableBody>
                     {queryLoading &&
                        Array.from({ length: loadingRows }).map((_, rowIndex) => (
                           <TableRow key={`loading-row-${rowIndex}`}>
                              {columns.map((column, cellIndex) => (
                                 <TableCell key={`${rowIndex}-${column.id || cellIndex}`}>
                                    <Skeleton
                                       className="h-6! rounded-md"
                                       variant="text"
                                    />
                                 </TableCell>
                              ))}
                           </TableRow>
                        ))}

                     {!queryLoading &&
                        rows.length > 0 &&
                        rows.map((row, rowIndex) => (
                           <TableRow
                              key={getRowKey(row, rowIndex)}
                              hover
                              sx={{
                                 cursor: onRowClick ? "pointer" : "default",
                                 "& td": {
                                    borderBottom: "1px solid",
                                    borderColor: "divider"
                                 },
                                 "&:last-child td": {
                                    borderBottom: 0
                                 }
                              }}
                              onClick={() => onRowClick?.(row, rowIndex)}>
                              {columns.map(column => {
                                 let cellValue: ReactNode | undefined

                                 if (column.render) {
                                    cellValue = column.render(row, rowIndex)
                                 } else if (column.accessorKey) {
                                    cellValue = getValueByAccessor(
                                       row,
                                       column.accessorKey
                                    )
                                 }

                                 return (
                                    <TableCell
                                       className={[
                                          defaultCellClassName,
                                          column.cellClassName
                                       ]
                                          .filter(Boolean)
                                          .join(" ")}
                                       key={`${getRowKey(row, rowIndex)}-${column.id}`}
                                       align={column.align ?? "left"}
                                       width={column.width}>
                                       {cellValue}
                                    </TableCell>
                                 )
                              })}
                           </TableRow>
                        ))}

                     {!queryLoading &&
                        rows.length === 0 &&
                        (canShowEmptyState || canShowNoResultsState) && (
                           <TableRow>
                              <TableCell
                                 className="p-0!"
                                 colSpan={columns.length}>
                                 {canShowNoResultsState ? noResultsState : emptyState}
                              </TableCell>
                           </TableRow>
                        )}
                  </TableBody>
               </Table>
            </TableContainer>
         </Box>

         {hasPagination && !queryLoading && (
            <PaginationFooter
               isFetching={queryFetching}
               itemLabel={itemLabel ?? "records"}
               page={pagination!.page}
               pageSize={pagination!.pageSize}
               queryState={queryState}
               setPage={onPageChange!}
               totalCount={pagination!.totalCount}
            />
         )}
      </Box>
   )
}

export default DataTable
