import React, { useEffect } from "react"
import {
   Box,
   TextField,
   Button,
   Typography,
   Avatar,
   FormControl,
   Paper,
   RadioGroup,
   FormLabel,
   FormControlLabel,
   Radio
} from "@mui/material"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuthLoginMutation } from "@/features/auth/services/authApiCalls"
import { getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { useSelector } from "react-redux"
import FormErrorAlert from "@/components/common/FormErrorAlert"
import { applyApiFieldErrors } from "@/utils/formErrors"
import type { RootState } from "@/redux/store"
import CustomCard from "@/components/common/CustomCard"
import { BusinessOutlined, PersonOutlineOutlined } from "@mui/icons-material"
import { loginSchema, type LoginFormValues } from "@/schema/auth"
import { useAppDispatch } from "@/redux/store"
import { authActions } from "@/redux/slices/authSlice"

const Login: React.FC = () => {
   const navigate = useNavigate()
   const dispatch = useAppDispatch()
   const user = useSelector((state: RootState) => state.auth.user)
   const company = useSelector((state: RootState) => state.auth.company)

   const {
      control,
      handleSubmit,
      register,
      setError,
      formState: { errors }
   } = useForm<LoginFormValues>({
      resolver: zodResolver(loginSchema),

      defaultValues: {
         email: "",
         password: "",
         role: "user"
      }
   })
   const [authLogin, mutationResult] = useAuthLoginMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, { surface: "form" })
   const isLoading = mutationPresentation.category === "loading"
   const errorMessage =
      mutationPresentation.category === "field_error" ||
      mutationPresentation.category === "form_error" ||
      mutationPresentation.category === "authentication_notice" ||
      mutationPresentation.category === "access_denied" ||
      mutationPresentation.category === "resource_not_found"
         ? mutationPresentation.message
         : null
   const location = useLocation()
   const from = location.state?.from?.pathname

   const onSubmit = async (data: LoginFormValues) => {
      try {
         const result = await authLogin(data).unwrap()

         if ("registrationStatus" in result.data) {
            dispatch(authActions.setCompanyRegistrationReview(result.data))
            navigate(
               result.data.registrationStatus === "PENDING"
                  ? "/company/registration/pending"
                  : "/company/registration/rejected",
               { replace: true }
            )
            return
         }

         if (from) {
            navigate(from, { replace: true })
            return
         }

         if ("user" in result.data && result.data.user.role === "ADMIN") {
            navigate("/admin", { replace: true })
            return
         }

         if ("user" in result.data) {
            navigate("/profile/complete", { replace: true })
            return
         }

         if ("company" in result.data) {
            navigate("/dashboard", { replace: true })
            return
         }
      } catch (error) {
         applyApiFieldErrors(error, setError)
      }
   }

   useEffect(() => {
      if (!user && !company) return

      const destination = from ?? (user?.role === "ADMIN" ? "/admin" : "/dashboard")
      navigate(destination, { replace: true })
   }, [user, company, from, navigate])
   return (
      <Box className="flex min-h-screen items-center justify-center">
         <CustomCard>
            <form onSubmit={handleSubmit(onSubmit)}>
               <Box className="mb-6 flex flex-col items-center">
                  <Avatar sx={{ width: 64, height: 64 }} />
                  <Typography
                     variant="h5"
                     className="mt-3">
                     Login{" "}
                  </Typography>
               </Box>
               <FormErrorAlert
                  message={errorMessage}
               />
               <Controller
                  name="role"
                  control={control}
                  defaultValue="user"
                  render={({ field }) => (
                     <FormControl fullWidth>
                        <FormLabel>Login as</FormLabel>

                        <RadioGroup
                           className="grid! grid-cols-2! gap-2!"
                           {...field}>
                           {/* User */}

                           <Paper
                              className={`hover:border-mui-purple! col-span-1! rounded-sm! border-2! transition-all! ${field.value === "user" ? "border-mui-purple!" : "border-mui-blue-50!"}`}
                              variant="outlined">
                              <FormControlLabel
                                 className="w-full px-2.5 py-3.5"
                                 value="user"
                                 control={
                                    <Radio
                                       sx={{
                                          "&.Mui-checked": {
                                             color: "#6C3CF0"
                                          }
                                       }}
                                    />
                                 }
                                 label={
                                    <Box className="flex items-center gap-2">
                                       <PersonOutlineOutlined />
                                       <Typography>User</Typography>
                                    </Box>
                                 }
                              />
                           </Paper>

                           {/* Company */}

                           <Paper
                              className={`hover:border-mui-blue-300! col-span-1! rounded-sm! border-2! transition-all! ${field.value === "company" ? "border-mui-blue-300!" : "border-mui-blue-50!"}`}

                              variant="outlined">
                              <FormControlLabel
                                 className="w-full px-2.5 py-3.5"

                                 value="company"
                                 control={
                                    <Radio
                                       sx={{
                                          "&.Mui-checked": {
                                             color: "#64b5f6"
                                          }
                                       }}
                                    />
                                 }
                                 label={
                                    <Box className="flex items-center gap-2">
                                       <BusinessOutlined />
                                       <Typography>Company</Typography>
                                    </Box>
                                 }
                              />
                           </Paper>
                        </RadioGroup>
                        {errors.role && (
                           <Typography
                              color="error"
                              variant="caption"
                              sx={{ mt: 1 }}>
                              {errors.role?.message as string}
                           </Typography>
                        )}
                     </FormControl>
                  )}
               />
               <TextField
                  {...register("email")}
                  label="Email"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
               />

               <TextField
                  {...register("password")}
                  label="Password"
                  type="password"
                  fullWidth
                  margin="normal"
                  error={Boolean(errors.password)}
                  helperText={errors.password?.message}
               />
               <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  className="mt-4 capitalize!"
                  disabled={isLoading}>
                  {isLoading ? "Loading..." : "Login"}
               </Button>

               <Typography
                  className="mt-4! place-self-center!"
                  variant="body2">
                  Don't have an account?{" "}
                  <Link
                     to="/register"
                     className="hover:text-mui-blue-800 text-mui-blue-600 underline">
                     Register
                  </Link>
               </Typography>
            </form>
         </CustomCard>
      </Box>
   )
}

export default Login
