import { Button, Typography } from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import type { DataTableColumn } from "@/components/common/DataTable"
import type { SupportAdminTicket } from "@/types/entities/support"
import { formatCreatedAt } from "@/utils/formatDate"
import SupportChip from "@/features/shared/support/components/SupportChip"
import PriorityChip from "@/features/shared/support/components/PriorityChip"

export type SupportTableTicket = SupportAdminTicket & Record<string, unknown>

export const getSupportColumns = (
   onViewTicket: (ticketId: string) => void
): DataTableColumn<SupportTableTicket>[] => [
   {
      id: "id",
      header: "Ticket ID",
      render: ticket => (
         <Typography className="max-w-22.5! truncate! text-sm!">{ticket.id}</Typography>
      )
   },
   {
      id: "subject",
      header: "Subject",
      render: ticket => (
         <Typography className="line-clamp-1! min-w-40! text-sm! font-semibold!">
            {ticket.subject}
         </Typography>
      )
   },
   {
      id: "requester",
      header: "Requester",
      render: ticket => (
         <Typography
            className="line-clamp-1! min-w-30! text-sm! font-medium!"
            color="textSecondary">
            {ticket.creatorUser
               ? `${ticket.creatorUser.firstName ?? ""} ${ticket.creatorUser.lastName ?? ""}`.trim()
               : ticket.creatorCompany
                 ? ticket.creatorCompany.companyName
                 : "Unknown"}
         </Typography>
      )
   },
   {
      id: "type",
      header: "Type",
      render: ticket =>
         ticket.creatorCompanyId || ticket.creatorCompany ? (
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
            <Typography
               className="text-sm! font-medium!"
               color="textSecondary">
               Unknown
            </Typography>
         )
   },
   {
      id: "category",
      header: "Category",
      render: ticket => (
         <Typography
            className="text-sm! font-medium!"
            color="textSecondary">
            {ticket.category?.name ?? "General"}
         </Typography>
      )
   },
   {
      id: "priority",
      header: "Priority",
      render: ticket => <PriorityChip priority={ticket.priority} />
   },
   {
      id: "status",
      header: "Status",
      render: ticket => (
         <SupportChip
            value={ticket.status}
            kind="status"
         />
      )
   },
   {
      id: "assigned",
      header: "Assigned To",
      render: ticket => (
         <Typography
            className="line-clamp-1! text-sm! font-medium!"
            color="textSecondary">
            {ticket.assignedAdmin
               ? `${ticket.assignedAdmin.firstName ?? ""} ${ticket.assignedAdmin.lastName ?? ""}`.trim()
               : "Unassigned"}
         </Typography>
      )
   },
   {
      id: "created",
      header: "Created",
      render: ticket => (
         <Typography
            className="text-sm! font-medium! whitespace-nowrap!"
            color="textSecondary">
            {formatCreatedAt(ticket.createdAt)}
         </Typography>
      )
   },
   {
      id: "updated",
      header: "Updated",
      render: ticket => (
         <Typography
            className="text-sm! font-medium! whitespace-nowrap!"
            color="textSecondary">
            {formatCreatedAt(ticket.updatedAt)}
         </Typography>
      )
   },
   {
      id: "action",
      header: "Action",
      align: "center",
      render: ticket => (
         <Button
            className="min-w-22! rounded-lg! text-xs! font-medium! normal-case!"
            color="primary"
            size="small"
            startIcon={<VisibilityOutlinedIcon />}
            variant="text"
            onClick={() => onViewTicket(ticket.id)}>
            View
         </Button>
      )
   }
]
