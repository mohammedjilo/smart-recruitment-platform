import React from "react"

import { Alert, Button, Checkbox, TextField, Box, Typography } from "@mui/material"

import { RadioButtonUnchecked, CheckCircle } from "@mui/icons-material"
import { useGetQuestionsQuery } from "@/services/shared/jobApiCalls"
import type { QuestionType } from "@/types/job"
import type { AnswerItem } from "./applicationTypes"
import QuestionsStepSkeleton from "./QuestionsStepSkeleton"

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
      return <QuestionsStepSkeleton />
   }

   if (isError) {
      return (
         <Alert
            action={
               <Button
                  className="normal-case!"
                  color="inherit"
                  size="small"
                  onClick={() => void refetch()}>
                  Retry
               </Button>
            }
            severity="error">
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
                  required={question.required}
                  invalid={invalidQuestionIds.includes(question.id)}
                  number={index + 1}
                  question={question.question}>
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
                  checked={value === "YES"}

                  invalid={invalid}

                  label="Yes"
                  onClick={() => onChange("YES")}
               />

               <RadioOption
                  checked={value === "NO"}

                  invalid={invalid}

                  label="No"
                  onClick={() => onChange("NO")}
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

                     checked={value === option}

                     invalid={invalid}

                     label={option}
                     onClick={() => onChange(option)}
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
                     className="text-mui-blue-300 flex cursor-pointer items-center gap-2 text-sm"

                     key={option}>
                     <Checkbox
                        checked={Array.isArray(value) && value.includes(option)}

                        sx={{
                           color: invalid ? "#ef4444" : "#d2d5df",

                           "&.Mui-checked": {
                              color: invalid ? "#ef4444" : "#5421e8"
                           }
                        }}

                        onChange={e => {
                           let current = Array.isArray(value) ? value : []

                           if (e.target.checked) {
                              onChange([...current, option])
                           } else {
                              onChange(current.filter(x => x !== option))
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
                  className={`text-mui-blue-300 min-h-23.75 w-full resize-none rounded-lg border p-3 text-sm outline-none focus:border-[#5421e8] ${invalid ? "border-red-500" : "border-[#dfe3eb]"}`}

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
               type="number"

               value={value ?? ""}

               fullWidth

               size="small"

               sx={{
                  "& .MuiOutlinedInput-root": {
                     borderRadius: "8px",
                     color: "#64b5f6",
                     ...(invalid && {
                        "& fieldset": { borderColor: "#ef4444" }
                     })
                  }
               }}

               onChange={e => onChange(e.target.value)}
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
         className="text-mui-blue-300 flex cursor-pointer items-center gap-2 text-sm"

         onClick={onClick}>
         <Box className="relative h-4 w-4">
            {checked ? (
               <CheckCircle
                  className="text-[17px]!"
                  sx={{
                     color: invalid ? "#ef4444" : "#5421e8"
                  }}
               />
            ) : (
               <RadioButtonUnchecked
                  className="text-[17px]!"
                  sx={{
                     color: invalid ? "#ef4444" : "#cfd4df"
                  }}
               />
            )}
         </Box>

         {label}
      </label>
   )
}
