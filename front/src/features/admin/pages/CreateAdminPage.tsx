import { useNavigate } from "react-router-dom"
import {
   Box,
   Button,
   FormControl,
   FormHelperText,
   InputLabel,
   MenuItem,
   Select,
   Skeleton,
   TextField,
   Typography
} from "@mui/material"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import {
   useCreateAdminMutation,
   useGetAdminRolesQuery
} from "@/features/admin/services/adminApiCalls"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { createAdminSchema, type CreateAdminFormValues } from "@/schema/admin"
import FormErrorAlert from "@/components/common/FormErrorAlert"
import { applyApiFieldErrors } from "@/utils/formErrors"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

const defaultValues: CreateAdminFormValues = {
   firstName: "",
   lastName: "",
   email: "",
   password: "",
   phone: "",
   country: "",
   roleName: "SUPPORT_ADMIN"
}

export default function CreateAdminPage() {
   const navigate = useNavigate()
   const [createAdmin, mutationResult] = useCreateAdminMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, { surface: "form" })
   const isLoading = mutationPresentation.category === "loading"
   const { data: rolesData, isLoading: isLoadingRoles } = useGetAdminRolesQuery()
   const {
      register,
      handleSubmit,
      setError,
      watch,
      formState: { errors }
   } = useForm<CreateAdminFormValues>({
      resolver: zodResolver(createAdminSchema),
      defaultValues,
      mode: "onSubmit",
      reValidateMode: "onChange",
      shouldFocusError: true
   })
   const selectedRole = rolesData?.data.find(role => role.name === watch("roleName"))

   const onSubmit = async (form: CreateAdminFormValues) => {
      try {
         await createAdmin(form).unwrap()
         navigate("/admin/admins")
      } catch (error) {
         applyApiFieldErrors(error, setError)
      }
   }

   const errorMessage =
      mutationPresentation.category === "field_error" ||
      mutationPresentation.category === "form_error" ||
      mutationPresentation.category === "authentication_notice" ||
      mutationPresentation.category === "access_denied" ||
      mutationPresentation.category === "resource_not_found"
         ? mutationPresentation.message
         : null

   return (
      <Box className="max-w-3xl space-y-5">
         <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/admin/admins")}
            className="normal-case!">
            Back to Admin Management
         </Button>
         <Box>
            <Typography className="text-content! text-2xl! font-bold!">
               Create Admin
            </Typography>
            <Typography className="text-muted! mt-1! text-sm!">
               Create an administrative account with a managed role. Admin accounts do not
               receive candidate profiles.
            </Typography>
         </Box>

         <FormErrorAlert message={errorMessage} />

         <form
            onSubmit={handleSubmit(onSubmit)}
            className="border-border bg-surface space-y-5 rounded-xl border p-6">
            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <TextField
                  {...register("firstName")}
                  label="First name"
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName?.message}
               />
               <TextField
                  {...register("lastName")}
                  label="Last name"
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName?.message}
               />
               <TextField
                  {...register("email")}
                  type="email"
                  label="Email"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
               />
               <TextField
                  {...register("password")}
                  type="password"
                  label="Initial password"
                  helperText="Invitation email is not configured in this project yet."
                  error={Boolean(errors.password)}
               />
               <TextField
                  {...register("phone")}
                  label="Phone"
                  error={Boolean(errors.phone)}
                  helperText={errors.phone?.message}
               />
               <TextField
                  {...register("country")}
                  label="Country"
                  error={Boolean(errors.country)}
                  helperText={errors.country?.message}
               />
            </Box>

            <FormControl
               fullWidth
               error={Boolean(errors.roleName)}>
               <InputLabel>Admin role</InputLabel>
               <Select
                  {...register("roleName")}
                  label="Admin role"
                  disabled={isLoadingRoles}
                  defaultValue={defaultValues.roleName}>
                  {isLoadingRoles ? (
                     <MenuItem
                        value="LOADING"
                        disabled>
                        <Skeleton
                           variant="text"
                           width={120}
                        />
                     </MenuItem>
                  ) : (
                     (rolesData?.data ?? []).map(role => (
                        <MenuItem
                           key={role.id}
                           value={role.name}>
                           {role.name}
                        </MenuItem>
                     ))
                  )}
               </Select>
               {errors.roleName && (
                  <FormHelperText>{errors.roleName.message}</FormHelperText>
               )}
            </FormControl>

            <Box className="bg-bg rounded-lg p-4">
               <Typography className="text-muted! text-xs! font-semibold! uppercase!">
                  Permission summary
               </Typography>
               <Typography className="text-content! mt-2! text-sm!">
                  {selectedRole?.permissions
                     .map(item => item.permission.code)
                     .join(", ") || "Select a role to review its permissions."}
               </Typography>
            </Box>

            <Box className="flex justify-end gap-3">
               <Button
                  type="button"
                  onClick={() => navigate("/admin/admins")}
                  className="normal-case!">
                  Cancel
               </Button>
               <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || isLoadingRoles}
                  className="normal-case!">
                  {isLoading ? "Creating..." : "Create Admin"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}
