import { Box, Skeleton } from "@mui/material"

const ApplicationsStepHeaderSkeleton = () => (
   <Box className="space-y-2">
      <Skeleton
         height={32}
         width={260}
      />
      <Skeleton width={320} />
   </Box>
)

export default ApplicationsStepHeaderSkeleton
