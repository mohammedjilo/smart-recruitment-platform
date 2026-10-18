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
            key={index}
            className="bg-surface rounded-xl border p-5">
            <Skeleton
               variant="circular"
               width={48}
               height={48}
            />
            <Skeleton
               className="mt-3"
               width="45%"
            />
            <Skeleton
               className="mt-1"
               width="30%"
               height={32}
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
      count={count}
      className={className}
   />
)

const TableSkeleton = ({
   rows = 6,
   columns = 6
}: {
   rows?: number
   columns?: number
}) => (
   <Box className="bg-surface overflow-hidden rounded-xl border p-5">
      <Skeleton
         height={28}
         width="25%"
      />
      <Box className="mt-4 space-y-3">
         {Array.from({ length: rows }).map((_, rowIndex) => (
            <Box
               key={rowIndex}
               className="flex gap-4">
               {Array.from({ length: columns }).map((_, columnIndex) => (
                  <Skeleton
                     key={columnIndex}
                     className="flex-1"
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
            rows={5}
            columns={2}
         />
         <TableSkeleton
            rows={5}
            columns={2}
         />
      </Box>
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <TableSkeleton
            rows={5}
            columns={2}
         />
         <TableSkeleton
            rows={5}
            columns={2}
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
         variant="rounded"
         height={34}
         width="22%"
      />
      <Skeleton
         variant="rounded"
         height={210}
      />
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <Skeleton
            variant="rounded"
            height={280}
         />
         <Skeleton
            variant="rounded"
            height={280}
         />
      </Box>
   </Box>
)

export const AdminAuthorizationDetailsSkeleton = () => (
   <Box className="max-w-3xl space-y-5">
      <Skeleton
         variant="rounded"
         width={190}
         height={38}
      />
      <Box className="border-border bg-surface rounded-xl border p-6">
         <Skeleton
            variant="text"
            width="38%"
            height={36}
         />
         <Skeleton
            variant="text"
            width="52%"
         />
         <Box className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[0, 1, 2].map(item => (
               <Box
                  key={item}
                  className="space-y-2">
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
            variant="rounded"
            height={92}
            className="mt-6"
         />
      </Box>
   </Box>
)

export const AdminUserDetailsSkeleton = () => (
   <Box className="w-full space-y-6">
      <Box className="border-border bg-surface flex min-h-32 items-center gap-4 rounded-xl border p-5">
         <Skeleton
            variant="circular"
            width={76}
            height={76}
         />
         <Box className="flex-1 space-y-2">
            <Skeleton
               variant="text"
               width="32%"
               height={32}
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
               variant="rounded"
               width={88}
               height={34}
            />
         ))}
      </Box>
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <Skeleton
            variant="rounded"
            height={250}
         />
         <Skeleton
            variant="rounded"
            height={250}
         />
         <Skeleton
            variant="rounded"
            height={210}
         />
         <Skeleton
            variant="rounded"
            height={210}
         />
      </Box>
   </Box>
)

export const AdminSupportDashboardSkeleton = () => (
   <Box className="space-y-5">
      <Box>
         <Skeleton
            variant="text"
            width={230}
            height={34}
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
               variant="rounded"
               height={92}
            />
         ))}
      </Box>
      <Skeleton
         variant="rounded"
         height={350}
      />
   </Box>
)

export const AdminSupportTicketSkeleton = () => (
   <Box className="space-y-5">
      <Skeleton
         variant="rounded"
         width={150}
         height={38}
      />
      <Box className="border-border bg-surface rounded-xl border p-6">
         <Box className="border-border flex items-start justify-between gap-4 border-b pb-5">
            <Box className="w-full space-y-2">
               <Skeleton
                  variant="text"
                  width="25%"
               />
               <Skeleton
                  variant="text"
                  width="58%"
                  height={34}
               />
            </Box>
            <Skeleton
               variant="rounded"
               width={150}
               height={32}
            />
         </Box>
         <Box className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
               <Skeleton
                  key={index}
                  variant="rounded"
                  height={68}
               />
            ))}
         </Box>
         <Skeleton
            variant="rounded"
            height={110}
            className="mt-5"
         />
         <Skeleton
            variant="rounded"
            height={280}
            className="mt-5"
         />
      </Box>
   </Box>
)

export const AdminProfileSnapshotSkeleton = () => (
   <Box className="space-y-4">
      <Skeleton
         variant="rounded"
         height={120}
      />
      <Box className="grid grid-cols-2 gap-3 md:grid-cols-4">
         {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
               key={index}
               variant="rounded"
               height={82}
            />
         ))}
      </Box>
      <Box className="border-border flex gap-3 border-b py-2">
         {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
               key={index}
               variant="rounded"
               width={84}
               height={32}
            />
         ))}
      </Box>
      <Box className="grid grid-cols-1 gap-4 xl:grid-cols-2">
         <Skeleton
            variant="rounded"
            height={240}
         />
         <Skeleton
            variant="rounded"
            height={240}
         />
      </Box>
   </Box>
)
