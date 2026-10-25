import { Box, Skeleton } from "@mui/material"

const ConversationMessagesSkeleton = () => (
   <Box className="bg-bg flex min-h-0 flex-1 flex-col justify-end gap-4 p-4">
      {["58%", "42%", "68%", "36%", "54%"].map((width, index) => (
         <Box
            className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}
            key={index}>
            <Skeleton
               className="max-w-[80%]"
               height={index % 2 === 0 ? 56 : 42}
               variant="rounded"
               width={width}
            />
         </Box>
      ))}
   </Box>
)

export default ConversationMessagesSkeleton
