import { Box, Button, Skeleton, Typography } from "@mui/material"

import type { JobQuestion } from "@/types/admin"
import type { SemanticQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import QuestionItem from "./QuestionItem"

type QuestionsListProps = {
   questions: JobQuestion[]
   queryState: SemanticQueryState<unknown>
   onRetry: () => void
}

const QuestionsList = ({ questions, queryState, onRetry }: QuestionsListProps) => {
   const queryPresentation = getQueryPresentation(queryState, "section")

   if (queryPresentation.category === "loading") {
      return (
         <Box className="overflow-hidden rounded-xl border border-border bg-surface">
            {Array.from({
               length: 4
            }).map((_, index) => (
               <Box
                  key={index}
                  className="flex items-center gap-5 border-b border-border p-6 last:border-b-0">
                  <Skeleton
                     variant="rounded"
                     width={36}
                     height={36}
                  />

                  <Box className="flex-1">
                     <Skeleton
                        width="55%"
                        height={24}
                     />

                     <Skeleton
                        width="30%"
                        height={18}
                     />
                  </Box>
               </Box>
            ))}
         </Box>
      )
   }

   if (
      queryPresentation.category === "section_error" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-62.5 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface" role="alert" aria-live="assertive">
            <Typography className="text-sm text-red-500">
               {queryPresentation.message}
            </Typography>
            <Button onClick={onRetry} className="normal-case!">
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
         <Box className="flex min-h-62.5 flex-col items-center justify-center rounded-xl border border-border bg-surface p-6 text-center">
            <Typography className="text-sm! font-semibold! text-content">
               No application questions
            </Typography>

            <Typography className="mt-2! text-xs! text-muted">
               This job does not have any application questions.
            </Typography>
         </Box>
      )
   }

   return (
      <Box className="space-y-3">
         {queryPresentation.category === "stale_error" && (
            <Box className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="status" aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={onRetry} className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}
         <Box className="overflow-hidden rounded-xl border bg-surface">
            {questions.map((question, index) => (
               <QuestionItem
                  key={question.id}
                  question={question}
                  isLast={index === questions.length - 1}
               />
            ))}
         </Box>
      </Box>
   )
}

export default QuestionsList
