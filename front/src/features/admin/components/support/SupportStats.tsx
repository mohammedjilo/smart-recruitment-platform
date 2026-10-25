import { Box } from "@mui/material"
import StatCard from "@/components/common/StatCard"

export type SupportStatsValues = {
   open: number
   inProgress: number
   waitingForUser: number
   resolved: number
   closed: number
}

type SupportStatsProps = {
   stats: SupportStatsValues
}

const SupportStats = ({ stats }: SupportStatsProps) => {
   const cards = [
      ["Open", stats.open],
      ["In Progress", stats.inProgress],
      ["Waiting", stats.waitingForUser],
      ["Resolved", stats.resolved],
      ["Closed", stats.closed]
   ] as const

   return (
      <Box className="grid grid-cols-2 gap-3 md:grid-cols-5">
         {cards.map(([label, value]) => (
            <StatCard
               key={label}
               value={value}
               label={label}
               layout="stacked"
            />
         ))}
      </Box>
   )
}

export default SupportStats
