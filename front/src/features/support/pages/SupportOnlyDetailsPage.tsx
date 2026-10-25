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
import SupportChip from "@/features/shared/support/components/SupportChip"
import PriorityChip from "@/features/shared/support/components/PriorityChip"

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
               className="mt-3 normal-case"
               component={Link}
               to="/support-only">
               Back to requests
            </Button>
         </Box>
      )
   }

   return (
      <Box className="mx-auto max-w-4xl">
         <Button
            className="mb-4 normal-case"
            component={Link}
            to="/support-only">
            Back to requests
         </Button>
         <Box className="bg-surface border-border rounded-xl border p-6 sm:p-8">
            <Box className="flex flex-wrap items-start justify-between gap-4">
               <Box>
                  <Typography
                     className="text-content font-bold"
                     component="h2"
                     variant="h5">
                     {ticket.subject}
                  </Typography>
                  <Typography className="text-muted mt-1 text-xs">
                     Created {formatCreatedAt(ticket.createdAt)}
                  </Typography>
               </Box>
               <Box className="flex gap-2">
                  <SupportChip
                     value={ticket.status}
                     kind="status"
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
               className="text-content font-semibold"
               component="h3">
               Conversation
            </Typography>
            <Box className="mt-4 space-y-3">
               {ticket.messages.map(message => {
                  const isAdmin = message.authorUser?.role === "ADMIN"
                  return (
                     <Box
                        className={`border-border rounded-lg border p-4 ${isAdmin ? "bg-primary-tint" : "bg-bg"}`}
                        key={message.id}>
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
                  className="mt-5"
                  severity="info">
                  This ticket is closed and cannot receive replies.
               </Alert>
            ) : (
               <Box className="border-border mt-6 border-t pt-5">
                  {replyResult.isError && (
                     <Alert
                        className="mb-3"
                        severity="error">
                        {errorText(replyResult.error)}
                     </Alert>
                  )}
                  <TextField
                     value={content}
                     fullWidth
                     label="Reply"
                     minRows={4}
                     multiline
                     slotProps={{ htmlInput: { maxLength: 2000 } }}
                     onChange={event => setContent(event.target.value)}
                  />
                  <Box className="mt-3 flex justify-end">
                     <Button
                        disabled={!content.trim() || replyResult.isLoading}
                        variant="contained"
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
