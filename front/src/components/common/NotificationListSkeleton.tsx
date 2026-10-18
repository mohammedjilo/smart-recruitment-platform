import { Box, Skeleton } from "@mui/material"

const NotificationListSkeleton = ({ rows = 6 }: { rows?: number }) => (
   <Box className="border-border bg-surface overflow-hidden rounded-xl border">
      {Array.from({ length: rows }).map((_, index) => (
         <Box
            key={index}
            className="border-border flex min-h-20 items-start gap-4 border-b px-5 py-4 last:border-b-0">
            <Skeleton
               variant="circular"
               width={38}
               height={38}
               className="shrink-0"
            />
            <Box className="flex-1 space-y-1">
               <Skeleton
                  variant="text"
                  width="62%"
               />
               <Skeleton
                  variant="text"
                  width="38%"
               />
            </Box>
            <Skeleton
               variant="text"
               width={72}
            />
         </Box>
      ))}
   </Box>
)

export default NotificationListSkeleton
