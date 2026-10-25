import { Box, Button, Chip, Typography } from "@mui/material"
import { ExpandLess, ExpandMore, QuestionAnswerOutlined } from "@mui/icons-material"
import type { CompanyApplication } from "@/types/application"
import { formatQuestionType } from "@/utils/jobDetails.utils"

type ApplicationAnswer = NonNullable<CompanyApplication["answers"]>[number]

const formatAnswerValue = (value: unknown): string => {
   if (value === null || value === undefined || value === "") {
      return "No answer provided"
   }
   if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
   ) {
      return String(value)
   }
   try {
      return JSON.stringify(value, null, 2) ?? "No answer provided"
   } catch {
      return "Answer could not be displayed"
   }
}

type ApplicationAnswersProps = {
   answers: ApplicationAnswer[]
   expanded: boolean
   onToggle: () => void
}

const ApplicationAnswers = ({ answers, expanded, onToggle }: ApplicationAnswersProps) => {
   return (
      <Box className="border-t border-[#E7EAF0] px-5 py-4">
         <Box className="flex items-center justify-between gap-3">
            <Box className="flex items-center gap-3">
               <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8FAFC]">
                  <QuestionAnswerOutlined
                     className="text-[#64748B]!"
                     fontSize="small"
                  />
               </Box>
               <Box>
                  <Typography className="text-sm! font-semibold! text-[#334155]!">
                     Application Answers
                  </Typography>
                  <Typography className="text-xs! text-[#64748B]!">
                     {answers.length} {answers.length === 1 ? "answer" : "answers"}{" "}
                     submitted
                  </Typography>
               </Box>
            </Box>
            {answers.length > 0 && (
               <Button
                  className="normal-case!"
                  aria-controls="company-application-answers"
                  aria-expanded={expanded}
                  endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                  size="small"
                  variant="outlined"
                  onClick={onToggle}>
                  {expanded ? "Hide Answers" : "View Answers"}
               </Button>
            )}
         </Box>
         {expanded && answers.length > 0 && (
            <Box
               className="mt-4 space-y-3"
               id="company-application-answers"
               aria-label="Submitted application answers">
               {answers.map((item, index) => (
                  <Box
                     className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                     key={item.id}>
                     <Box className="flex items-start gap-3 p-4">
                        <Box className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-xs font-bold text-violet-700">
                           {index + 1}
                        </Box>
                        <Box className="min-w-0 flex-1">
                           <Typography className="text-sm! leading-6! font-semibold! text-slate-800!">
                              {item.question.question}
                           </Typography>
                           <Box className="mt-2 flex flex-wrap gap-2">
                              <Typography className="rounded-full! border! border-slate-200! bg-slate-50! px-2.5! py-1! text-[11px]! font-medium! text-slate-600!">
                                 {formatQuestionType(item.question.type)}
                              </Typography>
                              <Typography
                                 className={`rounded-full! px-2.5! py-1! text-[11px]! font-semibold! ${
                                    item.question.required
                                       ? "bg-violet-100! text-violet-700!"
                                       : "bg-slate-100! text-slate-600!"
                                 }`}>
                                 {item.question.required ? "Required" : "Optional"}
                              </Typography>
                           </Box>
                        </Box>
                     </Box>
                     <Box className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 pl-15">
                        <Typography className="mb-1! text-[11px]! font-semibold! text-slate-500!">
                           Submitted answer
                        </Typography>
                        {Array.isArray(item.answer) ? (
                           item.answer.length > 0 ? (
                              <Box className="flex flex-wrap gap-2">
                                 {item.answer.map((answer, answerIndex) => (
                                    <Chip
                                       className="border! border-slate-200! bg-white! text-slate-700!"
                                       key={`${item.id}-${answerIndex}`}
                                       label={formatAnswerValue(answer)}
                                       size="small"
                                    />
                                 ))}
                              </Box>
                           ) : (
                              <Typography className="text-sm! text-slate-400! italic!">
                                 No answer provided
                              </Typography>
                           )
                        ) : (
                           <Typography
                              className="text-sm! leading-6! whitespace-pre-wrap! text-slate-700!"
                              component="div">
                              {formatAnswerValue(item.answer)}
                           </Typography>
                        )}
                     </Box>
                  </Box>
               ))}
            </Box>
         )}
      </Box>
   )
}

export default ApplicationAnswers
