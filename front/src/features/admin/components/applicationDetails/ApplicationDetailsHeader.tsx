import { Box, Button, Typography } from "@mui/material"

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined"

import { useNavigate } from "react-router-dom"

const ApplicationDetailsHeader = () => {
   const navigate = useNavigate()

   return (
      <Box className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
         <Box>
            <Typography className="font-bold! text-content">
               Application Details
            </Typography>

            <Typography className="mt-1! text-xs! text-muted">
               View and manage the application information.
            </Typography>
         </Box>

         <Button
            className="min-w-42.5! normal-case!"
            startIcon={<ArrowBackOutlinedIcon />}
            variant="outlined"
            onClick={() => navigate(-1)}>
            Back to Applications
         </Button>
      </Box>
   )
}

export default ApplicationDetailsHeader
