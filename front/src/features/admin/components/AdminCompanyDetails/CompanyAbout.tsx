import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"

import { Box, Typography } from "@mui/material"

type Props = {
   description: string | null
}

const CompanyAbout = ({ description }: Props) => {
   return (
      <Box className="rounded-xl border bg-surface p-5 shadow-sm">
         <Box className="flex items-center gap-3">
            <DescriptionOutlinedIcon
               className="text-muted"
               fontSize="small"
            />

            <Typography className="text-[16px]! font-semibold! text-content">
               About Company
            </Typography>
         </Box>

         <Typography
            className="mt-4! text-sm! leading-6!"
            color="textSecondary">
            {description || "No company description provided."}
         </Typography>
      </Box>
   )
}

export default CompanyAbout
