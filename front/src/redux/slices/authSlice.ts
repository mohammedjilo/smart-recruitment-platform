import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "@/redux/store"
import { ADMIN_PERMISSIONS, type AdminPermission } from "@/types/adminPermissions"
import type { CompanyApprovalStatus } from "@/types/common/enums"
import type { CompanyRegistrationStatusResponse } from "@/types/auth"

type UserInfo = {
   id: string
   firstName: string
   lastName: string
   email: string
   profilePicUrl: string
   role: "USER" | "ADMIN"
   permissions?: AdminPermission[]
}

type CompanyInfo = {
   id: string
   companyName: string
   email: string
   logoUrl: string
   role: "company"
   approvalStatus: CompanyApprovalStatus
}

type AuthState = {
   user: UserInfo | null
   company: CompanyInfo | null
   token: string | null
   permissions: AdminPermission[]
   companyRegistrationReview: CompanyRegistrationStatusResponse | null
}

type LoginPayload = {
   user?: UserInfo
   company?: CompanyInfo
   token: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
   typeof value === "object" && value !== null && !Array.isArray(value)

const isString = (value: unknown): value is string => typeof value === "string"

const isNullableString = (value: unknown): value is string | null =>
   value === null || isString(value)

const isAdminPermission = (value: unknown): value is AdminPermission =>
   Object.values(ADMIN_PERMISSIONS).some(permission => permission === value)

const isUserInfo = (value: unknown): value is UserInfo =>
   isRecord(value) &&
   isString(value.id) &&
   isString(value.firstName) &&
   isString(value.lastName) &&
   isString(value.email) &&
   isString(value.profilePicUrl) &&
   (value.role === "USER" || value.role === "ADMIN") &&
   (value.permissions === undefined ||
      (Array.isArray(value.permissions) && value.permissions.every(isAdminPermission)))

const isCompanyInfo = (
   value: unknown
): value is Omit<CompanyInfo, "approvalStatus"> & {
   approvalStatus?: CompanyApprovalStatus
} =>
   isRecord(value) &&
   isString(value.id) &&
   isString(value.companyName) &&
   isString(value.email) &&
   isString(value.logoUrl) &&
   value.role === "company" &&
   (value.approvalStatus === undefined ||
      value.approvalStatus === "PENDING" ||
      value.approvalStatus === "APPROVED" ||
      value.approvalStatus === "REJECTED")

const isCompanyRegistrationReview = (
   value: unknown
): value is CompanyRegistrationStatusResponse => {
   if (
      !isRecord(value) ||
      (value.registrationStatus !== "PENDING" &&
         value.registrationStatus !== "REJECTED") ||
      (value.resubmitted !== undefined && typeof value.resubmitted !== "boolean") ||
      !isRecord(value.company)
   ) {
      return false
   }

   const company = value.company
   return (
      isString(company.id) &&
      isString(company.companyName) &&
      isString(company.slug) &&
      isNullableString(company.description) &&
      isString(company.email) &&
      isString(company.phone) &&
      isNullableString(company.country) &&
      isNullableString(company.countryCode) &&
      isNullableString(company.state) &&
      isNullableString(company.stateCode) &&
      isNullableString(company.city) &&
      (company.cityGeonameId === null || typeof company.cityGeonameId === "number") &&
      isNullableString(company.logoUrl) &&
      isNullableString(company.website) &&
      isNullableString(company.location) &&
      isNullableString(company.rejectionReason) &&
      isNullableString(company.reviewedAt) &&
      isString(company.submittedAt)
   )
}

const readStoredValue = (key: string): unknown => {
   try {
      if (typeof window === "undefined") return undefined
      const storedValue = window.localStorage.getItem(key)
      return storedValue === null ? undefined : JSON.parse(storedValue)
   } catch {
      return undefined
   }
}

const storedUser = readStoredValue("userInfo")
const storedCompany = readStoredValue("companyInfo")
const storedToken = (() => {
   try {
      return typeof window === "undefined"
         ? null
         : window.localStorage.getItem("token")
   } catch {
      return null
   }
})()
const storedCompanyRegistrationReview = readStoredValue("companyRegistrationReview")
const validUser = isUserInfo(storedUser) ? storedUser : null
const validCompany = isCompanyInfo(storedCompany) ? storedCompany : null
const hasConflictingAccounts = Boolean(validUser && validCompany)
const user = hasConflictingAccounts ? null : validUser
const company =
   hasConflictingAccounts || !validCompany
      ? null
      : {
           ...validCompany,
           approvalStatus: validCompany.approvalStatus ?? "APPROVED"
        }

const initialState: AuthState = {
   user,
   company,
   token: hasConflictingAccounts ? null : storedToken,
   permissions: user?.permissions ?? [],
   companyRegistrationReview:
      user || company || hasConflictingAccounts
         ? null
         : isCompanyRegistrationReview(storedCompanyRegistrationReview)
           ? storedCompanyRegistrationReview
           : null
}

const authSlice = createSlice({
   name: "auth",
   initialState,
   reducers: {
      login(state, action: PayloadAction<LoginPayload>) {
         state.companyRegistrationReview = null
         localStorage.removeItem("companyRegistrationReview")
         if (action.payload.user) {
            state.user = action.payload.user
            state.company = null
            state.permissions = action.payload.user.permissions ?? []
            localStorage.setItem("userInfo", JSON.stringify(action.payload.user))
            localStorage.removeItem("companyInfo")
         }
         if (action.payload.company) {
            state.company = action.payload.company
            state.user = null
            state.permissions = []
            localStorage.setItem("companyInfo", JSON.stringify(action.payload.company))
            localStorage.removeItem("userInfo")
         }
         state.token = action.payload.token
         if (action.payload.token) localStorage.setItem("token", action.payload.token)
      },
      setCompanyRegistrationReview(
         state,
         action: PayloadAction<CompanyRegistrationStatusResponse>
      ) {
         state.user = null
         state.company = null
         state.token = null
         state.permissions = []
         state.companyRegistrationReview = action.payload
         localStorage.removeItem("userInfo")
         localStorage.removeItem("companyInfo")
         localStorage.removeItem("token")
         localStorage.setItem(
            "companyRegistrationReview",
            JSON.stringify(action.payload)
         )
      },
      setToken(state, action: PayloadAction<string | null>) {
         state.token = action.payload
         if (action.payload) localStorage.setItem("token", action.payload)
         else localStorage.removeItem("token")
      },
      setPermissions(state, action: PayloadAction<AdminPermission[]>) {
         state.permissions = action.payload
         if (state.user) {
            state.user.permissions = action.payload
            localStorage.setItem("userInfo", JSON.stringify(state.user))
         }
      },
      updateUser(state, action: PayloadAction<Partial<UserInfo> | Partial<CompanyInfo>>) {
         if ("companyName" in action.payload) {
            const payload = action.payload as Partial<CompanyInfo>
            if (state.company && payload.id === state.company.id) {
               state.company.companyName =
                  payload.companyName ?? state.company.companyName
               state.company.email = payload.email ?? state.company.email
               state.company.logoUrl = payload.logoUrl ?? ""
               localStorage.setItem("companyInfo", JSON.stringify(state.company))
            }
            return
         }
         if (state.user) {
            const payload = action.payload as Partial<Record<string, any>>
            Object.keys(payload).forEach(key => {
               const val = payload[key as keyof typeof payload]
               if (val !== undefined) (state.user as any)[key] = val
            })
         }
      },
      logout(state) {
         state.user = null
         state.company = null
         state.token = null
         state.permissions = []
         state.companyRegistrationReview = null
         localStorage.removeItem("userInfo")
         localStorage.removeItem("companyInfo")
         localStorage.removeItem("token")
         localStorage.removeItem("companyRegistrationReview")
      }
   }
})
export const selectUserState = (state: RootState) => state.auth.user
export const selectCompanyState = (state: RootState) => state.auth.company
export const selectTokenState = (state: RootState) => state.auth.token
export const selectAdminPermissions = (state: RootState) => state.auth.permissions

const authReducer = authSlice.reducer
const authActions = authSlice.actions
export { authActions, authReducer }
