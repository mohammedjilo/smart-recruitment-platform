import type { SupportTopic } from "../types"
import { Box, Typography } from "@mui/material"

type Props = {
   topic: SupportTopic
   onClick?: (topic: SupportTopic) => void
}

export default function TopicCard({ topic, onClick }: Props) {
   const Icon = topic.icon

   return (
      <button
         className="group w-full rounded-xl border border-border bg-surface p-4 text-left transition-all duration-200 hover:-translate-y-px hover:border-blue-200 hover:shadow-[0_8px_25px_rgba(37,99,235,0.08)]"
         onClick={() => onClick?.(topic)}>
         <Box className="flex items-start gap-4">
            <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-100">
               <Icon className="text-[21px]" />
            </Box>

            <Box className="min-w-0">
               <Typography className="text-[13px]! font-semibold! text-content!">
                  {topic.title}
               </Typography>

               <Typography className="mt-1! text-[11px]! leading-5!" color="textSecondary">
                  {topic.description}
               </Typography>
            </Box>
         </Box>
      </button>
   )
}
