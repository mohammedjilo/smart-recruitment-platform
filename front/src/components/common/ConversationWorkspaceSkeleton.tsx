import { Box, Skeleton } from "@mui/material"

const ConversationWorkspaceSkeleton = () => (
   <Box className="space-y-4">
      <Skeleton
         variant="text"
         width={180}
         height={36}
      />
      <Box className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
         <Box className="border-border bg-surface overflow-hidden rounded-xl border">
            <Skeleton
               variant="text"
               width="45%"
               className="mx-4 my-3"
            />
            {Array.from({ length: 6 }).map((_, index) => (
               <Box
                  key={index}
                  className="border-border space-y-1 border-t px-4 py-3">
                  <Skeleton
                     variant="text"
                     width="52%"
                  />
                  <Skeleton
                     variant="text"
                     width="72%"
                  />
               </Box>
            ))}
         </Box>
         <Skeleton
            variant="rounded"
            height="70vh"
         />
      </Box>
   </Box>
)

export default ConversationWorkspaceSkeleton
