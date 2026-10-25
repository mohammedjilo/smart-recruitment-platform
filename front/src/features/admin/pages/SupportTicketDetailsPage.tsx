import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import { useNavigate, useParams } from "react-router-dom"
import {
   Alert,
   Box,
   Button,
   FormControl,
   InputLabel,
   MenuItem,
   Select,
   TextField,
   Typography
} from "@mui/material"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import { useGetAdminsQuery } from "@/features/admin/services/adminApiCalls"
import {
   useGetSupportTicketByIdQuery,
   useAddSupportMessageMutation,
   useAssignSupportTicketMutation,
   useUnassignSupportTicketMutation,
   useUpdateSupportTicketStatusMutation,
   useUpdateSupportTicketPriorityMutation
} from "@/services/shared/supportApiCalls"
import type { SupportPriority, SupportTicketStatus } from "@/types/entities/support"
import { formatCreatedAt } from "@/utils/formatDate"
import { usePermissions } from "@/features/admin/authorization/usePermissions"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import SupportChip from "@/features/shared/support/components/SupportChip"
import PriorityChip from "@/features/shared/support/components/PriorityChip"
import { AdminSupportTicketSkeleton } from "@/features/admin/components/AdminSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

const priorities: SupportPriority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"]

export default function SupportTicketDetailsPage() {
   const navigate = useNavigate()
   const { ticketId } = useParams()
   const actorAdminId = useSelector((state: RootState) => state.auth.user?.id)
   const [message, setMessage] = useState("")
   const [requiresUserResponse, setRequiresUserResponse] = useState(false)
   const ticketQuery = useGetSupportTicketByIdQuery(ticketId ?? "", {
      skip: !ticketId
   })
   const ticketState = getQueryState(ticketQuery)
   const ticketPresentation = getQueryPresentation(ticketState, "page")
   const ticketResponse = "data" in ticketState ? ticketState.data : undefined
   const isLoadingTicket = ticketPresentation.category === "loading"
   const adminsQuery = useGetAdminsQuery()
   const adminsState = getQueryState(adminsQuery, {
      isEmpty: response => response.data.length === 0
   })
   const adminsPresentation = getQueryPresentation(adminsState, "section")
   const adminsResponse = "data" in adminsState ? adminsState.data : undefined
   const isLoadingAdmins = adminsPresentation.category === "loading"
   const [addMessage, messageResult] = useAddSupportMessageMutation()
   const messageState = getMutationState(messageResult)
   const messagePresentation = getMutationPresentation(messageState, {
      surface: "action",
      importance: "routine"
   })
   const isSending = messagePresentation.category === "loading"
   const [assignTicket, assignResult] = useAssignSupportTicketMutation()
   const assignState = getMutationState(assignResult)
   const assignPresentation = getMutationPresentation(assignState, {
      surface: "action",
      importance: "routine"
   })
   const [unassignTicket, unassignResult] = useUnassignSupportTicketMutation()
   const unassignState = getMutationState(unassignResult)
   const unassignPresentation = getMutationPresentation(unassignState, {
      surface: "action",
      importance: "routine"
   })
   const [updateStatus, statusResult] = useUpdateSupportTicketStatusMutation()
   const statusState = getMutationState(statusResult)
   const statusPresentation = getMutationPresentation(statusState, {
      surface: "action",
      importance: "important"
   })
   const [updatePriority, priorityResult] = useUpdateSupportTicketPriorityMutation()
   const priorityState = getMutationState(priorityResult)
   const priorityPresentation = getMutationPresentation(priorityState, {
      surface: "action",
      importance: "routine"
   })
   const isAssigning = assignPresentation.category === "loading"
   const isUnassigning = unassignPresentation.category === "loading"
   const isUpdatingStatus = statusPresentation.category === "loading"
   const isUpdatingPriority = priorityPresentation.category === "loading"
   const [mutationError, setMutationError] = useState<string | null>(null)
   const ticket = ticketResponse?.data
   const admins = adminsResponse?.data ?? []
   const { hasAnyPermission } = usePermissions()

   const canReplyToTicket = hasAnyPermission([
      ADMIN_PERMISSIONS.REPLY_SUPPORT_TICKETS,
      ADMIN_PERMISSIONS.REPLY_SUPPORT
   ])
   const canManageTicketStatus = hasAnyPermission([
      ADMIN_PERMISSIONS.CHANGE_SUPPORT_STATUS
   ])
   const canManageTicketAssignment = hasAnyPermission([
      ADMIN_PERMISSIONS.ASSIGN_SUPPORT_TICKET,
      ADMIN_PERMISSIONS.ASSIGN_SUPPORT,
      ADMIN_PERMISSIONS.REASSIGN_SUPPORT_TICKET,
      ADMIN_PERMISSIONS.REASSIGN_SUPPORT
   ])
   const canCloseTicket = hasAnyPermission([
      ADMIN_PERMISSIONS.CLOSE_SUPPORT_TICKET,
      ADMIN_PERMISSIONS.CLOSE_SUPPORT
   ])
   const canChangePriority = hasAnyPermission([ADMIN_PERMISSIONS.CHANGE_SUPPORT_PRIORITY])
   if (isLoadingTicket) return <AdminSupportTicketSkeleton />
   if (
      ticketPresentation.category === "page_error" ||
      ticketPresentation.category === "authentication_notice" ||
      ticketPresentation.category === "access_denied" ||
      ticketPresentation.category === "resource_not_found"
   )
      return (
         <Box className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
            <Typography
               className="text-sm! text-red-700!"
               aria-live="assertive"
               role="alert">
               {ticketPresentation.message}
            </Typography>
            <Button
               className="mt-3! normal-case!"
               onClick={ticketQuery.refetch}>
               Retry
            </Button>
            <Button
               className="mt-3! ml-2! normal-case!"
               onClick={() => navigate("/admin/support")}>
               Back to Support
            </Button>
         </Box>
      )
   if (
      ticketPresentation.category === "silent" &&
      (ticketState.status !== "aborted" || ticketState.data === undefined)
   )
      return null
   if (ticketState.status === "idle" || ticketPresentation.category === "none") {
      return null
   }
   if (!ticket || !ticketId) {
      return (
         <Box className="border-border bg-surface rounded-xl border p-8 text-center">
            <Typography className="text-sm!" color="textSecondary">
               Support ticket could not be determined.
            </Typography>
         </Box>
      )
   }

   const requester = ticket.creatorUser
      ? `${ticket.creatorUser.firstName ?? ""} ${ticket.creatorUser.lastName ?? ""}`.trim()
      : (ticket.creatorCompany?.companyName ?? "Unknown")
   const sendReply = async () => {
      if (!message.trim()) return
      try {
         await addMessage({
            ticketId,
            content: message.trim(),
            requiresUserResponse,
            recipientUserId: ticket.creatorUserId,
            actorAdminId
         }).unwrap()
         setMessage("")
         setRequiresUserResponse(false)
         setMutationError(null)
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "routine"
         })
         if (errorPresentation.category !== "silent") {
            setMutationError(errorPresentation.message ?? null)
         }
      }
   }
   const canTransitionStatus = (nextStatus: SupportTicketStatus) => {
      if (!canManageTicketStatus) return false

      return (
         (ticket.status === "OPEN" && nextStatus === "IN_PROGRESS") ||
         (ticket.status === "IN_PROGRESS" &&
            (nextStatus === "WAITING_FOR_USER" || nextStatus === "RESOLVED")) ||
         (ticket.status === "WAITING_FOR_USER" && nextStatus === "IN_PROGRESS") ||
         (ticket.status === "RESOLVED" && nextStatus === "CLOSED" && canCloseTicket)
      )
   }

   const handleStatusAction = async (nextStatus: SupportTicketStatus) => {
      if (!canTransitionStatus(nextStatus)) return
      try {
         await updateStatus({ ticketId, status: nextStatus, actorAdminId }).unwrap()
         setMutationError(null)
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "important"
         })
         setMutationError(
            errorPresentation.category === "silent"
               ? null
               : (errorPresentation.message ?? null)
         )
      }
   }
   const handlePriorityChange = async (priority: SupportPriority) => {
      try {
         await updatePriority({ ticketId, priority }).unwrap()
         setMutationError(null)
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "routine"
         })
         setMutationError(
            errorPresentation.category === "silent"
               ? null
               : (errorPresentation.message ?? null)
         )
      }
   }
   const handleAssignmentChange = async (assignedAdminId: string) => {
      try {
         if (assignedAdminId === "UNASSIGNED") {
            await unassignTicket(ticketId).unwrap()
         } else {
            await assignTicket({ ticketId, assignedAdminId, actorAdminId }).unwrap()
         }
         setMutationError(null)
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "routine"
         })
         setMutationError(
            errorPresentation.category === "silent"
               ? null
               : (errorPresentation.message ?? null)
         )
      }
   }

   return (
      <Box className="space-y-5">
         {mutationError && <Alert severity="error">{mutationError}</Alert>}
         {ticketPresentation.category === "stale_error" && (
            <Alert
               aria-live="polite"
               action={
                  <Button
                     color="inherit"
                     size="small"
                     onClick={ticketQuery.refetch}>
                     Retry
                  </Button>
               }
               role="status"
               severity="warning">
               {ticketPresentation.message}
            </Alert>
         )}
         <Button
            className="mb-2! normal-case!"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/admin/support")}>
            Back to Support
         </Button>
         <Box className="border-border bg-surface rounded-2xl border p-6 shadow-sm">
            <Box className="border-border flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-start lg:justify-between">
               <Box>
                  <Typography className="text-xs! font-semibold! tracking-widest! text-blue-600! uppercase!">
                     Support Ticket
                  </Typography>
                  <Typography className="text-content! mt-2! text-2xl! font-bold!">
                     {ticket.subject}
                  </Typography>
                  <Typography className="mt-1! text-xs!" color="textSecondary">
                     ID: {ticket.id}
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

            <Box className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
               <Box>
                  <Typography className="text-xs!" color="textSecondary">Created By</Typography>
                  <Typography className="text-content! mt-1! text-sm! font-semibold!">
                     {requester}
                  </Typography>
                  {ticket.creatorCompanyId || ticket.creatorCompany ? (
                     <SupportChip
                        value="COMPANY"
                        kind="audience"
                     />
                  ) : ticket.creatorUserId || ticket.creatorUser ? (
                     <SupportChip
                        value="USER"
                        kind="audience"
                     />
                  ) : (
                     <Typography className="mt-1! text-xs!" color="textSecondary">
                        Requester type unknown
                     </Typography>
                  )}
               </Box>
               <Box>
                  <Typography className="text-xs!" color="textSecondary">Category</Typography>
                  <Typography className="text-content! mt-1! text-sm!">
                     {ticket.category?.name ?? "General"}
                  </Typography>
               </Box>
               <Box>
                  <Typography className="text-xs!" color="textSecondary">Assigned To</Typography>
                  <Typography className="text-content! mt-1! text-sm!">
                     {ticket.assignedAdmin
                        ? `${ticket.assignedAdmin.firstName ?? ""} ${ticket.assignedAdmin.lastName ?? ""}`.trim()
                        : "Unassigned"}
                  </Typography>
               </Box>
               <Box>
                  <Typography className="text-xs!" color="textSecondary">
                     Created / Updated
                  </Typography>
                  <Typography className="text-content! mt-1! text-sm!">
                     {formatCreatedAt(ticket.createdAt)}
                  </Typography>
                  <Typography className="text-xs!" color="textSecondary">
                     {formatCreatedAt(ticket.updatedAt)}
                  </Typography>
               </Box>
            </Box>

            <Box className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
               <Box className="border-border bg-bg rounded-xl border p-3">
                  <Typography className="text-xs! font-semibold! tracking-wide! uppercase!" color="textSecondary">
                     Ticket Actions
                  </Typography>
                  <Box className="mt-3 flex flex-wrap gap-2">
                     {ticket.status === "OPEN" && canManageTicketStatus && (
                        <Button
                           className="normal-case!"
                           disabled={isUpdatingStatus}
                           size="small"
                           variant="contained"
                           onClick={() => void handleStatusAction("IN_PROGRESS")}>
                           Start Working
                        </Button>
                     )}
                     {ticket.status === "IN_PROGRESS" && canManageTicketStatus && (
                        <Box className="contents">
                           <Button
                              className="normal-case!"
                              disabled={isUpdatingStatus}
                              size="small"
                              variant="outlined"
                              onClick={() => void handleStatusAction("WAITING_FOR_USER")}>
                              Waiting for User
                           </Button>
                           <Button
                              className="normal-case!"
                              disabled={isUpdatingStatus}
                              size="small"
                              variant="contained"
                              onClick={() => void handleStatusAction("RESOLVED")}>
                              Resolve
                           </Button>
                        </Box>
                     )}
                     {ticket.status === "WAITING_FOR_USER" && canManageTicketStatus && (
                        <Button
                           className="normal-case!"
                           disabled={isUpdatingStatus}
                           size="small"
                           variant="contained"
                           onClick={() => void handleStatusAction("IN_PROGRESS")}>
                           Resume Work
                        </Button>
                     )}
                     {ticket.status === "RESOLVED" && canCloseTicket && (
                        <Button
                           className="normal-case!"
                           disabled={isUpdatingStatus}
                           color="secondary"
                           size="small"
                           variant="contained"
                           onClick={() => void handleStatusAction("CLOSED")}>
                           Close Ticket
                        </Button>
                     )}
                     {ticket.status === "WAITING_FOR_USER" && (
                        <Typography className="text-sm!" color="textSecondary">
                           Waiting for customer response
                        </Typography>
                     )}
                  </Box>
               </Box>
               {canChangePriority ? (
                  <FormControl size="small">
                     <InputLabel>Priority</InputLabel>
                     <Select
                        disabled={isUpdatingPriority}
                        value={ticket.priority}
                        label="Priority"
                        onChange={event =>
                           void handlePriorityChange(
                              event.target.value as SupportPriority
                           )
                        }>
                        {priorities.map(priority => (
                           <MenuItem
                              key={priority}
                              value={priority}>
                              {priority}
                           </MenuItem>
                        ))}
                     </Select>
                  </FormControl>
               ) : null}
               {canManageTicketAssignment ? (
                  <Box className="space-y-2">
                     <FormControl size="small">
                        <InputLabel>Assigned Admin</InputLabel>
                        <Select
                           disabled={
                              isAssigning ||
                              isUnassigning ||
                              isLoadingAdmins ||
                              adminsPresentation.category === "section_error"
                           }
                           value={ticket.assignedAdminId ?? "UNASSIGNED"}
                           label="Assigned Admin"
                           onChange={event =>
                              void handleAssignmentChange(event.target.value)
                           }>
                           {<MenuItem value="UNASSIGNED">Unassigned</MenuItem>}
                           {isLoadingAdmins && (
                              <MenuItem
                                 disabled
                                 value="LOADING">
                                 Loading admins...
                              </MenuItem>
                           )}
                           {admins.map(admin => (
                              <MenuItem
                                 key={admin.id}
                                 value={admin.id}>
                                 {admin.firstName} {admin.lastName}
                              </MenuItem>
                           ))}
                        </Select>
                     </FormControl>
                     {(adminsPresentation.category === "section_error" ||
                        adminsPresentation.category === "access_denied" ||
                        adminsPresentation.category === "authentication_notice" ||
                        adminsPresentation.category === "resource_not_found" ||
                        adminsPresentation.category === "stale_error") && (
                        <Alert
                           aria-live={
                              adminsPresentation.category === "stale_error"
                                 ? "polite"
                                 : "assertive"
                           }
                           action={
                              <Button
                                 color="inherit"
                                 size="small"
                                 onClick={adminsQuery.refetch}>
                                 Retry
                              </Button>
                           }
                           role={
                              adminsPresentation.category === "stale_error"
                                 ? "status"
                                 : "alert"
                           }
                           severity={
                              adminsPresentation.category === "stale_error"
                                 ? "warning"
                                 : "error"
                           }>
                           {adminsPresentation.message}
                        </Alert>
                     )}
                  </Box>
               ) : null}
            </Box>

            <Box className="bg-bg mt-5 rounded-xl p-5">
               <Typography className="text-xs! font-semibold! uppercase!" color="textSecondary">
                  Description
               </Typography>
               <Typography className="mt-3! text-sm! leading-6! whitespace-pre-line!" color="textSecondary">
                  {ticket.description}
               </Typography>
            </Box>

            <Box className="mt-6">
               <Typography className="text-content! text-lg! font-bold!">
                  Conversation
               </Typography>
               <Box className="mt-4 space-y-3">
                  {ticket.messages.length === 0 ? (
                     <Typography className="border-border! rounded-xl! border! border-dashed! p-6! text-center! text-sm!" color="textSecondary">
                        No messages yet.
                     </Typography>
                  ) : (
                     ticket.messages.map(item => {
                        const isAdmin = item.authorUser?.role === "ADMIN"
                        return (
                           <Box
                              className={`rounded-xl border p-4 ${isAdmin ? "border-blue-200 bg-blue-50" : "border-border bg-bg"}`}
                              key={item.id}>
                              <Box className="flex items-center justify-between gap-3">
                                 <Typography className="text-content! text-sm! font-semibold!">
                                    {isAdmin
                                       ? `${item.authorUser?.firstName ?? ""} ${item.authorUser?.lastName ?? ""}`.trim() ||
                                         "Support Administrator"
                                       : item.authorUser
                                         ? `${item.authorUser.firstName ?? ""} ${item.authorUser.lastName ?? ""}`.trim()
                                         : (item.authorCompany?.companyName ??
                                           "Requester")}
                                 </Typography>
                                 <Typography className="text-xs!" color="textSecondary">
                                    {formatCreatedAt(item.createdAt)}
                                 </Typography>
                              </Box>
                              <Typography className="mt-2! text-sm! leading-6! whitespace-pre-line!" color="textSecondary">
                                 {item.content}
                              </Typography>
                           </Box>
                        )
                     })
                  )}
               </Box>
            </Box>

            {canReplyToTicket && (
               <Box className="border-border mt-6 border-t pt-5">
                  <TextField
                     value={message}
                     fullWidth
                     label="Reply"
                     minRows={4}
                     multiline
                     onChange={event => setMessage(event.target.value)}
                  />
                  {ticket.status !== "CLOSED" && (
                     <label className="text-muted mt-3 flex items-center gap-2 text-sm">
                        <input
                           type="checkbox"
                           checked={requiresUserResponse}
                           onChange={event =>
                              setRequiresUserResponse(event.target.checked)
                           }
                        />
                        Requires user response
                     </label>
                  )}
                  <Button
                     className="disabled:text-mui-blue-50! disabled:bg-mui-blue-600/80! mt-3! rounded-lg! bg-blue-600! font-semibold! normal-case!"
                     disabled={ticket.status === "CLOSED" || !message.trim() || isSending}
                     variant="contained"
                     onClick={() => void sendReply()}>
                     {ticket.status === "CLOSED"
                        ? "Ticket Closed"
                        : isSending
                          ? "Sending..."
                          : "Send Reply"}
                  </Button>
               </Box>
            )}
         </Box>
      </Box>
   )
}
