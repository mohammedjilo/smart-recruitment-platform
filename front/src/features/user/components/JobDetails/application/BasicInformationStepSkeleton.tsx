import { Box, Skeleton } from "@mui/material"

const BasicInformationStepSkeleton = () => (
   <Box>
      <Skeleton
         height={28}
         variant="text"
         width={170}
      />
      <Box className="mt-4 grid grid-cols-2 gap-5">
         {Array.from({ length: 6 }).map((_, index) => (
            <Box
               className="space-y-2"
               key={index}>
               <Skeleton
                  variant="text"
                  width="42%"
               />
               <Skeleton
                  height={40}
                  variant="rounded"
               />
            </Box>
         ))}
      </Box>
      <Skeleton
         className="mt-6"
         height={90}
         variant="rounded"
      />
   </Box>
)

export default BasicInformationStepSkeleton
