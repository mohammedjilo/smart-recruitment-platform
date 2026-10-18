import type {
   LoginBody,
   LoginResult,
   RegisterResult,
   RegisterCompanyBody,
   RegisterUserBody
} from "@/types/api/auth"
import { clearSessionAndApiState, smartApi } from "@/services/api/baseApi"
import { authActions } from "@/redux/slices/authSlice"

const extendedSmartApi = smartApi.injectEndpoints({
   endpoints: builder => ({
      authLogin: builder.mutation<LoginResult, LoginBody>({
         query: data => ({
            url: "/api/auth/login",
            method: "POST",
            body: data
         }),

         async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
            try {
               const { data } = await queryFulfilled
               const loginData = data.data
               if ("registrationStatus" in loginData) {
                  await dispatch(authActions.setCompanyRegistrationReview(loginData))
                  return
               }

               const accessToken = loginData.token

               //   if (accessToken) {
               //     await dispatch(authActions.setToken(accessToken));
               //   }
               if ("user" in loginData) {
                  const userInfo = {
                     id: loginData.user.id,
                     role: loginData.user.role,
                     firstName: loginData.user.firstName,
                     lastName: loginData.user.lastName,
                     email: loginData.user.email,
                     profilePicUrl: loginData.user.profilePicUrl ?? ""
                  }
                  await dispatch(
                     authActions.login({
                        user: userInfo,
                        token: accessToken
                     })
                  )
               } else if ("company" in loginData) {
                  const companyInfo = {
                     id: loginData.company.id,
                     role: "company" as const,
                     companyName: loginData.company.companyName,
                     email: loginData.company.email,
                     logoUrl: loginData.company.logoUrl ?? "",
                     approvalStatus: loginData.company.approvalStatus
                  }
                  await dispatch(
                     authActions.login({
                        company: companyInfo,
                        token: accessToken
                     })
                  )
               }
            } catch {}
         }
      }),
      registerUser: builder.mutation<RegisterResult, RegisterUserBody>({
         query: data => {
            const formData = new FormData()
            formData.append("firstName", data.firstName)
            formData.append("lastName", data.lastName)
            formData.append("email", data.email)
            formData.append("password", data.password)
            formData.append("country", data.country)
            formData.append("countryCode", data.countryCode)
            formData.append("state", data.state ?? "")
            formData.append("stateCode", data.stateCode ?? "")
            formData.append("city", data.city)
            formData.append("cityGeonameId", String(data.cityGeonameId))
            formData.append("birthdate", data.birthdate)
            formData.append("phone", data.phone)
            formData.append("role", data.role)
            if (data.image) {
               formData.append("image", data.image, data.image.name)
            }
            return {
               url: "/api/auth/register",
               method: "POST",
               body: formData
            }
         }
      }),
      registerCompany: builder.mutation<RegisterResult, RegisterCompanyBody>({
         query: data => {
            const formData = new FormData()
            formData.append("companyName", data.companyName)
            formData.append("email", data.email)
            formData.append("password", data.password)
            formData.append("phone", data.phone)
            formData.append("role", data.role) // 'company'
            formData.append("country", data.country)
            formData.append("countryCode", data.countryCode)
            formData.append("state", data.state ?? "")
            formData.append("stateCode", data.stateCode ?? "")
            formData.append("city", data.city)
            formData.append("cityGeonameId", String(data.cityGeonameId))

            if (data.description) {
               formData.append("description", data.description)
            }
            if (data.location) {
               formData.append("location", data.location)
            }
            if (data.website && data.website.trim() !== "") {
               formData.append("website", data.website)
            }

            if (data.logo) {
               formData.append("logo", data.logo, data.logo.name)
            }
            return {
               url: "/api/auth/register",
               method: "POST",
               body: formData
            }
         }
      }),
      authLogOut: builder.mutation({
         query: () => ({
            url: "/api/auth/logout",
            method: "POST"
         }),
         async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
            try {
               await queryFulfilled
            } catch {
            } finally {
               clearSessionAndApiState(dispatch)
            }
         }
      })
   })
})
export const {
   useAuthLoginMutation,
   useRegisterUserMutation,
   useRegisterCompanyMutation,
   useAuthLogOutMutation
} = extendedSmartApi
export { extendedSmartApi as smartApi }
