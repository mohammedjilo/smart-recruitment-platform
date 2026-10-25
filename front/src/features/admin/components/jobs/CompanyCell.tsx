import { Avatar, Box, Typography } from "@mui/material"

type CompanyCellProps = {
   companyName: string
   logoUrl: string | null
}

const CompanyCell = ({ companyName, logoUrl }: CompanyCellProps) => {
   return (
      <Box className="flex items-center gap-3 whitespace-nowrap">
         <Avatar
            className="text-primary h-9 w-9 rounded-lg bg-slate-100 text-sm font-bold"
            alt={companyName}
            src={logoUrl ?? undefined}>
            {companyName.charAt(0)}
         </Avatar>

         <Typography className="text-xs! font-semibold!">{companyName}</Typography>
      </Box>
   )
}

export default CompanyCell
