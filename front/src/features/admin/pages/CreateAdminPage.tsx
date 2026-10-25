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
            className="normal-case!"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/admin/admins")}>
            Back to Admin Management
         </Button>
         <Box>
            <Typography className="text-content! text-2xl! font-bold!">
               Create Admin
            </Typography>
            <Typography className="mt-1! text-sm!" color="textSecondary">
               Create an administrative account with a managed role. Admin accounts do not
               receive candidate profiles.
            </Typography>
         </Box>

         <FormErrorAlert message={errorMessage} />

         <form
            className="border-border bg-surface space-y-5 rounded-xl border p-6"
            onSubmit={handleSubmit(onSubmit)}>
            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
               <TextField
                  {...register("firstName")}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName?.message}
                  label="First name"
               />
               <TextField
                  {...register("lastName")}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName?.message}
                  label="Last name"
               />
               <TextField
                  {...register("email")}
                  type="email"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                  label="Email"
               />
               <TextField
                  {...register("password")}
                  type="password"
                  error={Boolean(errors.password)}
                  helperText="Invitation email is not configured in this project yet."
                  label="Initial password"
               />
               <TextField
                  {...register("phone")}
                  error={Boolean(errors.phone)}
                  helperText={errors.phone?.message}
                  label="Phone"
               />
               <TextField
                  {...register("country")}
                  error={Boolean(errors.country)}
                  helperText={errors.country?.message}
                  label="Country"
               />
            </Box>

            <FormControl
               error={Boolean(errors.roleName)}
               fullWidth>
               <InputLabel>Admin role</InputLabel>
               <Select
                  {...register("roleName")}
                  defaultValue={defaultValues.roleName}
                  disabled={isLoadingRoles}
                  label="Admin role">
                  {isLoadingRoles ? (
                     <MenuItem
                        disabled
                        value="LOADING">
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
               <Typography className="text-xs! font-semibold! uppercase!" color="textSecondary">
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
                  className="normal-case!"
                  type="button"
                  onClick={() => navigate("/admin/admins")}>
                  Cancel
               </Button>
               <Button
                  className="normal-case!"
                  type="submit"
                  disabled={isLoading || isLoadingRoles}
                  variant="contained">
                  {isLoading ? "Creating..." : "Create Admin"}
               </Button>
            </Box>
         </form>
      </Box>
   )
}
