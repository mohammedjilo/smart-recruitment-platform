import React from "react"

import {
   Alert,
   Button,
   Checkbox,
   TextField,
   Box,
   Skeleton,
   Typography
} from "@mui/material"

import { RadioButtonUnchecked, CheckCircle } from "@mui/icons-material"
import { useGetQuestionsQuery } from "@/services/shared/jobApiCalls"
import type { QuestionType } from "@/types/job"
import type { AnswerItem } from "./applicationTypes"

interface QuestionsStepProps {
   jobId: string
   answers: AnswerItem[]
   setAnswers: React.Dispatch<React.SetStateAction<AnswerItem[]>>
   invalidQuestionIds: string[]
   setInvalidQuestionIds: React.Dispatch<React.SetStateAction<string[]>>
}
type AnswerValue = string | string[]

const QuestionsStep: React.FC<QuestionsStepProps> = ({
   jobId,
   answers,
   setAnswers,
   invalidQuestionIds,
   setInvalidQuestionIds
}) => {
   const { data, isLoading, isError, refetch } = useGetQuestionsQuery({ id: jobId })

   const updateAnswer = (questionId: string, value: AnswerValue, question: string) => {
      const isEmpty = Array.isArray(value) ? value.length === 0 : !value.trim()

      if (!isEmpty) {
         setInvalidQuestionIds(previous => previous.filter(id => id !== questionId))
      }

      setAnswers(prev => {
         const existingIndex = prev.findIndex(item => item.questionId === questionId)
         const newItem: AnswerItem = { questionId, question, answer: value }

         if (existingIndex !== -1) {
            const newAnswers = [...prev]
            newAnswers[existingIndex] = newItem
            return newAnswers
         } else {
            return [...prev, newItem]
         }
      })
   }

   if (isLoading) {
      return (
         <Box className="space-y-4">
            <Box>
               <Skeleton
                  variant="text"
                  width={130}
                  height={26}
               />
               <Skeleton
                  variant="text"
                  width="72%"
               />
            </Box>
            {[0, 1, 2].map(item => (
               <Skeleton
                  key={item}
                  variant="rounded"
                  height={112}
               />
            ))}
         </Box>
      )
   }

   if (isError) {
      return (
         <Alert
            severity="error"
            action={
               <Button
                  color="inherit"
                  size="small"
                  onClick={() => void refetch()}
                  className="normal-case!">
                  Retry
               </Button>
            }>
            Could not load the application questions.
         </Alert>
      )
   }

   const questions = [...(data?.data ?? [])].sort((a, b) => a.order - b.order)

   return (
      <Box className="w-full">
         <Box className="mb-6">
            <Typography className="text-[16px]! font-bold!">Questions</Typography>
            <Typography
               className="mt-1! text-[13px]!"
               color="textSecondary">
               Please answer the following questions to help us learn more about you.
            </Typography>
         </Box>

         <Box className="space-y-4">
            {questions.map((question, index) => (
               <QuestionCard
                  key={question.id}
                  number={index + 1}
                  question={question.question}
                  required={question.required}
                  invalid={invalidQuestionIds.includes(question.id)}>
                  {renderQuestionInput(
                     question,
                     answers.find(item => item.questionId === question.id)?.answer,
                     value => updateAnswer(question.id, value, question.question),
                     invalidQuestionIds.includes(question.id)
                  )}
               </QuestionCard>
            ))}
         </Box>
      </Box>
   )
}

export default QuestionsStep

// ======================================================
// Question Renderer
// ======================================================

const renderQuestionInput = (
   question: {
      id: string
      type: QuestionType
      options: any
   },

   value: AnswerValue | undefined,

   onChange: (value: AnswerValue) => void,
   invalid: boolean
) => {
   switch (question.type) {
      // ===============================
      // YES NO
      // ===============================

      case "YES_NO":
         return (
            <Box className="flex gap-8">
               <RadioOption
                  label="Yes"

                  checked={value === "YES"}

                  onClick={() => onChange("YES")}
                  invalid={invalid}
               />

               <RadioOption
                  label="No"

                  checked={value === "NO"}

                  onClick={() => onChange("NO")}
                  invalid={invalid}
               />
            </Box>
         )

      // ===============================
      // SINGLE CHOICE
      // ===============================

      case "SINGLE_CHOICE":
         return (
            <Box className="flex flex-wrap gap-x-8 gap-y-3">
               {(question.options ?? []).map((option: string) => (
                  <RadioOption
                     key={option}

                     label={option}

                     checked={value === option}

                     onClick={() => onChange(option)}
                     invalid={invalid}
                  />
               ))}
            </Box>
         )

      // ===============================
      // MULTIPLE CHOICE
      // ===============================

      case "MULTIPLE_CHOICE":
         return (
            <Box className="flex flex-wrap gap-x-6 gap-y-3">
               {(question.options ?? []).map((option: string) => (
                  <label
                     key={option}

                     className="text-mui-blue-300 flex cursor-pointer items-center gap-2 text-sm">
                     <Checkbox
                        checked={Array.isArray(value) && value.includes(option)}

                        onChange={e => {
                           let current = Array.isArray(value) ? value : []

                           if (e.target.checked) {
                              onChange([...current, option])
                           } else {
                              onChange(current.filter(x => x !== option))
                           }
                        }}

                        sx={{
                           color: invalid ? "#ef4444" : "#d2d5df",

                           "&.Mui-checked": {
                              color: invalid ? "#ef4444" : "#5421e8"
                           }
                        }}
                     />

                     {option}
                  </label>
               ))}
            </Box>
         )

      // ===============================
      // TEXT
      // NUMBER
      // ===============================

      case "TEXT":
         return (
            <Box>
               <textarea
                  className={`text-mui-blue-300 min-h-[95px] w-full resize-none rounded-lg border p-3 text-sm outline-none focus:border-[#5421e8] ${invalid ? "border-red-500" : "border-[#dfe3eb]"}`}

                  value={typeof value === "string" ? value : ""}

                  onChange={e => onChange(e.target.value)}
               />

               <Box className="text-muted mt-1 text-right text-xs">
                  {typeof value === "string" ? value.length : 0}/ 1000
               </Box>
            </Box>
         )

      case "NUMBER":
         return (
            <TextField
               fullWidth

               type="number"

               size="small"

               value={value ?? ""}

               onChange={e => onChange(e.target.value)}

               sx={{
                  "& .MuiOutlinedInput-root": {
                     borderRadius: "8px",
                     color: "#64b5f6",
                     ...(invalid && {
                        "& fieldset": { borderColor: "#ef4444" }
                     })
                  }
               }}
            />
         )

      default:
         return null
   }
}

// ======================================================
// Question Card
// ======================================================

const QuestionCard = ({
   number,
   question,
   required,
   invalid,
   children
}: {
   number: number
   question: string
   required: boolean
   invalid: boolean
   children: React.ReactNode
}) => {
   return (
      <Box
         className={`bg-surface rounded-lg border p-4 ${invalid ? "border-red-500" : "border-[#e4e7ef]"}`}>
         <Box className="flex gap-3">
            {/* Number */}

            <Box className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5421e8] text-xs font-semibold text-white">
               {number}
            </Box>

            <Box className="flex-1">
               <Typography
                  className={`text-[13px]! leading-5! font-semibold! ${invalid ? "text-red-600!" : ""}`}>
                  {question}

                  {required && <span className="text-red-500"> *</span>}
               </Typography>

               <Box className="mt-4">{children}</Box>
            </Box>
         </Box>
      </Box>
   )
}

// ======================================================
// Radio Option
// ======================================================

const RadioOption = ({
   label,
   checked,
   onClick,
   invalid
}: {
   label: string
   checked: boolean
   onClick: () => void
   invalid: boolean
}) => {
   return (
      <label
         onClick={onClick}

         className="text-mui-blue-300 flex cursor-pointer items-center gap-2 text-sm">
         <Box className="relative h-4 w-4">
            {checked ? (
               <CheckCircle
                  sx={{
                     fontSize: 17,

                     color: invalid ? "#ef4444" : "#5421e8"
                  }}
               />
            ) : (
               <RadioButtonUnchecked
                  sx={{
                     fontSize: 17,

                     color: invalid ? "#ef4444" : "#cfd4df"
                  }}
               />
            )}
         </Box>

         {label}
      </label>
   )
}
