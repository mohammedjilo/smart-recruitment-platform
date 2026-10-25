import { Box, Skeleton } from "@mui/material"

const ProfileSnapshotStepSkeleton = () => (
   <Box className="space-y-4">
      <Skeleton
         height={120}
         variant="rounded"
      />
      <Box className="grid grid-cols-2 gap-3 md:grid-cols-4">
         {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton
               key={index}
               height={82}
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
               width={84}
            />
         ))}
      </Box>
      <Box className="grid grid-cols-1 gap-4 xl:grid-cols-2">
         <Skeleton
            height={240}
            variant="rounded"
         />
         <Skeleton
            height={240}
            variant="rounded"
         />
      </Box>
   </Box>
)

export default ProfileSnapshotStepSkeleton
