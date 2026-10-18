import { Box, Typography } from "@mui/material"

type Props = {
   value: string
}

const StatusChip = ({ value }: Props) => {
   const config: Record<
      string,
      {
         backgroundColor: string
         color: string
      }
   > = {
      ACTIVE: {
         backgroundColor: "#DCFCE7",
         color: "#15803D"
      },

      DEACTIVATED: {
         backgroundColor: "#F1F5F9",
         color: "#64748B"
      },

      PENDING: {
         backgroundColor: "#FEF3C7",
         color: "#D97706"
      },

      APPROVED: {
         backgroundColor: "#DCFCE7",
         color: "#15803D"
      },

      REJECTED: {
         backgroundColor: "#FEE2E2",
         color: "#DC2626"
      }
   }

   const style = config[value] ?? {
      backgroundColor: "#F1F5F9",
      color: "#64748B"
   }

   return (
      <Box
         sx={{
            width: "fit-content",
            borderRadius: "5px",
            padding: "4px 9px",
            backgroundColor: style.backgroundColor
         }}>
         <Typography
            variant="caption"
            sx={{
               color: style.color,
               fontWeight: 700,
               fontSize: "10px"
            }}>
            {value}
         </Typography>
      </Box>
   )
}

export default StatusChip
