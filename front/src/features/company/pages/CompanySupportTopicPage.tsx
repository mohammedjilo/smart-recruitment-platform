import { useNavigate, useParams } from "react-router-dom"
import { Box, Button, Typography } from "@mui/material"

import SupportTopicDetails from "@/features/shared/support/components/SupportTopicDetails"
import { getCategoryNameForTopic } from "@/features/shared/support/supportCategoryMap"
import { companyTopicDetails } from "../config/support.config"

export default function CompanySupportTopicPage() {
   const navigate = useNavigate()
   const { topicId } = useParams()

   const topic = topicId ? companyTopicDetails[topicId] : undefined

   if (!topic) {
      return (
         <Box className="min-h-screen bg-[#f7fbff]">
            <Box className="border-border bg-surface mx-auto max-w-190 rounded-2xl border p-8 shadow-[0_8px_35px_rgba(30,64,175,0.05)]">
               <Typography className="text-content! text-2xl! font-bold!">
                  Topic not found
               </Typography>

               <Typography className="mt-3! text-sm!" color="textSecondary">
                  The requested support topic could not be found.
               </Typography>

               <Button
                  className="mt-6! rounded-lg! px-4! py-2! text-sm! font-medium! normal-case! transition-colors!"
                  variant="outlined"
                  onClick={() => navigate("/company/support")}>
                  Back to Support & Help
               </Button>
            </Box>
         </Box>
      )
   }

   return (
      <SupportTopicDetails
         data={topic}
         onArticleClick={(article: { id: string }) => {
            navigate(`/company/support/${topicId}/${article.id}`)
         }}
         onBack={() => navigate("/company/support")}
         onCreateRequest={() =>
            navigate("/company/support/requests/create", {
               state: {
                  categoryName: getCategoryNameForTopic("company", topicId) ?? topic.title
               }
            })
         }
      />
   )
}
