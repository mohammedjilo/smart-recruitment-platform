import { Box, Typography } from "@mui/material"

type Props = {
   value: string
}

const StatusChip = ({ value }: Props) => {
   const styles: Record<string, string> = {
      ACTIVE: "bg-emerald-100 text-emerald-700",

      DEACTIVATED: "bg-slate-100 text-muted",

      PENDING: "bg-amber-100 text-amber-700",

      APPROVED: "bg-emerald-100 text-emerald-700",

      REJECTED: "bg-red-100 text-red-700",

      OPEN: "bg-emerald-100 text-emerald-700",

      CLOSED: "bg-slate-100 text-muted",

      DRAFT: "bg-amber-100 text-amber-700",

      EXPIRED: "bg-red-100 text-red-700"
   }

   return (
      <Box
         className={`w-fit rounded-md px-2 py-1 ${
            styles[value] || "bg-slate-100 text-muted"
         } `}>
         <Typography className="text-[10px]! leading-none! font-bold!">
            {value}
         </Typography>
      </Box>
   )
}

export default StatusChip
