import { Box, Button, Typography } from "@mui/material"

import type { JobQuestion } from "@/types/admin"
import type { SemanticQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import QuestionItem from "./QuestionItem"
import QuestionsListSkeleton from "./QuestionsListSkeleton"

type QuestionsListProps = {
   questions: JobQuestion[]
   queryState: SemanticQueryState<unknown>
   onRetry: () => void
}

const QuestionsList = ({ questions, queryState, onRetry }: QuestionsListProps) => {
   const queryPresentation = getQueryPresentation(queryState, "section")

   if (queryPresentation.category === "loading") {
      return <QuestionsListSkeleton />
   }

   if (
      queryPresentation.category === "section_error" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box
            className="border-border bg-surface flex min-h-62.5 flex-col items-center justify-center gap-3 rounded-xl border"
            aria-live="assertive"
            role="alert">
            <Typography className="text-sm text-red-500">
               {queryPresentation.message}
            </Typography>
            <Button
               className="normal-case!"
               onClick={onRetry}>
               Retry
            </Button>
         </Box>
      )
   }

   if (
      queryPresentation.category === "silent" &&
      (queryState.status !== "aborted" || queryState.data === undefined)
   )
      return null

   if (queryState.status === "idle") return null

   const questionsAreEmpty =
      queryPresentation.category === "empty" ||
      queryPresentation.category === "no_results"

   if (questionsAreEmpty) {
      return (
         <Box className="border-border bg-surface flex min-h-62.5 flex-col items-center justify-center rounded-xl border p-6 text-center">
            <Typography className="text-content text-sm! font-semibold!">
               No application questions
            </Typography>

            <Typography className="text-muted mt-2! text-xs!">
               This job does not have any application questions.
            </Typography>
         </Box>
      )
   }

   return (
      <Box className="space-y-3">
         {queryPresentation.category === "stale_error" && (
            <Box
               className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
               aria-live="polite"
               role="status">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button
                  className="normal-case!"
                  onClick={onRetry}>
                  Retry
               </Button>
            </Box>
         )}
         <Box className="bg-surface overflow-hidden rounded-xl border">
            {questions.map((question, index) => (
               <QuestionItem
                  key={question.id}
                  isLast={index === questions.length - 1}
                  question={question}
               />
            ))}
         </Box>
      </Box>
   )
}

export default QuestionsList
