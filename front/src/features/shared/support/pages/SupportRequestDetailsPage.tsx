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
import SupportChip from "../components/SupportChip"
import PriorityChip from "../components/PriorityChip"
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
                  height={34}
                  variant="rounded"
                  width={150}
               />
               <Box className="border-border bg-surface overflow-hidden rounded-2xl border">
                  <Skeleton
                     height={130}
                     variant="rounded"
                  />
                  <Box className="space-y-5 p-6">
                     <Box className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {[0, 1, 2].map(item => (
                           <Skeleton
                              key={item}
                              height={76}
                              variant="rounded"
                           />
                        ))}
                     </Box>
                     <Skeleton
                        height={150}
                        variant="rounded"
                     />
                     <Skeleton
                        height={280}
                        variant="rounded"
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
                  className="text-content font-bold!"
                  variant="h5">
                  Ticket not found
               </Typography>
               <Typography
                  className="text-muted mt-2!"
                  variant="body2">
                  We could not find this support request.
               </Typography>
               <Button
                  className="mt-3! rounded-[10px]! normal-case!"
                  variant="contained"
                  onClick={() =>
                     navigate(
                        portalType === "company" ? "/company/support" : "/user/support"
                     )
                  }>
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
                  className="text-muted text-sm font-medium transition-colors hover:text-blue-600"
                  type="button"
                  onClick={() =>
                     navigate(
                        portalType === "company" ? "/company/support" : "/user/support"
                     )
                  }>
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
                           value={ticket.status}
                           kind="status"
                        />
                        <PriorityChip priority={ticket.priority} />
                     </Box>
                  </Box>
               </Box>

               <Box className="p-6 sm:p-8">
                  <Box className="grid gap-5 md:grid-cols-3">
                     <Box className="bg-bg rounded-xl p-4">
                        <Typography className="text-[11px]! font-semibold! uppercase!" color="textSecondary">
                           Created
                        </Typography>
                        <Typography className="text-content! mt-2! text-sm! font-medium!">
                           {formatCreatedAt(ticket.createdAt)}
                        </Typography>
                     </Box>

                     <Box className="bg-bg rounded-xl p-4">
                        <Typography className="text-[11px]! font-semibold! uppercase!" color="textSecondary">
                           Category
                        </Typography>
                        <Typography className="text-content! mt-2! text-sm! font-medium!">
                           {ticket.category?.name ?? "General"}
                        </Typography>
                     </Box>

                     <Box className="bg-bg rounded-xl p-4">
                        <Typography className="text-[11px]! font-semibold! uppercase!" color="textSecondary">
                           Requested by
                        </Typography>
                        <Typography className="text-content! mt-2! text-sm! font-medium!">
                           {getAuthorName(ticket)}
                        </Typography>
                     </Box>
                  </Box>

                  <Box className="border-border bg-bg mt-6 rounded-xl border p-5">
                     <Typography className="text-[11px]! font-semibold! uppercase!" color="textSecondary">
                        Description
                     </Typography>
                     <Typography className="mt-3! text-sm! leading-6! whitespace-pre-line!" color="textSecondary">
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
                              <Typography className="text-sm!" color="textSecondary">
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
                                    className={`rounded-2xl border p-4 ${
                                       isCurrentUser
                                          ? "border-border bg-blue-50/70"
                                          : "border-border bg-bg"
                                    }`}
                                    key={messageItem.id}>
                                    <Box className="flex items-center justify-between gap-4">
                                       <Typography className="text-content! text-sm! font-semibold!">
                                          {messageItem.authorUser
                                             ? `${messageItem.authorUser.firstName ?? ""} ${messageItem.authorUser.lastName ?? ""}`.trim()
                                             : messageItem.authorCompany
                                               ? messageItem.authorCompany.companyName
                                               : "Support team"}
                                       </Typography>
                                       <Typography className="text-[11px]!" color="textSecondary">
                                          {formatCreatedAt(messageItem.createdAt)}
                                       </Typography>
                                    </Box>

                                    <Typography className="mt-3! text-sm! leading-6! whitespace-pre-line!" color="textSecondary">
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
                        placeholder="Add a reply to this support request..."
                        value={message}
                        fullWidth
                        label="Write a message"
                        minRows={4}
                        multiline
                        onChange={event => setMessage(event.target.value)}
                     />

                     {(messagePresentation.category === "field_error" ||
                        messagePresentation.category === "form_error" ||
                        messagePresentation.category === "authentication_notice" ||
                        messagePresentation.category === "access_denied" ||
                        messagePresentation.category === "resource_not_found") && (
                        <Alert
                           className="mt-2!"
                           severity="error">
                           {messagePresentation.message}
                        </Alert>
                     )}

                     <Box className="mt-4 flex justify-end">
                        <Button
                           className="disabled:text-mui-blue-50! disabled:bg-mui-blue-600/80! bg-mui-blue-600! rounded-[10px]! px-6! py-2.4! font-bold! normal-case! shadow-none! hover:bg-[#0879d8]! hover:shadow-none!"
                           disabled={
                              ticket.status === "CLOSED" || !message.trim() || isSending
                           }
                           variant="contained"
                           onClick={handleSendMessage}>
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
