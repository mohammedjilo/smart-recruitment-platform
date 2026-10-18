import { Box } from "@mui/material"
import { useGetJobQuestionsByAdminQuery } from "@/features/admin/services/adminApiCalls"
import QuestionsHeader from "./QuestionsHeader"
import QuestionsList from "./QuestionsList"
import { getQueryState } from "@/utils/queryState"

type ApplicationQuestionsStepProps = {
   jobId: string
}

const ApplicationQuestionsStep = ({ jobId }: ApplicationQuestionsStepProps) => {
   const query = useGetJobQuestionsByAdminQuery(jobId)
   const queryState = getQueryState(query, {
      isEmpty: response => response.data.length === 0
   })

   const response = "data" in queryState ? queryState.data : undefined
   const questions = [...(response?.data ?? [])].sort((a, b) => a.order - b.order)

   return (
      <Box className="w-full">
         <QuestionsHeader />

         <Box className="mt-5">
            <QuestionsList
               questions={questions}
               queryState={queryState}
               onRetry={query.refetch}
            />
         </Box>
      </Box>
   )
}

export default ApplicationQuestionsStep
