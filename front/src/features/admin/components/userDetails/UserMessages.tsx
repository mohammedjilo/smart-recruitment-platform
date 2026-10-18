import { ChatBubbleOutlined, MarkEmailReadOutlined } from "@mui/icons-material"

import { Box, Typography } from "@mui/material"

type Props = {
   userId: string
}

const UserMessages = ({ userId }: Props) => {
   return (
      <Box className="rounded-xl border border-border bg-surface shadow-sm">
         <Box className="border-b border-border px-6 py-5">
            <Box className="flex items-center gap-3">
               <Box className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <ChatBubbleOutlined />
               </Box>

               <Box>
                  <Typography
                     variant="h6"
                     className="font-bold text-content">
                     Messages
                  </Typography>

                  <Typography
                     variant="body2"
                     className="mt-1 text-muted">
                     View conversations and messages related to this user.
                  </Typography>
               </Box>
            </Box>
         </Box>

         <Box className="flex min-h-87.5 flex-col items-center justify-center px-6 py-12 text-center">
            <Box className="flex h-16 w-16 items-center justify-center rounded-full bg-bg text-violet-600">
               <MarkEmailReadOutlined fontSize="large" />
            </Box>

            <Typography
               variant="h6"
               className="mt-5 font-semibold text-content">
               No messages loaded
            </Typography>

            <Typography
               variant="body2"
               className="mt-2 max-w-md text-muted">
               User messages will be displayed here when the messages API is connected.
            </Typography>

            <Box className="hidden">{userId}</Box>
         </Box>
      </Box>
   )
}

export default UserMessages
