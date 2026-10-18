import { useLocation, useNavigate } from "react-router-dom"
import { Box } from "@mui/material"
import SupportRequestForm from "@/features/support/components/SupportRequestForm"

type Props = {
   portalType: "user" | "company"
}

type SupportRequestNavigationState = {
   categoryName?: string
}

export default function SupportRequestCreatePage({ portalType }: Props) {
   const location = useLocation()
   const navigate = useNavigate()
   const categoryName = (location.state as SupportRequestNavigationState | null)
      ?.categoryName

   const handleSuccess = (ticketId: string) => {
      if (portalType === "company") {
         navigate(`/company/support/requests/${ticketId}`)
         return
      }

      navigate(`/user/support/requests/${ticketId}`)
   }

   return (
      <Box className="min-h-screen bg-[#f7fbff] px-4 py-8 sm:px-6 lg:px-8">
         <Box className="mx-auto max-w-3xl">
            <Box className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_35px_rgba(30,64,175,0.05)]">
               <Box className="border-b border-border bg-[#f8fbff] p-6 sm:p-8">
                  <button
                     type="button"
                     onClick={() =>
                        navigate(
                           portalType === "company" ? "/company/support" : "/user/support"
                        )
                     }
                     className="mb-4 text-sm font-medium text-muted transition-colors hover:text-blue-600">
                     ← Back to Support & Help
                  </button>
               </Box>

               <Box className="p-6 sm:p-8">
                  <SupportRequestForm
                     portalType={portalType}
                     initialCategoryName={categoryName}
                     onSuccess={handleSuccess}
                  />
               </Box>
            </Box>
         </Box>
      </Box>
   )
}
