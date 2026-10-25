import { Box, Typography } from "@mui/material"

import type { JobQuestion } from "@/types/admin"
import QuestionTypeInfo from "./QuestionTypeInfo"

type QuestionItemProps = {
   question: JobQuestion
   isLast: boolean
}

const QuestionItem = ({ question, isLast }: QuestionItemProps) => {
   return (
      <Box
         className={`grid grid-cols-1 gap-5 p-6 md:grid-cols-[44px_minmax(0,1fr)_220px_90px] md:items-start ${!isLast ? "border-b" : ""} `}>
         {/* Question Number */}

         <Box className="bg-primary/10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
            <Typography className="text-sm! font-bold!">{question.order}</Typography>
         </Box>

         {/* Question Content */}

         <Box className="min-w-0">
            <Typography className="text-sm! leading-6! font-semibold!">
               {question.question}
            </Typography>

            {question.options && question.options.length > 0 && (
               <Box
                  className="mt-3 list-disc space-y-1 pl-5"
                  component="ul">
                  {question.options.map((option, index) => (
                     <Box
                        className="pl-1 text-sm text-muted"
                        key={`${question.id}-${index}`}
                        component="li">
                        {option}
                     </Box>
                  ))}
               </Box>
            )}
         </Box>

         {/* Question Type */}

         <QuestionTypeInfo question={question} />

         {/* Required */}

         <Box className="flex md:justify-end">
            <Box
               className={`inline-flex rounded-md px-2.5 py-1 ${
                  question.required
                     ? "bg-emerald-50 text-emerald-700"
                     : "bg-slate-100 text-muted"
               } `}>
               <Typography className="text-[10px]! font-bold!">
                  {question.required ? "Required" : "Optional"}
               </Typography>
            </Box>
         </Box>
      </Box>
   )
}

export default QuestionItem
