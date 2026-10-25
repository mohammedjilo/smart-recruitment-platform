import { Button, Typography } from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

import type { DataTableColumn } from "@/components/common/DataTable"
import type { SupportTicketListItem } from "@/types/entities/support"
import { formatCreatedAt } from "@/utils/formatDate"
import SupportChip from "../components/SupportChip"
import PriorityChip from "../components/PriorityChip"

export type SupportTableTicket = SupportTicketListItem & Record<string, unknown>

export const getSupportRequestColumns = (
   onViewTicket: (ticketId: string) => void
): DataTableColumn<SupportTableTicket>[] => [
   {
      id: "id",
      header: "Ticket ID",
      render: ticket => (
         <Typography className="max-w-35! truncate! text-sm!" color="textSecondary">
            {ticket.id}
         </Typography>
      )
   },
   {
      id: "subject",
      header: "Subject",
      render: ticket => (
         <Typography className="min-w-40! text-sm! font-semibold! text-content!">
            {ticket.subject}
         </Typography>
      )
   },
   {
      id: "category",
      header: "Category",
      render: ticket => (
         <Typography className="text-sm!" color="textSecondary">
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
      id: "created-at",
      header: "Created",
      render: ticket => (
         <Typography className="text-sm! whitespace-nowrap!" color="textSecondary">
            {formatCreatedAt(ticket.createdAt)}
         </Typography>
      )
   },
   {
      id: "updated-at",
      header: "Last Updated",
      render: ticket => (
         <Typography className="text-sm! whitespace-nowrap!" color="textSecondary">
            {formatCreatedAt(ticket.updatedAt)}
         </Typography>
      )
   },
   {
      id: "view",
      header: "Action",
      align: "center",
      render: ticket => (
         <Button
            className="rounded-lg! px-3! py-1! text-xs! font-semibold! normal-case!"
            size="small"
            startIcon={<VisibilityOutlinedIcon className="text-[16px]!" />}
            variant="outlined"
            onClick={event => {
               event.stopPropagation()
               onViewTicket(ticket.id)
            }}>
            View
         </Button>
      )
   }
]
