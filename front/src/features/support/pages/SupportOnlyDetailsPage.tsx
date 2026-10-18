import { useState } from "react"
import {
   Alert,
   Box,
   Button,
   CircularProgress,
   Divider,
   TextField,
   Typography
} from "@mui/material"
import { Link, useParams } from "react-router-dom"
import {
   useAddSupportOnlyMessageMutation,
   useGetSupportOnlyTicketQuery
} from "@/services/api/supportOnlyApi"
import { formatCreatedAt } from "@/utils/formatDate"
import SupportChip from "@/features/support/components/SupportChip"
import PriorityChip from "@/features/support/components/PriorityChip"

const errorText = (error: unknown) => {
   if (typeof error === "object" && error !== null && "data" in error) {
      const data = error.data
      if (typeof data === "object" && data !== null && "error" in data) {
         const apiError = data.error
         if (
            typeof apiError === "object" &&
            apiError !== null &&
            "message" in apiError &&
            typeof apiError.message === "string"
         ) {
            return apiError.message
         }
      }
   }
   return "This support request is unavailable."
}

export default function SupportOnlyDetailsPage() {
   const { ticketId = "" } = useParams()
   const [content, setContent] = useState("")
   const ticketQuery = useGetSupportOnlyTicketQuery(ticketId, { skip: !ticketId })
   const [reply, replyResult] = useAddSupportOnlyMessageMutation()
   const ticket = ticketQuery.data?.data

   const sendReply = async () => {
      if (!content.trim() || !ticketId || ticket?.status === "CLOSED") return
      try {
         await reply({ ticketId, content: content.trim() }).unwrap()
         setContent("")
      } catch {
         return
      }
   }

   if (ticketQuery.isLoading) {
      return (
         <Box className="flex justify-center py-16">
            <CircularProgress />
         </Box>
      )
   }
   if (ticketQuery.isError || !ticket) {
      return (
         <Box className="bg-surface border-border rounded-xl border p-6">
            <Alert severity="error">{errorText(ticketQuery.error)}</Alert>
            <Button
               component={Link}
               to="/support-only"
               className="mt-3 normal-case">
               Back to requests
            </Button>
         </Box>
      )
   }

   return (
      <Box className="mx-auto max-w-4xl">
         <Button
            component={Link}
            to="/support-only"
            className="mb-4 normal-case">
            Back to requests
         </Button>
         <Box className="bg-surface border-border rounded-xl border p-6 sm:p-8">
            <Box className="flex flex-wrap items-start justify-between gap-4">
               <Box>
                  <Typography
                     component="h2"
                     variant="h5"
                     className="text-content font-bold">
                     {ticket.subject}
                  </Typography>
                  <Typography className="text-muted mt-1 text-xs">
                     Created {formatCreatedAt(ticket.createdAt)}
                  </Typography>
               </Box>
               <Box className="flex gap-2">
                  <SupportChip
                     kind="status"
                     value={ticket.status}
                  />
                  <PriorityChip priority={ticket.priority} />
               </Box>
            </Box>
            <Box className="bg-bg border-border mt-5 rounded-lg border p-4">
               <Typography className="text-muted text-xs font-semibold uppercase">
                  Description
               </Typography>
               <Typography className="text-content mt-2 text-sm leading-6 whitespace-pre-line">
                  {ticket.description}
               </Typography>
            </Box>
            <Divider className="my-5" />
            <Typography
               component="h3"
               className="text-content font-semibold">
               Conversation
            </Typography>
            <Box className="mt-4 space-y-3">
               {ticket.messages.map(message => {
                  const isAdmin = message.authorUser?.role === "ADMIN"
                  return (
                     <Box
                        key={message.id}
                        className={`border-border rounded-lg border p-4 ${isAdmin ? "bg-primary-tint" : "bg-bg"}`}>
                        <Box className="flex items-center justify-between gap-3">
                           <Typography className="text-content text-sm font-semibold">
                              {isAdmin
                                 ? `${message.authorUser?.firstName ?? ""} ${message.authorUser?.lastName ?? ""}`.trim() ||
                                   "Support team"
                                 : message.authorUser
                                   ? `${message.authorUser.firstName ?? ""} ${message.authorUser.lastName ?? ""}`.trim()
                                   : (message.authorCompany?.companyName ?? "You")}
                           </Typography>
                           <Typography className="text-muted text-xs">
                              {formatCreatedAt(message.createdAt)}
                           </Typography>
                        </Box>
                        <Typography className="text-muted mt-2 text-sm leading-6 whitespace-pre-line">
                           {message.content}
                        </Typography>
                     </Box>
                  )
               })}
            </Box>
            {ticket.status === "CLOSED" ? (
               <Alert
                  severity="info"
                  className="mt-5">
                  This ticket is closed and cannot receive replies.
               </Alert>
            ) : (
               <Box className="border-border mt-6 border-t pt-5">
                  {replyResult.isError && (
                     <Alert
                        severity="error"
                        className="mb-3">
                        {errorText(replyResult.error)}
                     </Alert>
                  )}
                  <TextField
                     fullWidth
                     multiline
                     minRows={4}
                     label="Reply"
                     value={content}
                     onChange={event => setContent(event.target.value)}
                     slotProps={{ htmlInput: { maxLength: 2000 } }}
                  />
                  <Box className="mt-3 flex justify-end">
                     <Button
                        variant="contained"
                        disabled={!content.trim() || replyResult.isLoading}
                        onClick={() => void sendReply()}>
                        {replyResult.isLoading ? "Sending..." : "Send reply"}
                     </Button>
                  </Box>
               </Box>
            )}
         </Box>
      </Box>
   )
}
