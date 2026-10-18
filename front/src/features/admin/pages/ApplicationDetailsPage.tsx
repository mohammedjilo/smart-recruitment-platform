import { useParams } from "react-router-dom"
import ApplicationDetails from "./ApplicationDetails"

const ApplicationDetailsPage = () => {
   const { id } = useParams<{ id: string }>()

   if (!id) {
      return <div>Application ID not found</div>
   }

   return <ApplicationDetails applicationId={id} />
}

export default ApplicationDetailsPage
