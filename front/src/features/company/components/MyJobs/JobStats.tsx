import WorkOutlinedIcon from "@mui/icons-material/WorkOutlined"
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"
import EditNoteIcon from "@mui/icons-material/EditNote"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import { Box } from "@mui/material"
import StatCard from "@/components/common/StatCard"

type JobStatsProps = {
   stats: {
      all: number
      open: number
      draft: number
      closed: number
      expired: number
   }
}

const JobStats = ({ stats }: JobStatsProps) => {
   const cards = [
      {
         title: "All Jobs",
         value: stats.all,
         description: "Total jobs",
         icon: WorkOutlinedIcon,
         iconBg: "bg-violet-50",
         iconColor: "text-violet-600",
         dot: "bg-violet-500"
      },
      {
         title: "Open",
         value: stats.open,
         description: "Active openings",
         icon: CheckCircleOutlinedIcon,
         iconBg: "bg-green-50",
         iconColor: "text-green-600",
         dot: "bg-green-500"
      },
      {
         title: "Draft",
         value: stats.draft,
         description: "Saved as draft",
         icon: EditNoteIcon,
         iconBg: "bg-orange-50",
         iconColor: "text-orange-600",
         dot: "bg-orange-500"
      },
      {
         title: "Closed",
         value: stats.closed,
         description: "Not accepting",
         icon: LockOutlinedIcon,
         iconBg: "bg-slate-100",
         iconColor: "text-muted",
         dot: "bg-slate-500"
      },
      {
         title: "Expired",
         value: stats.expired,
         description: "Past deadline",
         icon: AccessTimeIcon,
         iconBg: "bg-red-50",
         iconColor: "text-red-500",
         dot: "bg-red-500"
      }
   ]

   return (
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
         {cards.map(card => {
            const Icon = card.icon

            return (
               <StatCard
                  key={card.title}
                  label={
                     <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${card.dot} `} />
                        {card.title}
                     </span>
                  }
                  value={card.value}
                  description={card.description}
                  icon={
                     <Icon
                        className={card.iconColor}
                        sx={{ fontSize: 20 }}
                     />
                  }
                  iconClassName={card.iconBg}
                  className="transition hover:-translate-y-[1px] hover:shadow-sm"
               />
            )
         })}
      </Box>
   )
}

export default JobStats
