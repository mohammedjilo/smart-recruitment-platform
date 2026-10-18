import { Box, Skeleton } from "@mui/material"

export const CompanyDashboardSkeleton = () => (
   <Box className="space-y-5">
      <Box className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
         {[1, 2, 3].map(item => (
            <Box
               key={item}
               className="border-border bg-surface rounded-xl border p-5">
               <Skeleton
                  variant="circular"
                  width={42}
                  height={42}
               />
               <Skeleton
                  className="mt-3"
                  width="45%"
               />
               <Skeleton
                  width="28%"
                  height={34}
               />
               <Skeleton width="38%" />
            </Box>
         ))}
      </Box>

      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
         <Skeleton
            variant="rounded"
            height={280}
         />
         <Skeleton
            variant="rounded"
            height={280}
         />
      </Box>

      <Skeleton
         variant="rounded"
         height={240}
      />
   </Box>
)

export const CompanyApplicationsSkeleton = () => (
   <Box className="space-y-3 p-5">
      <Skeleton width="35%" />
      {[1, 2, 3, 4, 5, 6].map(item => (
         <Skeleton
            key={item}
            variant="rounded"
            height={42}
         />
      ))}
   </Box>
)

export const CompanyApplicationStatsSkeleton = () => (
   <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
         <Box
            key={index}
            className="border-border bg-surface rounded-xl border p-4">
            <Skeleton
               variant="text"
               width="58%"
            />
            <Skeleton
               variant="text"
               width="36%"
               height={36}
            />
         </Box>
      ))}
   </Box>
)

export const CompanyProfileSkeleton = () => (
   <Box className="space-y-5 p-5 lg:p-6">
      <Skeleton
         variant="rounded"
         height={210}
      />
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <Skeleton
            variant="rounded"
            height={300}
         />
         <Skeleton
            variant="rounded"
            height={300}
         />
      </Box>
      <Skeleton
         variant="rounded"
         height={150}
      />
   </Box>
)

export const EditCompanyProfileSkeleton = () => (
   <Box className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <Box className="space-y-4">
         <Skeleton
            variant="rounded"
            height={430}
         />
         <Skeleton
            variant="rounded"
            height={120}
         />
      </Box>
      <Box className="space-y-4">
         <Skeleton
            variant="rounded"
            height={220}
         />
         <Skeleton
            variant="rounded"
            height={320}
         />
      </Box>
   </Box>
)

export const CompanyTableSkeleton = () => (
   <Box className="space-y-3 p-5">
      {[1, 2, 3, 4, 5, 6].map(item => (
         <Skeleton
            key={item}
            variant="rounded"
            height={48}
         />
      ))}
   </Box>
)

export const CompanyCandidateProfileSkeleton = () => (
   <Box className="w-full space-y-5">
      <Skeleton
         variant="rounded"
         width={140}
         height={38}
      />
      <Box className="border-border bg-surface flex min-h-28 items-center gap-4 rounded-xl border p-5">
         <Skeleton
            variant="circular"
            width={80}
            height={80}
         />
         <Box className="flex-1 space-y-2">
            <Skeleton
               variant="text"
               width="34%"
               height={30}
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
               variant="rounded"
               height={88}
            />
         ))}
      </Box>
      <Box className="border-border flex gap-3 border-b py-2">
         {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton
               key={index}
               variant="rounded"
               width={90}
               height={32}
            />
         ))}
      </Box>
      <Box className="grid grid-cols-1 gap-4 xl:grid-cols-2">
         <Skeleton
            variant="rounded"
            height={260}
         />
         <Skeleton
            variant="rounded"
            height={260}
         />
         <Skeleton
            variant="rounded"
            height={200}
         />
         <Skeleton
            variant="rounded"
            height={200}
         />
      </Box>
   </Box>
)

export const CompanyDetailsSkeleton = () => (
   <Box className="space-y-5 p-6">
      <Skeleton
         width="35%"
         height={30}
      />
      <Skeleton
         variant="rounded"
         height={150}
      />
      <Skeleton
         variant="rounded"
         height={220}
      />
   </Box>
)
