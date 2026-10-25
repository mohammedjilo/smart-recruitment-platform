import { useNavigate, useParams } from "react-router-dom"
import { Box, Button, Typography } from "@mui/material"

import SupportArticleDetails from "@/features/shared/support/components/SupportArticleDetails"
import { getCategoryNameForTopic } from "@/features/shared/support/supportCategoryMap"
import { companyTopicDetails } from "../config/support.config"

export default function CompanySupportArticlePage() {
   const navigate = useNavigate()
   const { topicId, articleId } = useParams()

   const topic = topicId ? companyTopicDetails[topicId] : undefined
   const article = topic?.articles.find(item => item.id === articleId)

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

   if (!article) {
      return (
         <Box className="min-h-screen bg-[#f7fbff]">
            <Box className="border-border bg-surface mx-auto max-w-190 rounded-2xl border p-8 shadow-[0_8px_35px_rgba(30,64,175,0.05)]">
               <Typography className="text-content! text-2xl! font-bold!">
                  Article not found
               </Typography>

               <Typography className="mt-3! text-sm!" color="textSecondary">
                  The requested support article could not be found in this topic.
               </Typography>

               <Button
                  className="mt-6! rounded-lg! px-4! py-2! text-sm! font-medium! normal-case! transition-colors!"
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(`/company/support/${topicId}`)}>
                  Back to {topic.title}
               </Button>
            </Box>
         </Box>
      )
   }

   return (
      <SupportArticleDetails
         article={article}
         topicTitle={topic.title}
         onBack={() => navigate(`/company/support/${topicId}`)}
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
