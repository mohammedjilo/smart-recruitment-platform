import { Box, Typography } from "@mui/material"

import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"

type JobDescriptionProps = {
   description: string
}

const JobDescription = ({ description }: JobDescriptionProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-6">
         <Box className="flex items-center gap-3">
            <DescriptionOutlinedIcon
               className="text-primary"
               fontSize="small"
            />

            <Typography className="text-sm! font-bold! text-content">
               Job Description
            </Typography>
         </Box>

         <Typography
            className="mt-5! text-sm! leading-7! whitespace-pre-line!"
            color="textSecondary">
            {description}
         </Typography>
      </Box>
   )
}

export default JobDescription
