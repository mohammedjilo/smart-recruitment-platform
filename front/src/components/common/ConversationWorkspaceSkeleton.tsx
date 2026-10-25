import { Box, Skeleton } from "@mui/material"

const ConversationWorkspaceSkeleton = () => (
   <Box className="space-y-4">
      <Skeleton
         height={36}
         variant="text"
         width={180}
      />
      <Box className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
         <Box className="border-border bg-surface overflow-hidden rounded-xl border">
            <Skeleton
               className="mx-4 my-3"
               variant="text"
               width="45%"
            />
            {Array.from({ length: 6 }).map((_, index) => (
               <Box
                  className="border-border space-y-1 border-t px-4 py-3"
                  key={index}>
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
            height="70vh"
            variant="rounded"
         />
      </Box>
   </Box>
)

export default ConversationWorkspaceSkeleton
