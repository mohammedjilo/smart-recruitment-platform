import { Box, Skeleton } from "@mui/material"

const CompanyDetailsSkeleton = () => {
   return (
      <Box className="p-5 lg:p-6">
         <Box className="mb-3 flex justify-end">
            <Skeleton
               variant="rounded"
               width={220}
               height={40}
            />
         </Box>

         <Skeleton
            variant="rounded"
            height={220}
            className="rounded-xl"
         />

         <Box className="mt-3">
            <Skeleton
               width={240}
               height={45}
            />
         </Box>

         <Box className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-[1.55fr_1fr]">
            <Box className="space-y-3">
               <Skeleton
                  variant="rounded"
                  height={180}
               />

               <Skeleton
                  variant="rounded"
                  height={230}
               />

               <Skeleton
                  variant="rounded"
                  height={260}
               />
            </Box>

            <Skeleton
               variant="rounded"
               height={380}
            />
         </Box>
      </Box>
   )
}

export default CompanyDetailsSkeleton
