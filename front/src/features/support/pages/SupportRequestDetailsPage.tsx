import { useState } from "react"
import {
   Alert,
   Box,
   Button,
   Divider,
   Skeleton,
   TextField,
   Typography
} from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import {
   useAddSupportMessageMutation,
   useGetSupportTicketByIdQuery
} from "@/services/shared/supportApiCalls"
import { formatCreatedAt } from "@/utils/formatDate"
import SupportChip from "@/features/support/components/SupportChip"
import PriorityChip from "@/features/support/components/PriorityChip"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

type Props = {
   portalType: "user" | "company"
}

export default function SupportRequestDetailsPage({ portalType }: Props) {
   const navigate = useNavigate()
   const { ticketId } = useParams()
   const [message, setMessage] = useState("")

   const { data, isLoading, isError } = useGetSupportTicketByIdQuery(ticketId ?? "", {
      skip: !ticketId
   })

   const [addMessageMutation, messageResult] = useAddSupportMessageMutation()
   const messageState = getMutationState(messageResult)
   const messagePresentation = getMutationPresentation(messageState, {
      surface: "form"
   })
   const isSending = messagePresentation.category === "loading"

   const ticket = data?.data

   if (isLoading) {
      return (
         <Box className="min-h-screen bg-[#f7fbff] px-4 py-8 sm:px-6 lg:px-8">
            <Box className="mx-auto max-w-4xl space-y-5">
               <Skeleton
                  variant="rounded"
                  width={150}
                  height={34}
               />
               <Box className="border-border bg-surface overflow-hidden rounded-2xl border">
                  <Skeleton
                     variant="rounded"
                     height={130}
                  />
                  <Box className="space-y-5 p-6">
                     <Box className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[0, 1, 2].map(item => (
                           <Skeleton
                              key={item}
                              variant="rounded"
                              height={76}
                           />
                        ))}
                     </Box>
                     <Skeleton
                        variant="rounded"
                        height={150}
                     />
                     <Skeleton
                        variant="rounded"
                        height={280}
                     />
                  </Box>
               </Box>
            </Box>
         </Box>
      )
   }

   if (isError || !ticket) {
      return (
         <Box className="min-h-screen bg-[#f7fbff] px-4 py-10">
            <Box className="border-border bg-surface mx-auto max-w-xl rounded-2xl border p-8 shadow-[0_8px_35px_rgba(30,64,175,0.05)]">
               <Typography
                  variant="h5"
                  className="text-content font-bold!">
                  Ticket not found
               </Typography>
               <Typography
                  variant="body2"
                  className="text-muted mt-2!">
                  We could not find this support request.
               </Typography>
               <Button
                  variant="contained"
                  onClick={() =>
                     navigate(
                        portalType === "company" ? "/company/support" : "/user/support"
                     )
                  }
                  className="mt-3! rounded-[10px]! normal-case!">
                  Back to Support & Help
               </Button>
            </Box>
         </Box>
      )
   }

   const handleSendMessage = async () => {
      if (!message.trim() || !ticketId) {
         return
      }

      if (isSending) return
      try {
         await addMessageMutation({
            ticketId,
            content: message.trim()
         }).unwrap()
         setMessage("")
      } catch {
         // Mutation error state is normalized and rendered below.
      }
   }

   const getAuthorName = (ticketItem: typeof ticket) => {
      if (ticketItem.creatorUser) {
         return `${ticketItem.creatorUser.firstName ?? ""} ${ticketItem.creatorUser.lastName ?? ""}`.trim()
      }

      if (ticketItem.creatorCompany) {
         return ticketItem.creatorCompany.companyName
      }

      return "You"
   }

   return (
      <Box className="min-h-screen bg-[#f7fbff] px-4 py-8 sm:px-6 lg:px-8">
         <Box className="mx-auto max-w-4xl">
            <Box className="mb-5 flex items-center justify-between gap-3">
               <button
                  type="button"
                  onClick={() =>
                     navigate(
                        portalType === "company" ? "/company/support" : "/user/support"
                     )
                  }
                  className="text-muted text-sm font-medium transition-colors hover:text-blue-600">
                  ← Back to Support & Help
               </button>
            </Box>

            <Box className="border-border bg-surface overflow-hidden rounded-2xl border shadow-[0_8px_35px_rgba(30,64,175,0.05)]">
               <Box className="border-border border-b bg-[#f8fbff] p-6 sm:p-8">
                  <Box className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                     <Box>
                        <Typography className="text-[11px]! font-semibold! tracking-[0.18em]! text-blue-500! uppercase!">
                           Support request
                        </Typography>
                        <Typography className="text-content! mt-2! text-2xl! font-bold!">
                           {ticket.subject}
                        </Typography>
                     </Box>

                     <Box className="flex flex-wrap gap-2">
                        <SupportChip
                           kind="status"
                           value={ticket.status}
                        />
                        <PriorityChip priority={ticket.priority} />
                     </Box>
                  </Box>
               </Box>

               <Box className="p-6 sm:p-8">
                  <Box className="grid gap-5 md:grid-cols-3">
                     <Box className="bg-bg rounded-xl p-4">
                        <Typography className="text-muted! text-[11px]! font-semibold! uppercase!">
                           Created
                        </Typography>
                        <Typography className="text-content! mt-2! text-sm! font-medium!">
                           {formatCreatedAt(ticket.createdAt)}
                        </Typography>
                     </Box>

                     <Box className="bg-bg rounded-xl p-4">
                        <Typography className="text-muted! text-[11px]! font-semibold! uppercase!">
                           Category
                        </Typography>
                        <Typography className="text-content! mt-2! text-sm! font-medium!">
                           {ticket.category?.name ?? "General"}
                        </Typography>
                     </Box>

                     <Box className="bg-bg rounded-xl p-4">
                        <Typography className="text-muted! text-[11px]! font-semibold! uppercase!">
                           Requested by
                        </Typography>
                        <Typography className="text-content! mt-2! text-sm! font-medium!">
                           {getAuthorName(ticket)}
                        </Typography>
                     </Box>
                  </Box>

                  <Box className="border-border bg-bg mt-6 rounded-xl border p-5">
                     <Typography className="text-muted! text-[11px]! font-semibold! uppercase!">
                        Description
                     </Typography>
                     <Typography className="text-muted! mt-3! text-sm! leading-6! whitespace-pre-line!">
                        {ticket.description}
                     </Typography>
                  </Box>

                  <Divider className="my-5!" />

                  <Box>
                     <Typography className="text-content! text-base! font-bold!">
                        Conversation
                     </Typography>

                     <Box className="mt-4 space-y-4">
                        {ticket.messages.length === 0 ? (
                           <Box className="border-border bg-bg rounded-xl border border-dashed p-6 text-center">
                              <Typography className="text-muted! text-sm!">
                                 No messages yet. Add the first response below.
                              </Typography>
                           </Box>
                        ) : (
                           ticket.messages.map(messageItem => {
                              const isCurrentUser =
                                 messageItem.authorUserId === ticket.creatorUserId ||
                                 messageItem.authorCompanyId === ticket.creatorCompanyId

                              return (
                                 <Box
                                    key={messageItem.id}
                                    className={`rounded-2xl border p-4 ${
                                       isCurrentUser
                                          ? "border-border bg-blue-50/70"
                                          : "border-border bg-bg"
                                    }`}>
                                    <Box className="flex items-center justify-between gap-4">
                                       <Typography className="text-content! text-sm! font-semibold!">
                                          {messageItem.authorUser
                                             ? `${messageItem.authorUser.firstName ?? ""} ${messageItem.authorUser.lastName ?? ""}`.trim()
                                             : messageItem.authorCompany
                                               ? messageItem.authorCompany.companyName
                                               : "Support team"}
                                       </Typography>
                                       <Typography className="text-muted! text-[11px]!">
                                          {formatCreatedAt(messageItem.createdAt)}
                                       </Typography>
                                    </Box>

                                    <Typography className="text-muted! mt-3! text-sm! leading-6! whitespace-pre-line!">
                                       {messageItem.content}
                                    </Typography>
                                 </Box>
                              )
                           })
                        )}
                     </Box>
                  </Box>

                  <Box className="border-border bg-surface mt-6 rounded-xl border p-4">
                     <TextField
                        fullWidth
                        label="Write a message"
                        multiline
                        minRows={4}
                        value={message}
                        onChange={event => setMessage(event.target.value)}
                        placeholder="Add a reply to this support request..."
                     />

                     {(messagePresentation.category === "field_error" ||
                        messagePresentation.category === "form_error" ||
                        messagePresentation.category === "authentication_notice" ||
                        messagePresentation.category === "access_denied" ||
                        messagePresentation.category === "resource_not_found") && (
                        <Alert
                           severity="error"
                           className="mt-2!">
                           {messagePresentation.message}
                        </Alert>
                     )}

                     <Box className="mt-4 flex justify-end">
                        <Button
                           variant="contained"
                           disabled={
                              ticket.status === "CLOSED" || !message.trim() || isSending
                           }
                           onClick={handleSendMessage}
                           className="disabled:text-mui-blue-50! disabled:bg-mui-blue-600/80! bg-mui-blue-600! rounded-[10px]! px-6! py-[9.6px]! font-bold! normal-case! shadow-none! hover:bg-[#0879d8]! hover:shadow-none!">
                           {ticket.status === "CLOSED"
                              ? "Ticket Closed"
                              : isSending
                                ? "Sending..."
                                : "Send message"}
                        </Button>
                     </Box>
                  </Box>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}
