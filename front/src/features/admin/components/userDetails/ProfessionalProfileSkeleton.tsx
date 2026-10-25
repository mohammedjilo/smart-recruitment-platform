import { Box, Skeleton } from "@mui/material"

const ProfessionalProfileSkeleton = () => (
   <Box className="space-y-4 pt-5">
      <Skeleton
         height={30}
         variant="text"
         width="42%"
      />
      <Skeleton
         variant="text"
         width="30%"
      />
      {[0, 1, 2, 3].map(item => (
         <Box
            className="border-border flex gap-3 border-t pt-4"
            key={item}>
            <Skeleton
               height={36}
               variant="rounded"
               width={36}
            />
            <Box className="flex-1 space-y-2">
               <Skeleton
                  variant="text"
                  width="28%"
               />
               <Skeleton
                  variant="text"
                  width="75%"
               />
            </Box>
         </Box>
      ))}
   </Box>
)

export default ProfessionalProfileSkeleton
