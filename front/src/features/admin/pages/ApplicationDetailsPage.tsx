import { Box } from "@mui/material"
import { useParams } from "react-router-dom"
import ApplicationDetails from "./ApplicationDetails"

const ApplicationDetailsPage = () => {
   const { id } = useParams<{ id: string }>()

   if (!id) {
      return <Box>Application ID not found</Box>
   }

   return <ApplicationDetails applicationId={id} />
}

export default ApplicationDetailsPage
