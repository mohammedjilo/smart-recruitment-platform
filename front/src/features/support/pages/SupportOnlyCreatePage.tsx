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
            className="mb-4 normal-case"
            component={Link}
            to="/support-only">
            Back to requests
         </Button>
         <Box className="bg-surface border-border rounded-xl border p-6 sm:p-8">
            <Typography
               className="text-content font-bold"
               component="h2"
               variant="h5">
               Create Support Request
            </Typography>
            <Typography className="text-muted mt-1 text-sm">
               Describe the issue with your account.
            </Typography>
            {fieldError && (
               <Alert
                  className="mt-4"
                  severity="error">
                  {fieldError}
               </Alert>
            )}
            {createResult.isError && (
               <Alert
                  className="mt-4"
                  severity="error">
                  {errorText(createResult.error)}
               </Alert>
            )}
            <Box
               className="mt-5 space-y-4"
               component="form"
               onSubmit={event => void submit(event)}>
               <TextField
                  required
                  value={subject}
                  fullWidth
                  label="Subject"
                  slotProps={{ htmlInput: { maxLength: 160 } }}
                  onChange={event => setSubject(event.target.value)}
               />
               <FormControl
                  required
                  fullWidth>
                  <InputLabel id="support-only-category">Category</InputLabel>
                  <Select
                     disabled={categories.isLoading}
                     value={categoryId}
                     label="Category"
                     labelId="support-only-category"
                     onChange={event => setCategoryId(event.target.value)}>
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
                  required
                  value={description}
                  fullWidth
                  label="Description"
                  minRows={6}
                  multiline
                  slotProps={{ htmlInput: { maxLength: 10000 } }}
                  onChange={event => setDescription(event.target.value)}
               />
               <Button
                  type="submit"
                  disabled={
                     createResult.isLoading ||
                     categories.isLoading ||
                     !categories.data?.data.length
                  }
                  variant="contained">
                  {createResult.isLoading ? (
                     <CircularProgress
                        color="inherit"
                        size={20}
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
