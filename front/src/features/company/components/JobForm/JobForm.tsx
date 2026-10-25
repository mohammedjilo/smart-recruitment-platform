import React, { useEffect, useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Paper, Typography } from "@mui/material"
import { useCreateApplicationMutation } from "@/services/shared/jobApiCalls"
import { useUpdateCompanyJobByIdMutation } from "@/features/company/services/companyApiCalls"
import { showAlert } from "@/utils/swal"
import FormErrorAlert from "@/components/common/FormErrorAlert"
import JobFormStepper from "./steps/JobFormStepper"
import JobTips from "./steps/JobTips"
import QuestionTypesPreview from "./steps/QuestionTypesPreview"
import JobDetailsStep from "./steps/JobDetailsStep/JobDetailsStep"
import QuestionsStep from "./steps/QuestionsStep/QuestionsStep"
import ReviewStep from "./steps/ReviewStep/ReviewStep"
import {
   getJobFormDefaults,
   jobFormSchema,
   mapQuestionToFormInput,
   type JobFormInput,
   type JobFormOutput,
   type JobFormProps
} from "./types"
import type { JobFormData } from "@/types/createJob.types"
import type { Question } from "@/types/question.types"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

const JobForm: React.FC<JobFormProps> = ({ mode, initialData, jobId, initialStep = 1 }) => {
   const [currentStep, setCurrentStep] = useState(initialStep)
   const [detailsValidationAttempted, setDetailsValidationAttempted] = useState(false)
   const [questions, setQuestions] = useState<Question[]>(initialData?.questions ?? [])
   const [formError, setFormError] = useState<string | null>(null)
   const formMethods = useForm<JobFormInput, undefined, JobFormOutput>({
      resolver: zodResolver(jobFormSchema),
      mode: "onSubmit",
      defaultValues: getJobFormDefaults(initialData?.form, initialData?.questions)
   })
   const { reset } = formMethods
   const watchedValues = useWatch({ control: formMethods.control })
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

      reset(getJobFormDefaults(initialData.form, initialData.questions))
      setQuestions(initialData.questions)
   }, [initialData, reset])

   useEffect(() => {
      const subscription = formMethods.watch((_, { name }) => {
         setFormError(null)

         if (detailsValidationAttempted && currentStep === 1 && name) {
            void formMethods.trigger(name)
         }
      })

      return () => subscription.unsubscribe()
   }, [currentStep, detailsValidationAttempted, formMethods])

   const handleQuestionsChange: React.Dispatch<React.SetStateAction<Question[]>> = update => {
      const next = typeof update === "function" ? update(questions) : update
      setQuestions(next)
      formMethods.setValue("questions", next.map(mapQuestionToFormInput), {
         shouldDirty: true,
         shouldValidate: currentStep === 2
      })
   }

   const handlePublish = async (payload: JobFormOutput) => {
      setFormError(null)
      const { status, ...jobPayload } = payload

      try {
         if (mode === "edit") {
            if (!jobId) {
               setFormError("Unable to update this job because its ID is missing.")
               return
            }

            await updateCompanyJob({
               id: jobId,
               body: { ...jobPayload, status }
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
            return
         }

         await createApplication({ ...jobPayload, status }).unwrap()
         reset(getJobFormDefaults())
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
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "form"
         })
         if (errorPresentation.category === "silent") return
         setFormError(
            errorPresentation.message ??
               `Unable to ${mode === "edit" ? "update" : "publish"} the job. Please try again.`
         )
      }
   }

   const handleDetailsNext = async () => {
      setDetailsValidationAttempted(true)
      const valid = await formMethods.trigger()
      if (!valid) {
         return
      }

      setFormError(null)
      setCurrentStep(2)
   }

   const handleQuestionsNext = async () => {
      const valid = await formMethods.trigger("questions")
      if (!valid) {
         return
      }

      setFormError(null)
      setCurrentStep(3)
   }

   const form: JobFormData = {
      title: watchedValues.title ?? "",
      employmentType: watchedValues.employmentType ?? "",
      description: watchedValues.description ?? "",
      experience: watchedValues.experience ?? "",
      salary: watchedValues.salary ?? 0,
      deadline: watchedValues.deadline ?? "",
      skills: watchedValues.skills ?? [],
      status: watchedValues.status ?? "OPEN"
   }

   return (
      <Box className="min-h-screen px-5 py-6">
         <Box className="mx-auto max-w-350">
            <Box className="mb-6 flex items-start gap-3">
               <Box>
                  <Typography className="text-2xl! font-bold!">
                     {mode === "edit" ? "Edit Job" : "Create New Job"}
                  </Typography>

                  <Typography
                     className="mt-1! text-sm!"
                     color="textSecondary">
                     {mode === "edit"
                        ? "Update the job details and save your changes."
                        : "Fill in the details to post a new job and attract the right candidates."}
                  </Typography>
               </Box>
            </Box>

            <Box className="grid grid-cols-1 gap-7 xl:grid-cols-[minmax(0,1fr)_325px]">
               <FormProvider {...formMethods}>
                  <Paper
                     className="bg-surface! overflow-hidden! rounded-xl! border!"
                     elevation={0}>
                     <form
                        noValidate
                        onSubmit={formMethods.handleSubmit(
                           values => {
                              if (currentStep === 3) void handlePublish(values)
                           }
                        )}>
                        <JobFormStepper
                           currentStep={currentStep}
                           mode={mode}
                        />

                        <Box className="px-7 pt-5">
                           <FormErrorAlert message={formError} />
                        </Box>

                        {currentStep === 1 && (
                           <JobDetailsStep
                              onCancel={() => window.history.back()}
                              onNext={() => void handleDetailsNext()}
                           />
                        )}

                        {currentStep === 2 && (
                           <QuestionsStep
                              questions={questions}
                              onBack={() => setCurrentStep(1)}
                              onNext={() => void handleQuestionsNext()}
                              onQuestionsChange={handleQuestionsChange}
                           />
                        )}

                        {currentStep === 3 && (
                           <ReviewStep
                              form={form}
                              isPublishing={isCreating || isUpdating}
                              mode={mode}
                              questions={questions}
                              onBack={() => setCurrentStep(2)}
                              onEditJob={() => setCurrentStep(1)}
                              onEditQuestions={() => setCurrentStep(2)}
                           />
                        )}
                     </form>
                  </Paper>
               </FormProvider>

               <Box className="flex flex-col gap-4">
                  <JobTips />
                  <QuestionTypesPreview />
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default JobForm
