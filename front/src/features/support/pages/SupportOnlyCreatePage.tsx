import { useState, type FormEvent } from "react"
import {
   Alert,
   Box,
   Button,
   CircularProgress,
   FormControl,
   InputLabel,
   MenuItem,
   Select,
   TextField,
   Typography
} from "@mui/material"
import { Link, useNavigate } from "react-router-dom"
import { createSupportRequestSchema } from "@/schema/support"
import {
   useCreateSupportOnlyTicketMutation,
   useGetSupportOnlyCategoriesQuery
} from "@/services/api/supportOnlyApi"

const errorText = (error: unknown) => {
   if (typeof error === "object" && error !== null && "data" in error) {
      const data = error.data
      if (typeof data === "object" && data !== null && "error" in data) {
         const apiError = data.error
         if (
            typeof apiError === "object" &&
            apiError !== null &&
            "message" in apiError &&
            typeof apiError.message === "string"
         ) {
            return apiError.message
         }
      }
   }
   return "The support request could not be submitted."
}

export default function SupportOnlyCreatePage() {
   const navigate = useNavigate()
   const categories = useGetSupportOnlyCategoriesQuery()
   const [createTicket, createResult] = useCreateSupportOnlyTicketMutation()
   const [subject, setSubject] = useState("")
   const [description, setDescription] = useState("")
   const [categoryId, setCategoryId] = useState("")
   const [fieldError, setFieldError] = useState("")

   const submit = async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      setFieldError("")
      const parsed = createSupportRequestSchema.safeParse({
         subject,
         description,
         categoryId
      })
      if (!parsed.success) {
         setFieldError(parsed.error.issues[0]?.message ?? "Check the request details.")
         return
      }
      try {
         const result = await createTicket(parsed.data).unwrap()
         navigate(`/support-only/requests/${result.data.id}`, { replace: true })
      } catch {
         return
      }
   }

   return (
      <Box className="mx-auto max-w-3xl">
         <Button
            component={Link}
            to="/support-only"
            className="mb-4 normal-case">
            Back to requests
         </Button>
         <Box className="bg-surface border-border rounded-xl border p-6 sm:p-8">
            <Typography
               component="h2"
               variant="h5"
               className="text-content font-bold">
               Create Support Request
            </Typography>
            <Typography className="text-muted mt-1 text-sm">
               Describe the issue with your account.
            </Typography>
            {fieldError && (
               <Alert
                  severity="error"
                  className="mt-4">
                  {fieldError}
               </Alert>
            )}
            {createResult.isError && (
               <Alert
                  severity="error"
                  className="mt-4">
                  {errorText(createResult.error)}
               </Alert>
            )}
            <Box
               component="form"
               onSubmit={event => void submit(event)}
               className="mt-5 space-y-4">
               <TextField
                  fullWidth
                  required
                  label="Subject"
                  value={subject}
                  onChange={event => setSubject(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 160 } }}
               />
               <FormControl
                  fullWidth
                  required>
                  <InputLabel id="support-only-category">Category</InputLabel>
                  <Select
                     labelId="support-only-category"
                     label="Category"
                     value={categoryId}
                     onChange={event => setCategoryId(event.target.value)}
                     disabled={categories.isLoading}>
                     {(categories.data?.data ?? []).map(category => (
                        <MenuItem
                           key={category.id}
                           value={category.id}>
                           {category.name}
                        </MenuItem>
                     ))}
                  </Select>
               </FormControl>
               {categories.isError && (
                  <Alert severity="error">Support categories could not be loaded.</Alert>
               )}
               <TextField
                  fullWidth
                  required
                  multiline
                  minRows={6}
                  label="Description"
                  value={description}
                  onChange={event => setDescription(event.target.value)}
                  slotProps={{ htmlInput: { maxLength: 10000 } }}
               />
               <Button
                  type="submit"
                  variant="contained"
                  disabled={
                     createResult.isLoading ||
                     categories.isLoading ||
                     !categories.data?.data.length
                  }>
                  {createResult.isLoading ? (
                     <CircularProgress
                        size={20}
                        color="inherit"
                     />
                  ) : (
                     "Submit request"
                  )}
               </Button>
            </Box>
         </Box>
      </Box>
   )
}
