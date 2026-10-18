import { useNavigate } from "react-router-dom"
import { Button, Box } from "@mui/material"
import { WorkOutlined } from "@mui/icons-material"
import Swal from "sweetalert2"
import { showAlert } from "@/utils/swal"
import { useUpdateApplicationStatusMutation } from "@/services/shared/applicationApiCalls"
import type { CompanyApplication, UpdateApplicationStatus } from "@/types/application"
import { APPLICATION_STATUS_CONFIG } from "@/types/common/status"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

const statusOptions: UpdateApplicationStatus[] = [
   "PENDING",
   "REVIEWING",
   "SHORTLISTED",
   "INTERVIEW",
   "ACCEPTED",
   "REJECTED"
]

const ApplicationDetailsActions = ({
   application
}: {
   application: CompanyApplication
}) => {
   const navigate = useNavigate()
   const [updateApplicationStatus, mutationResult] = useUpdateApplicationStatusMutation()
   const mutationPresentation = getMutationPresentation(
      getMutationState(mutationResult),
      { surface: "action", importance: "important" }
   )
   const isWithdrawn = application.status === "WITHDRAWN"

   const handleChangeStatus = async () => {
      if (isWithdrawn) return

      const statusSelection = await Swal.fire({
         title: "Change application status",
         input: "select",
         inputOptions: Object.fromEntries(
            statusOptions.map(status => [status, APPLICATION_STATUS_CONFIG[status].label])
         ),
         inputValue: application.status,
         showCancelButton: true,
         confirmButtonText: "Continue",
         cancelButtonText: "Cancel",
         inputPlaceholder: "Select status",
         confirmButtonColor: "#7c3aed"
      })
      if (!statusSelection.isConfirmed || !statusSelection.value) return

      const nextStatus = statusSelection.value as UpdateApplicationStatus
      const nextConfig = APPLICATION_STATUS_CONFIG[nextStatus]
      const confirmResult = await Swal.fire({
         icon: "warning",
         title: "Change application status?",
         text: `Are you sure you want to change this application to ${nextConfig.label}?`,
         showCancelButton: true,
         confirmButtonText: "Yes, change",
         cancelButtonText: "Cancel",
         confirmButtonColor: "#d33"
      })
      if (!confirmResult.isConfirmed) return

      try {
         await updateApplicationStatus({
            applicationId: application.id,
            status: nextStatus
         }).unwrap()
         if (
            getMutationPresentation(
               { status: "success" },
               { surface: "action", importance: "important" }
            ).category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Status updated",
               text: `Application has been moved to ${nextConfig.label}.`
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "important"
         })
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Update failed",
            text: errorPresentation.message
         })
      }
   }

   return (
      <Box className="flex flex-col">
         <Button
            onClick={() =>
               navigate(`/company/jobs/${application.job.id}/${application.job.slug}`)
            }
            variant="outlined"
            color="primary"
            className="mx-5! flex! flex-1! items-center! justify-center! gap-2! rounded-md! px-3! py-2.5! text-[11px]! font-medium! capitalize! transition!">
            <WorkOutlined sx={{ fontSize: 16 }} />
            View Job
         </Button>
         <Box className="border-border mt-5 flex gap-2 border-t px-5 py-5">
            <Button
               onClick={() => navigate(`/company/users/${application.user.id}/profile`)}
               variant="outlined"
               color="primary"
               className="flex! flex-1! items-center! justify-center! gap-2! rounded-md! px-3! py-2.5! text-[11px]! font-medium! capitalize! transition!">
               <WorkOutlined sx={{ fontSize: 16 }} />
               View Profile
            </Button>
            <Button
               onClick={() => void handleChangeStatus()}
               disabled={isWithdrawn || mutationPresentation.category === "loading"}
               className={`flex! flex-1! items-center! justify-center! rounded-md! px-3! py-2.5! text-[11px]! font-medium capitalize! transition! ${
                  isWithdrawn
                     ? "text-muted! cursor-not-allowed! bg-slate-200!"
                     : "bg-primary! hover:bg-primary-dark! text-white!"
               }`}>
               {isWithdrawn ? "Withdrawn" : "Change Status"}
            </Button>
         </Box>
      </Box>
   )
}

export default ApplicationDetailsActions
