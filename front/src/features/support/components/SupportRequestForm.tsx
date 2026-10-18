import { useEffect } from "react"
import {
   Box,
   Button,
   CircularProgress,
   FormControl,
   InputLabel,
   MenuItem,
   Select,
   Skeleton,
   TextField,
   Typography
} from "@mui/material"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
   useCreateSupportTicketMutation,
   useGetSupportCategoriesQuery
} from "@/services/shared/supportApiCalls"
import type { CreateSupportTicketPayload } from "@/types/entities/support"
import FormErrorAlert from "@/components/common/FormErrorAlert"
import {
   createSupportRequestSchema,
   type CreateSupportRequestFormValues
} from "@/schema/support"
import { applyApiFieldErrors } from "@/utils/formErrors"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

type Props = {
   portalType: "user" | "company"
   onSuccess?: (ticketId: string) => void
   initialSubject?: string
   initialDescription?: string
   initialCategoryId?: string
   initialCategoryName?: string
}

export default function SupportRequestForm({
   portalType,
   onSuccess,
   initialSubject = "",
   initialDescription = "",
   initialCategoryId = "",
   initialCategoryName = ""
}: Props) {
   const { data: categoriesData, isLoading: isLoadingCategories } =
      useGetSupportCategoriesQuery(portalType === "company" ? "COMPANY" : "USER")
   const [createTicket, submitResult] = useCreateSupportTicketMutation()
   const submitState = getMutationState(submitResult)
   const submitPresentation = getMutationPresentation(submitState, { surface: "form" })
   const isSubmitting = submitPresentation.category === "loading"
   const {
      control,
      handleSubmit,
      setValue,
      setError,
      formState: { errors }
   } = useForm<CreateSupportRequestFormValues>({
      resolver: zodResolver(createSupportRequestSchema),
      defaultValues: {
         subject: initialSubject,
         description: initialDescription,
         categoryId: initialCategoryId
      },
      mode: "onSubmit",
      reValidateMode: "onChange",
      shouldFocusError: true
   })

   const categories = (categoriesData?.data ?? [])
      .filter(
         category => category.audience === (portalType === "company" ? "COMPANY" : "USER")
      )
      .filter(
         (category, index, allCategories) =>
            allCategories.findIndex(
               item =>
                  item.name.trim().toLowerCase() === category.name.trim().toLowerCase()
            ) === index
      )

   useEffect(() => {
      if (initialCategoryId) {
         setValue("categoryId", initialCategoryId)
         return
      }

      if (!initialCategoryName || categories.length === 0) {
         return
      }

      const normalizedCategoryName = initialCategoryName.trim().toLowerCase()
      const matchingCategory = categories.find(
         category => category.name.trim().toLowerCase() === normalizedCategoryName
      )

      if (matchingCategory) {
         setValue("categoryId", matchingCategory.id)
      }
   }, [categories, initialCategoryId, initialCategoryName, setValue])

   const onSubmit = async (values: CreateSupportRequestFormValues) => {
      const payload: CreateSupportTicketPayload = values
      try {
         const result = await createTicket(payload).unwrap()
         if (result.data?.id) onSuccess?.(result.data.id)
      } catch (error) {
         applyApiFieldErrors(error, setError)
      }
   }

   return (
      <form
         onSubmit={handleSubmit(onSubmit)}
         className="space-y-5">
         <Box>
            <Typography
               variant="h5"
               className="text-content font-bold!">
               Create Support Request
            </Typography>
            <Typography
               variant="body2"
               className="text-muted mt-1!">
               {portalType === "company"
                  ? "Tell us what you need help with as a company account."
                  : "Tell us what you need help with and we will follow up soon."}
            </Typography>
         </Box>

         <FormErrorAlert
            message={
               submitPresentation.category === "field_error" ||
               submitPresentation.category === "form_error" ||
               submitPresentation.category === "authentication_notice" ||
               submitPresentation.category === "access_denied" ||
               submitPresentation.category === "resource_not_found"
                  ? submitPresentation.message
                  : null
            }
         />

         <Controller
            name="subject"
            control={control}
            render={({ field }) => (
               <TextField
                  {...field}
                  className="mb-3!"
                  label="Subject"
                  fullWidth
                  error={Boolean(errors.subject)}
                  helperText={errors.subject?.message}
                  placeholder="Example: I can't upload a job post"
               />
            )}
         />

         <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
               <FormControl
                  className="mb-3!"
                  fullWidth
                  error={Boolean(errors.categoryId)}>
                  <InputLabel id="support-category-label">Category</InputLabel>
                  <Select
                     {...field}
                     labelId="support-category-label"
                     label="Category"
                     disabled={isLoadingCategories}>
                     {isLoadingCategories ? (
                        <MenuItem
                           value=""
                           disabled>
                           <Skeleton
                              variant="text"
                              width={150}
                           />
                        </MenuItem>
                     ) : categories.length === 0 ? (
                        <MenuItem
                           value=""
                           disabled>
                           No categories available
                        </MenuItem>
                     ) : (
                        categories.map(category => (
                           <MenuItem
                              key={category.id}
                              value={category.id}>
                              {category.name}
                           </MenuItem>
                        ))
                     )}
                  </Select>
                  {errors.categoryId && (
                     <Typography className="mt-1! text-xs! text-red-600!">
                        {errors.categoryId.message}
                     </Typography>
                  )}
               </FormControl>
            )}
         />

         <Controller
            name="description"
            control={control}
            render={({ field }) => (
               <TextField
                  {...field}
                  className="mb-3!"
                  label="Description"
                  fullWidth
                  multiline
                  minRows={6}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
                  placeholder="Describe the issue, what you were doing, and what result you expected."
               />
            )}
         />

         <Box className="flex items-center justify-end gap-3 pt-2">
            <Button
               type="submit"
               variant="contained"
               disabled={isSubmitting || isLoadingCategories}
               className="app-button-primary rounded-[10px]! px-6! py-[9.6px]! font-bold! normal-case! shadow-none!">
               {isSubmitting ? (
                  <>
                     <CircularProgress
                        size={18}
                        className="mr-1! text-white!"
                     />
                     Creating...
                  </>
               ) : (
                  "Submit request"
               )}
            </Button>
         </Box>
      </form>
   )
}
