import React, { useEffect, useState } from "react"
import { ArrowBack } from "@mui/icons-material"
import { Box, IconButton, Paper } from "@mui/material"
import { useCreateApplicationMutation } from "@/services/shared/jobApiCalls"
import { useUpdateCompanyJobByIdMutation } from "@/features/company/services/companyApiCalls"
import { showAlert } from "@/utils/swal"
import FormErrorAlert from "@/components/common/FormErrorAlert"
import { createJobSchema } from "@smart-recruitment/validation"
import CreateJobStepper from "../createJob/CreateJobStepper"
import JobTips from "../createJob/JobTips"
import QuestionTypesPreview from "../createJob/QuestionTypesPreview"
import JobDetailsStep from "../createJob/JobDetailsStep/JobDetailsStep"
import QuestionsStep from "./QuestionsStep/QuestionsStep"
import ReviewStep from "./ReviewStep"
import { emptyJobForm, type JobFormProps } from "./types"
import type { JobFormData } from "@/types/createJob.types"
import type { Question } from "@/types/question.types"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

const JobForm: React.FC<JobFormProps> = ({
   mode,
   initialData,
   jobId,
   initialStep = 1
}) => {
   const [currentStep, setCurrentStep] = useState(initialStep)
   const [form, setForm] = useState<JobFormData>(initialData?.form ?? emptyJobForm)
   const [questions, setQuestions] = useState<Question[]>(initialData?.questions ?? [])
   const [formError, setFormError] = useState<string | null>(null)
   const [createApplication, createResult] = useCreateApplicationMutation()
   const createState = getMutationState(createResult)
   const createPresentation = getMutationPresentation(createState, { surface: "form" })
   const [updateCompanyJob, updateResult] = useUpdateCompanyJobByIdMutation()
   const updateState = getMutationState(updateResult)
   const updatePresentation = getMutationPresentation(updateState, { surface: "form" })
   const isCreating = createPresentation.category === "loading"
   const isUpdating = updatePresentation.category === "loading"

   useEffect(() => {
      if (!initialData) return

      setForm(initialData.form)
      setQuestions(initialData.questions)
   }, [initialData])

   const updateField = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
      setForm(previous => ({ ...previous, [field]: value }))
   }

   const getPayload = () => ({
      title: form.title,
      employmentType: form.employmentType,
      description: form.description,
      experienceRequired: Number(form.experience),
      salary: form.salary > 0 ? Number(form.salary) : undefined,
      deadline: form.deadline,
      skills: form.skills,
      status: form.status,
      questions: questions.map(question => ({
         id: question.id,
         type: question.type,
         question: question.question,
         required: question.required,
         order: question.order,
         options: question.options ?? [],
         minSelection: question.minSelections ?? undefined,
         maxSelection: question.maxSelections ?? undefined,
         minNumber: question.minValue ?? undefined,
         maxNumber: question.maxValue ?? undefined
      }))
   })

   const handlePublish = async () => {
      const payload = getPayload()
      const validation = createJobSchema.safeParse(payload)

      if (!validation.success) {
         setFormError(
            validation.error.issues[0]?.message ?? "Please correct the form fields."
         )
         return
      }

      setFormError(null)

      try {
         const applicationPayload = {
            ...validation.data,
            status: payload.status
         } as typeof payload & typeof validation.data

         await createApplication(applicationPayload).unwrap()
         setForm({ ...emptyJobForm })
         setQuestions([])
         setCurrentStep(1)
         if (
            getMutationPresentation({ status: "success" }, { surface: "form" })
               .category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Job published",
               text: "The job was published successfully."
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "form" }
         )
         if (errorPresentation.category === "silent") return
         setFormError(
            errorPresentation.message ?? "Unable to publish the job. Please try again."
         )
      }
   }

   const handleUpdate = async () => {
      if (!jobId) return

      const payload = getPayload()
      const validation = createJobSchema.safeParse(payload)

      if (!validation.success) {
         setFormError(
            validation.error.issues[0]?.message ?? "Please correct the form fields."
         )
         return
      }

      setFormError(null)

      try {
         const updatePayload = {
            ...validation.data,
            status: payload.status
         } as typeof payload & typeof validation.data

         await updateCompanyJob({
            id: jobId,
            body: updatePayload
         }).unwrap()
         if (
            getMutationPresentation({ status: "success" }, { surface: "form" })
               .category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Job updated",
               text: "The job was updated successfully."
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "form" }
         )
         if (errorPresentation.category === "silent") return
         setFormError(
            errorPresentation.message ?? "Unable to update the job. Please try again."
         )
      }
   }

   return (
      <div className="min-h-screen px-5 py-6">
         <div className="mx-auto max-w-350">
            <div className="mb-6 flex items-start gap-3">
               <IconButton
                  size="small"
                  onClick={() => window.history.back()}>
                  <ArrowBack fontSize="small" />
               </IconButton>

               <div>
                  <h1 className="text-[25px] font-semibold tracking-[-0.5px] text-[#172033]">
                     {mode === "edit" ? "Edit Job" : "Create New Job"}
                  </h1>

                  <p className="mt-1 text-[13px] text-muted">
                     {mode === "edit"
                        ? "Update the job details and save your changes."
                        : "Fill in the details to post a new job and attract the right candidates."}
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_325px]">
               <Paper
                  elevation={0}
                  className="overflow-hidden! rounded-xl! border! bg-surface!">
                  <CreateJobStepper
                     currentStep={currentStep}
                     mode={mode}
                  />

                  <Box className="px-7 pt-5">
                     <FormErrorAlert message={formError} />
                  </Box>

                  {currentStep === 1 && (
                     <JobDetailsStep
                        form={form}
                        onChange={updateField}
                        onNext={() => {
                           const validation = createJobSchema.safeParse({
                              ...getPayload(),
                              questions: []
                           })
                           if (!validation.success) {
                              setFormError(
                                 validation.error.issues[0]?.message ??
                                    "Please correct the job details."
                              )
                              return
                           }
                           setFormError(null)
                           setCurrentStep(2)
                        }}
                        onCancel={() => window.history.back()}
                     />
                  )}

                  {currentStep === 2 && (
                     <QuestionsStep
                        questions={questions}
                        onQuestionsChange={setQuestions}
                        onBack={() => setCurrentStep(1)}
                        onNext={() => setCurrentStep(3)}
                     />
                  )}

                  {currentStep === 3 && (
                     <ReviewStep
                        form={form}
                        questions={questions}
                        onBack={() => setCurrentStep(2)}
                        onEditJob={() => setCurrentStep(1)}
                        onEditQuestions={() => setCurrentStep(2)}
                        onPublish={mode === "edit" ? handleUpdate : handlePublish}
                        isPublishing={isCreating || isUpdating}
                        mode={mode}
                     />
                  )}
               </Paper>

               <div className="flex flex-col gap-4">
                  <JobTips />
                  <QuestionTypesPreview />
               </div>
            </div>
         </div>
      </div>
   )
}

export default JobForm
