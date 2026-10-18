import React, { useState } from "react"
import { Dialog, IconButton } from "@mui/material"
import { Close, ArrowForward } from "@mui/icons-material"

import BasicInformationStep, { type BasicInformationData } from "./BasicInformationStep"
import JobSummarySidebar from "./JobSummarySidebar"
import type { EmploymentType } from "@/types/job"
import QuestionsStep from "./QuestionsStep"
import { useParams } from "react-router-dom"
import ReviewStep from "./ReviewStep"
import type { AnswerItem } from "./applicationTypes"
import { useApplyToJobMutation } from "@/services/shared/applicationApiCalls"
import { useGetQuestionsQuery } from "@/services/shared/jobApiCalls"
import { showAlert } from "@/utils/swal"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

export type CreateApllicationPayload = {
   fullName: string
   email: string
   phone: string
   country: string
   age: string
   jobTitle: string

   useProfessionalProfile: boolean

   answers: {
      questionId: string
      answer: string | string[]
   }[]
}

// ============================================================
// ============================================================
interface ApplyModalProps {
   open: boolean
   handleClose: () => void
   userId: string
   companyId: string
   jobSummaryData: {
      companyName: string
      logoUrl: string | null
      location: string | null
      salary: number | null
      title: string
      employmentType: EmploymentType
      createdAt: Date
      deadline: string | Date
      skills: { skill: { skillName: string } }[]
   }
}

interface StepIndicatorProps {
   number: string
   title: string
   active?: boolean
}
function StepIndicator({ number, title, active }: StepIndicatorProps) {
   return (
      <div className="flex items-center gap-2">
         <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
               active ? "bg-primary text-white" : "text-muted bg-gray-100"
            }`}>
            {number}
         </div>
         <span
            className={`text-sm ${
               active ? "font-semibold text-primary" : "text-muted"
            }`}>
            {title}
         </span>
      </div>
   )
}

// ============================================================
// ============================================================
const ApplyModal: React.FC<ApplyModalProps> = ({
   open,
   handleClose,
   userId,
   companyId,
   jobSummaryData
}) => {
   const [activeStep, setActiveStep] = useState<number>(0)
   const { id } = useParams()
   const steps = ["Basic Information", "Questions", "Review"]
   const [applyToJob, applyResult] = useApplyToJobMutation()
   const applyState = getMutationState(applyResult)
   const applyPresentation = getMutationPresentation(applyState, {
      surface: "action",
      importance: "important"
   })
   const isSubmitting = applyPresentation.category === "loading"
   const {
      data: questionsData,
      isLoading: isLoadingQuestions,
      isError: isQuestionsError
   } = useGetQuestionsQuery({ id: id as string }, { skip: !id })

   // ============================================================
   // ============================================================
   const [basicInformationsData, setBasicInformationsData] =
      useState<BasicInformationData>({
         fullName: "",
         email: "",
         phone: "",
         country: "",
         age: "",
         jobTitle: "",
         useProfessionalProfile: true,
         cv: null
      })

   // ============================================================
   // ============================================================
   const [answers, setAnswers] = useState<AnswerItem[]>([])
   const [invalidQuestionIds, setInvalidQuestionIds] = useState<string[]>([])

   const handleNext = async () => {
      if (activeStep === 1 && (isLoadingQuestions || isQuestionsError)) return

      // ============================================================
      // ============================================================
      if (activeStep === 0) {
         setActiveStep(1)
         return
      }

      // ============================================================
      // ============================================================
      if (activeStep === 1) {
         const unansweredRequiredQuestionIds = (questionsData?.data ?? [])
            .filter(question => {
               if (!question.required) return false

               const answer = answers.find(
                  item => item.questionId === question.id
               )?.answer

               return Array.isArray(answer) ? answer.length === 0 : !answer?.trim()
            })
            .map(question => question.id)

         if (unansweredRequiredQuestionIds.length > 0) {
            setInvalidQuestionIds(unansweredRequiredQuestionIds)
            return
         }

         setInvalidQuestionIds([])
         setActiveStep(2)
         return
      }

      // ============================================================
      // ============================================================

      try {
         const formData = new FormData()

         // Basic Information
         formData.append("fullName", basicInformationsData.fullName)

         formData.append("email", basicInformationsData.email)

         formData.append("phone", basicInformationsData.phone)

         formData.append("country", basicInformationsData.country)

         formData.append("age", basicInformationsData.age)

         formData.append("jobTitle", basicInformationsData.jobTitle)

         formData.append(
            "useProfessionalProfile",
            String(basicInformationsData.useProfessionalProfile)
         )

         // Questions + Answers
         formData.append(
            "answers",
            JSON.stringify(
               answers.map(item => ({
                  questionId: item.questionId,
                  answer: item.answer
               }))
            )
         )

         // CV
         if (!basicInformationsData.useProfessionalProfile && basicInformationsData.cv) {
            formData.append("cv", basicInformationsData.cv)
         }

         await applyToJob({
            jobId: id as string,
            userId,
            companyId,
            formData
         }).unwrap()

         handleClose()
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "action", importance: "important" }
         )
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Application not submitted",
            text: errorPresentation.message
         })
      }
   }
   const handleBack = () => {
      if (activeStep > 0) setActiveStep(activeStep - 1)
   }

   // ============================================================
   // ============================================================
   const renderStep = () => {
      switch (activeStep) {
         case 0:
            return (
               <BasicInformationStep
                  formData={basicInformationsData}
                  setFormData={setBasicInformationsData}
               />
            )
         case 1:
            return (
               <QuestionsStep
                  jobId={id as string}
                  answers={answers}
                  setAnswers={setAnswers}
                  invalidQuestionIds={invalidQuestionIds}
                  setInvalidQuestionIds={setInvalidQuestionIds}
               />
            )

         case 2:
            return (
               <ReviewStep
                  basicInformationsData={basicInformationsData}
                  answers={answers}
               />
            )
         default:
            return null
      }
   }

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         maxWidth={false}
         slotProps={{
            paper: {
               className: "w-177.5 lg:w-190 rounded-2xl overflow-hidden"
            }
         }}>
         <div className="bg-surface">
            {/* ================= HEADER ================= */}
            <div className="border-b px-7 pt-6 pb-5">
               <div className="flex items-start justify-between">
                  <div>
                     <h1 className="text-[23px] font-bold text-[#11162f]">
                        Apply for this job
                     </h1>
                     <p className="mt-2 text-[13px] text-[#66708c]">
                        Fill in your details and answer the questions below
                     </p>
                  </div>
                  <IconButton
                     aria-label="Close application form"
                     onClick={handleClose}>
                     <Close />
                  </IconButton>
               </div>

               {/* Steps */}
               <div className="mt-7 flex items-center justify-center gap-4">
                  {steps.map((title, index) => (
                     <React.Fragment key={title}>
                        <StepIndicator
                           number={String(index + 1)}
                           title={title}
                           active={index === activeStep}
                        />
                        {index < steps.length - 1 && (
                           <div className="h-[1px] w-24 bg-gray-200" />
                        )}
                     </React.Fragment>
                  ))}
               </div>
            </div>

            {/* ================= BODY ================= */}
            <div className="grid grid-cols-[1fr_270px]">
               <div className="border-r p-6">{renderStep()}</div>

               <JobSummarySidebar data={jobSummaryData} />
            </div>

            {/* ================= FOOTER ================= */}
            <div className="flex justify-between border-t px-6 py-4">
               <button
                  onClick={activeStep === 0 ? handleClose : handleBack}
                  className="app-button-secondary rounded-lg px-5 py-2.5 text-sm">
                  {activeStep === 0 ? "Cancel" : "Back"}
               </button>

               {/* <button
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-lg bg-[#5421e8] px-6 py-2.5 text-sm font-semibold text-white">
                  {activeStep === steps.length - 1 ? "Submit Application" : "Next"}
                  {activeStep < steps.length - 1 && <ArrowForward fontSize="small" />}
               </button> */}
               <button
                  onClick={handleNext}
                  disabled={
                     isSubmitting ||
                     (activeStep === 1 && (isLoadingQuestions || isQuestionsError))
                  }
                  className="app-button-primary flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
                  {activeStep === steps.length - 1
                     ? isSubmitting
                        ? "Submitting..."
                        : "Submit Application"
                     : activeStep === 1 && isLoadingQuestions
                       ? "Loading questions..."
                       : activeStep === 1 && isQuestionsError
                         ? "Questions unavailable"
                         : "Next"}

                  {activeStep < steps.length - 1 && <ArrowForward fontSize="small" />}
               </button>
            </div>
         </div>
      </Dialog>
   )
}

export default ApplyModal
