import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import { Box, Typography } from "@mui/material"

const ApplicationsEmptyState = () => {
   return (
      <Box className="flex min-h-87.5 flex-col items-center justify-center p-8 text-center">
         <Box className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#F3EFFF]">
            <DescriptionOutlinedIcon className="text-[#6741E8]!" />
         </Box>

         <Typography className="font-semibold! text-[#17213B]!">
            No applications found
         </Typography>

         <Typography className="mt-1! text-sm! text-[#64748B]!">
            Try changing your search or filter.
         </Typography>
      </Box>
   )
}

export default ApplicationsEmptyState
