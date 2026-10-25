import { Box, Skeleton } from "@mui/material"
import FiltersBarSkeleton, {
   type FilterSkeletonField
} from "@/components/common/FiltersBarSkeleton"

const StatsSkeleton = ({
   count = 4,
   className = "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
}: {
   count?: number
   className?: string
}) => (
   <Box className={className}>
      {Array.from({ length: count }).map((_, index) => (
         <Box
            className="bg-surface border-border rounded-xl border p-5"
            key={index}>
            <Skeleton
               height={48}
               variant="circular"
               width={48}
            />
            <Skeleton
               className="mt-3"
               width="45%"
            />
            <Skeleton
               className="mt-1"
               height={32}
               width="30%"
            />
         </Box>
      ))}
   </Box>
)

export const AdminStatsSkeleton = ({
   count,
   className
}: {
   count?: number
   className?: string
}) => (
   <StatsSkeleton
      className={className}
      count={count}
   />
)

const TableSkeleton = ({
   rows = 6,
   columns = 6
}: {
   rows?: number
   columns?: number
}) => (
   <Box className="bg-surface border-border overflow-hidden rounded-xl border p-5">
      <Skeleton
         height={28}
         width="25%"
      />
      <Box className="mt-4 space-y-3">
         {Array.from({ length: rows }).map((_, rowIndex) => (
            <Box
               className="flex gap-4"
               key={rowIndex}>
               {Array.from({ length: columns }).map((_, columnIndex) => (
                  <Skeleton
                     className="flex-1"
                     key={columnIndex}
                     height={38}
                  />
               ))}
            </Box>
         ))}
      </Box>
   </Box>
)

export const AdminDashboardSkeleton = () => (
   <Box className="space-y-5">
      <StatsSkeleton />
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <TableSkeleton
            columns={2}
            rows={5}
         />
         <TableSkeleton
            columns={2}
            rows={5}
         />
      </Box>
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <TableSkeleton
            columns={2}
            rows={5}
         />
         <TableSkeleton
            columns={2}
            rows={5}
         />
      </Box>
   </Box>
)

export const AdminListSkeleton = ({
   statCount = 4,
   filterFields = ["search", "control", "control"]
}: {
   statCount?: number
   filterFields?: FilterSkeletonField[]
}) => (
   <Box className="space-y-5">
      <StatsSkeleton count={statCount} />
      <FiltersBarSkeleton fields={filterFields} />
      <TableSkeleton rows={7} />
   </Box>
)

export const AdminDetailsSkeleton = () => (
   <Box className="space-y-5">
      <Skeleton
         height={34}
         variant="rounded"
         width="22%"
      />
      <Skeleton
         height={210}
         variant="rounded"
      />
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <Skeleton
            height={280}
            variant="rounded"
         />
         <Skeleton
            height={280}
            variant="rounded"
         />
      </Box>
   </Box>
)

export const AdminAuthorizationDetailsSkeleton = () => (
   <Box className="max-w-3xl space-y-5">
      <Skeleton
         height={38}
         variant="rounded"
         width={190}
      />
      <Box className="border-border bg-surface rounded-xl border p-6">
         <Skeleton
            height={36}
            variant="text"
            width="38%"
         />
         <Skeleton
            variant="text"
            width="52%"
         />
         <Box className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map(item => (
               <Box
                  className="space-y-2"
                  key={item}>
                  <Skeleton
                     variant="text"
                     width="45%"
                  />
                  <Skeleton
                     variant="text"
                     width="65%"
                  />
               </Box>
            ))}
         </Box>
         <Skeleton
            className="mt-6"
            height={92}
            variant="rounded"
         />
      </Box>
   </Box>
)

export const AdminUserDetailsSkeleton = () => (
   <Box className="w-full space-y-6">
      <Box className="border-border bg-surface flex min-h-32 items-center gap-4 rounded-xl border p-5">
         <Skeleton
            height={76}
            variant="circular"
            width={76}
         />
         <Box className="flex-1 space-y-2">
            <Skeleton
               height={32}
               variant="text"
               width="32%"
            />
            <Skeleton
               variant="text"
               width="48%"
            />
         </Box>
      </Box>
      <Box className="border-border flex gap-4 border-b py-2">
         {[0, 1, 2, 3].map(item => (
            <Skeleton
               key={item}
               height={34}
               variant="rounded"
               width={88}
            />
         ))}
      </Box>
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <Skeleton
            height={250}
            variant="rounded"
         />
         <Skeleton
            height={250}
            variant="rounded"
         />
         <Skeleton
            height={210}
            variant="rounded"
         />
         <Skeleton
            height={210}
            variant="rounded"
         />
      </Box>
   </Box>
)

export const AdminSupportDashboardSkeleton = () => (
   <Box className="space-y-5">
      <Box>
         <Skeleton
            height={34}
            variant="text"
            width={230}
         />
         <Skeleton
            variant="text"
            width={340}
         />
      </Box>
      <Box className="grid grid-cols-2 gap-3 md:grid-cols-5">
         {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
               key={index}
               height={92}
               variant="rounded"
            />
         ))}
      </Box>
      <Skeleton
         height={350}
         variant="rounded"
      />
   </Box>
)

export const AdminSupportTicketSkeleton = () => (
   <Box className="space-y-5">
      <Skeleton
         height={38}
         variant="rounded"
         width={150}
      />
      <Box className="border-border bg-surface rounded-xl border p-6">
         <Box className="border-border flex items-start justify-between gap-4 border-b pb-5">
            <Box className="w-full space-y-2">
               <Skeleton
                  variant="text"
                  width="25%"
               />
               <Skeleton
                  height={34}
                  variant="text"
                  width="58%"
               />
            </Box>
            <Skeleton
               height={32}
               variant="rounded"
               width={150}
            />
         </Box>
         <Box className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
               <Skeleton
                  key={index}
                  height={68}
                  variant="rounded"
               />
            ))}
         </Box>
         <Skeleton
            className="mt-5"
            height={110}
            variant="rounded"
         />
         <Skeleton
            className="mt-5"
            height={280}
            variant="rounded"
         />
      </Box>
   </Box>
)
