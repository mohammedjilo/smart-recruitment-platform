import { useNavigate, useParams } from "react-router-dom"
import { Box, Typography } from "@mui/material"

import SupportTopicDetails from "@/features/support/components/SupportTopicDetails"
import { getCategoryNameForTopic } from "@/features/support/supportCategoryMap"
import { companyTopicDetails } from "../config/support.config"

export default function CompanySupportTopicPage() {
   const navigate = useNavigate()
   const { topicId } = useParams()

   const topic = topicId ? companyTopicDetails[topicId] : undefined

   if (!topic) {
      return (
         <Box className="min-h-screen bg-[#f7fbff]">
            <Box className="mx-auto max-w-190 rounded-2xl border border-border bg-surface p-8 shadow-[0_8px_35px_rgba(30,64,175,0.05)]">
               <Typography className="text-2xl! font-bold! text-content!">
                  Topic not found
               </Typography>

               <Typography className="mt-3! text-sm! text-muted!">
                  The requested support topic could not be found.
               </Typography>

               <button
                  type="button"
                  onClick={() => navigate("/company/support")}
                  className="app-button-secondary mt-6 rounded-lg px-4 py-2 text-sm font-medium transition-colors">
                  Back to Support & Help
               </button>
            </Box>
         </Box>
      )
   }

   return (
      <SupportTopicDetails
         data={topic}
         onBack={() => navigate("/company/support")}
         onCreateRequest={() =>
            navigate("/company/support/requests/create", {
               state: {
                  categoryName: getCategoryNameForTopic("company", topicId) ?? topic.title
               }
            })
         }
         onArticleClick={(article: { id: string }) => {
            navigate(`/company/support/${topicId}/${article.id}`)
         }}
      />
   )
}
