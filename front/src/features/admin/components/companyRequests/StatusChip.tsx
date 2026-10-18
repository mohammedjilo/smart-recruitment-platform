import { Box, Typography } from "@mui/material"

type StatusChipProps = {
   value: string
}

const StatusChip = ({ value }: StatusChipProps) => {
   const styles: Record<
      string,
      {
         background: string
         color: string
      }
   > = {
      ACTIVE: {
         background: "#DCFCE7",
         color: "#15803D"
      },
      DEACTIVATED: {
         background: "#F1F5F9",
         color: "#64748B"
      },
      PENDING: {
         background: "#FEF3C7",
         color: "#D97706"
      },
      APPROVED: {
         background: "#DCFCE7",
         color: "#15803D"
      },
      REJECTED: {
         background: "#FEE2E2",
         color: "#DC2626"
      }
   }

   const currentStyle = styles[value] || {
      background: "#F1F5F9",
      color: "#64748B"
   }

   return (
      <Box
         sx={{
            width: "fit-content",
            borderRadius: "5px",
            padding: "4px 9px",
            backgroundColor: currentStyle.background
         }}>
         <Typography
            sx={{
               color: currentStyle.color,
               fontWeight: 700,
               fontSize: "10px"
            }}>
            {value}
         </Typography>
      </Box>
   )
}

export default StatusChip
