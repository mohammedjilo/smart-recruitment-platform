import { Box, Skeleton } from "@mui/material"

const QuestionsListSkeleton = () => (
   <Box className="overflow-hidden rounded-xl">
      {Array.from({ length: 4 }).map((_, index) => (
         <Box
            className="border-border flex items-center gap-5 border-b p-6 last:border-b-0"
            key={index}>
            <Skeleton
               height={36}
               variant="rounded"
               width={36}
            />
            <Box className="flex-1">
               <Skeleton
                  height={24}
                  width="55%"
               />
               <Skeleton
                  height={18}
                  width="30%"
               />
            </Box>
         </Box>
      ))}
   </Box>
)

export default QuestionsListSkeleton
