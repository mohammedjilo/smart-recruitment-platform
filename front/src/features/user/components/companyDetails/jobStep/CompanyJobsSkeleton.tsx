import { Box, Skeleton } from "@mui/material"

const CompanyJobsSkeleton = () => (
   <Box className="border-border bg-surface overflow-hidden rounded-xl border">
      {Array.from({ length: 6 }).map((_, index) => (
         <Box
            className="border-border grid min-h-24 grid-cols-1 items-center gap-4 border-b px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_150px_120px]"
            key={index}>
            <Box className="space-y-2">
               <Skeleton
                  variant="text"
                  width="52%"
               />
               <Skeleton
                  variant="text"
                  width="35%"
               />
            </Box>
            <Skeleton
               height={30}
               variant="rounded"
               width={126}
            />
            <Skeleton
               height={36}
               variant="rounded"
               width={112}
            />
         </Box>
      ))}
   </Box>
)

export default CompanyJobsSkeleton
