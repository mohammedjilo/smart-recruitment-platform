import { Box, Typography } from "@mui/material"

import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined"

const SnapshotEmptyState = () => {
   return (
      <Box className="flex min-h-87.5 flex-col items-center justify-center rounded-xl border bg-surface px-6 text-center">
         <Box className="flex h-14 w-14 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
            <PersonSearchOutlinedIcon fontSize="large" />
         </Box>

         <Typography className="mt-4! text-base! font-semibold! text-content">
            No Profile Snapshot Available
         </Typography>

         <Typography className="mt-2! max-w-md! text-sm! text-muted">
            There is no profile snapshot available for this application.
         </Typography>
      </Box>
   )
}

export default SnapshotEmptyState
