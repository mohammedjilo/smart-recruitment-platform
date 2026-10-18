import { Box, Typography } from "@mui/material"

import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined"
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined"

type RecommendationCardProps = {
   recommendation: string | null
   strengths: unknown
   missingSkills: unknown
}

const normalizeToStringArray = (value: unknown): string[] => {
   if (!Array.isArray(value)) {
      return []
   }

   return value.filter(item => typeof item === "string")
}

const RecommendationCard = ({
   recommendation,
   strengths,
   missingSkills
}: RecommendationCardProps) => {
   const strengthItems = normalizeToStringArray(strengths)

   const missingItems = normalizeToStringArray(missingSkills)

   return (
      <Box className="rounded-xl border bg-surface p-6">
         <Box className="flex flex-wrap items-center gap-3">
            <Typography className="text-sm! font-bold! text-content">
               Recommendation
            </Typography>

            <Box className="rounded-md bg-emerald-50 px-2 py-1">
               <Typography className="text-[10px]! font-bold! text-emerald-700">
                  RECOMMENDATION
               </Typography>
            </Box>
         </Box>

         <Typography
            className="mt-4! text-sm! leading-7!"
            color="textSecondary">
            {recommendation ?? "No recommendation is available for this application."}
         </Typography>

         <Box className="mt-7">
            <Typography className="text-xs font-bold text-content">
               Key Strengths
            </Typography>

            {strengthItems.length > 0 ? (
               <Box className="mt-4 space-y-3">
                  {strengthItems.map((item, index) => (
                     <ListItem
                        key={`${item}-${index}`}
                        icon={<CheckCircleOutlineOutlinedIcon />}
                        value={item}
                        iconClassName="text-emerald-600"
                     />
                  ))}
               </Box>
            ) : (
               <Typography className="mt-3! text-xs! text-muted">
                  No strengths available.
               </Typography>
            )}
         </Box>

         <Box className="mt-7">
            <Typography className="text-xs! font-bold! text-content">
               Missing / Improvement Areas
            </Typography>

            {missingItems.length > 0 ? (
               <Box className="mt-4 space-y-3">
                  {missingItems.map((item, index) => (
                     <ListItem
                        key={`${item}-${index}`}
                        icon={<ErrorOutlineOutlinedIcon />}
                        value={item}
                        iconClassName="text-orange-500"
                     />
                  ))}
               </Box>
            ) : (
               <Typography className="mt-3! text-xs! text-muted">
                  No improvement areas available.
               </Typography>
            )}
         </Box>
      </Box>
   )
}

type ListItemProps = {
   icon: React.ReactNode
   value: string
   iconClassName: string
}

const ListItem = ({ icon, value, iconClassName }: ListItemProps) => {
   return (
      <Box className="flex items-start gap-2">
         <Box
            className={`mt-[1px] flex h-4 w-4 shrink-0 items-center justify-center ${iconClassName} `}>
            {icon}
         </Box>

         <Typography
            className="text-xs! leading-5!"
            color="textSecondary">
            {value}
         </Typography>
      </Box>
   )
}

export default RecommendationCard
