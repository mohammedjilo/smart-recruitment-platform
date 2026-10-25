import { Box, Skeleton } from "@mui/material"

const CompanyDetailsSkeleton = () => {
   return (
      <Box className="p-5 lg:p-6">
         <Box className="mb-3 flex justify-end">
            <Skeleton
               height={40}
               variant="rounded"
               width={220}
            />
         </Box>

         <Skeleton
            className="rounded-xl"
            height={220}
            variant="rounded"
         />

         <Box className="mt-3">
            <Skeleton
               height={45}
               width={240}
            />
         </Box>

         <Box className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.55fr_1fr]">
            <Box className="space-y-3">
               <Skeleton
                  height={180}
                  variant="rounded"
               />

               <Skeleton
                  height={230}
                  variant="rounded"
               />

               <Skeleton
                  height={260}
                  variant="rounded"
               />
            </Box>

            <Skeleton
               height={380}
               variant="rounded"
            />
         </Box>
      </Box>
   )
}

export default CompanyDetailsSkeleton
