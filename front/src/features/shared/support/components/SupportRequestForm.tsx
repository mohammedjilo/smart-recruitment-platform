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
         className="space-y-5"
         onSubmit={handleSubmit(onSubmit)}>
         <Box>
            <Typography
               className="text-content font-bold!"
               variant="h5">
               Create Support Request
            </Typography>
            <Typography
               className="text-muted mt-1!"
               variant="body2">
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
                  placeholder="Example: I can't upload a job post"
                  error={Boolean(errors.subject)}
                  fullWidth
                  helperText={errors.subject?.message}
                  label="Subject"
               />
            )}
         />

         <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
               <FormControl
                  className="mb-3!"
                  error={Boolean(errors.categoryId)}
                  fullWidth>
                  <InputLabel id="support-category-label">Category</InputLabel>
                  <Select
                     {...field}
                     disabled={isLoadingCategories}
                     label="Category"
                     labelId="support-category-label">
                     {isLoadingCategories ? (
                        <MenuItem
                           disabled
                           value="">
                           <Skeleton
                              variant="text"
                              width={150}
                           />
                        </MenuItem>
                     ) : categories.length === 0 ? (
                        <MenuItem
                           disabled
                           value="">
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
                  placeholder="Describe the issue, what you were doing, and what result you expected."
                  error={Boolean(errors.description)}
                  fullWidth
                  helperText={errors.description?.message}
                  label="Description"
                  minRows={6}
                  multiline
               />
            )}
         />

         <Box className="flex items-center justify-end gap-3 pt-2">
            <Button
               className="rounded-[10px]! px-6! py-2.4! font-bold! normal-case! shadow-none!"
               type="submit"
               disabled={isSubmitting || isLoadingCategories}
               variant="contained">
               {isSubmitting ? (
                  <Box className="contents">
                     <CircularProgress
                        className="mr-1! text-white!"
                        size={18}
                     />
                     Creating...
                  </Box>
               ) : (
                  "Submit request"
               )}
            </Button>
         </Box>
      </form>
   )
}
