import { Box, Skeleton } from "@mui/material"

export const CompanyDashboardSkeleton = () => (
   <Box className="space-y-5">
      <Box className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
         {[1, 2, 3].map(item => (
            <Box
               className="border-border bg-surface rounded-xl border p-5"
               key={item}>
               <Skeleton
                  height={42}
                  variant="circular"
                  width={42}
               />
               <Skeleton
                  className="mt-3"
                  width="45%"
               />
               <Skeleton
                  height={34}
                  width="28%"
               />
               <Skeleton width="38%" />
            </Box>
         ))}
      </Box>

      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
         <Skeleton
            height={280}
            variant="rounded"
         />
         <Skeleton
            height={280}
            variant="rounded"
         />
      </Box>

      <Skeleton
         height={240}
         variant="rounded"
      />
   </Box>
)

export const CompanyApplicationsSkeleton = () => (
   <Box className="space-y-3 p-5">
      <Skeleton width="35%" />
      {[1, 2, 3, 4, 5, 6].map(item => (
         <Skeleton
            key={item}
            height={42}
            variant="rounded"
         />
      ))}
   </Box>
)

export const CompanyApplicationStatsSkeleton = () => (
   <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
         <Box
            className="border-border bg-surface rounded-xl border p-4"
            key={index}>
            <Skeleton
               variant="text"
               width="58%"
            />
            <Skeleton
               height={36}
               variant="text"
               width="36%"
            />
         </Box>
      ))}
   </Box>
)

export const CompanyProfileSkeleton = () => (
   <Box className="space-y-5 p-5 lg:p-6">
      <Skeleton
         height={210}
         variant="rounded"
      />
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <Skeleton
            height={300}
            variant="rounded"
         />
         <Skeleton
            height={300}
            variant="rounded"
         />
      </Box>
      <Skeleton
         height={150}
         variant="rounded"
      />
   </Box>
)

export const EditCompanyProfileSkeleton = () => (
   <Box className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Box className="space-y-4">
         <Skeleton
            height={430}
            variant="rounded"
         />
         <Skeleton
            height={120}
            variant="rounded"
         />
      </Box>
      <Box className="space-y-4">
         <Skeleton
            height={220}
            variant="rounded"
         />
         <Skeleton
            height={320}
            variant="rounded"
         />
      </Box>
   </Box>
)

export const CompanyTableSkeleton = () => (
   <Box className="space-y-3 p-5">
      {[1, 2, 3, 4, 5, 6].map(item => (
         <Skeleton
            key={item}
            height={48}
            variant="rounded"
         />
      ))}
   </Box>
)

export const CompanyCandidateProfileSkeleton = () => (
   <Box className="w-full space-y-5">
      <Skeleton
         height={38}
         variant="rounded"
         width={140}
      />
      <Box className="border-border bg-surface flex min-h-28 items-center gap-4 rounded-xl border p-5">
         <Skeleton
            height={80}
            variant="circular"
            width={80}
         />
         <Box className="flex-1 space-y-2">
            <Skeleton
               height={30}
               variant="text"
               width="34%"
            />
            <Skeleton
               variant="text"
               width="46%"
            />
         </Box>
      </Box>
      <Box className="grid grid-cols-2 gap-3 md:grid-cols-4">
         {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
               key={index}
               height={88}
               variant="rounded"
            />
         ))}
      </Box>
      <Box className="border-border flex gap-3 border-b py-2">
         {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
               key={index}
               height={32}
               variant="rounded"
               width={90}
            />
         ))}
      </Box>
      <Box className="grid grid-cols-1 gap-4 xl:grid-cols-2">
         <Skeleton
            height={260}
            variant="rounded"
         />
         <Skeleton
            height={260}
            variant="rounded"
         />
         <Skeleton
            height={200}
            variant="rounded"
         />
         <Skeleton
            height={200}
            variant="rounded"
         />
      </Box>
   </Box>
)

export const CompanyDetailsSkeleton = () => (
   <Box className="space-y-5 p-6">
      <Skeleton
         height={30}
         width="35%"
      />
      <Skeleton
         height={150}
         variant="rounded"
      />
      <Skeleton
         height={220}
         variant="rounded"
      />
   </Box>
)
