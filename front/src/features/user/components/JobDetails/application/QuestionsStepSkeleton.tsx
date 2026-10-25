import { Box, Skeleton } from "@mui/material"

const QuestionsStepSkeleton = () => (
   <Box className="space-y-4">
      <Box>
         <Skeleton
            height={26}
            variant="text"
            width={130}
         />
         <Skeleton
            variant="text"
            width="72%"
         />
      </Box>
      {[0, 1, 2].map(item => (
         <Skeleton
            key={item}
            height={112}
            variant="rounded"
         />
      ))}
   </Box>
)

export default QuestionsStepSkeleton
