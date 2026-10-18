import { Box, Typography } from "@mui/material"

type Props = {
   title: string
   description: string
   className: string
}

const EmploymentTypeCard = ({ title, description, className }: Props) => {
   return (
      <Box className="border-border bg-surface flex min-h-26 items-start rounded-lg border p-4 transition hover:border-violet-200 hover:shadow-sm">
         <Box className="min-w-0">
            <Typography
               component="span"
               className={`inline-flex rounded-md px-2.5 py-1 text-xs! font-bold! ${className}`}>
               {title}
            </Typography>
            <Typography
               className="mt-1! text-xs! leading-5!"
               color="textSecondary">
               {description}
            </Typography>
         </Box>
      </Box>
   )
}

export default EmploymentTypeCard
