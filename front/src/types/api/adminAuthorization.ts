export type AdminSummary = {
   id: string
   firstName: string
   lastName: string
   email: string
   profilePicUrl: string | null
   accountStatus: "ACTIVE" | "DEACTIVATED"
   role: "USER" | "ADMIN"
   createdAt: string
   updatedAt: string
   adminRoleAssignments: Array<{
      adminRole: { name: string }
   }>
}

export type AdminSummariesResponse = {
   status: string
   data: AdminSummary[]
}

export type AdminAuthorizationResponse = {
   status: string
   data: AdminSummary & { permissions: string[] }
}

export type AdminSummaryResponse = {
   status: string
   data: AdminSummary
}

export type AdminRoleSummary = {
   id: string
   name: string
   description: string | null
   permissions: Array<{
      permission: {
         code: string
         resource: string
         action: string
      }
   }>
}

export type AdminRolesResponse = {
   status: string
   data: AdminRoleSummary[]
}

export type AssignAdminRoleArgs = {
   userId: string
   roleName: "SUPER_ADMIN" | "SUPPORT_ADMIN" | "OPERATIONS_ADMIN" | "DEMO_ADMIN"
}

export type UpdateAdminStatusArgs = {
   userId: string
   status: "ACTIVE" | "DEACTIVATED"
}

export type CreateAdminArgs = {
   firstName: string
   lastName: string
   email: string
   password: string
   phone: string
   country: string
   countryCode: string
   state?: string
   stateCode?: string
   city: string
   cityGeonameId: number
   roleName: "SUPER_ADMIN" | "SUPPORT_ADMIN" | "OPERATIONS_ADMIN"
}

export type CreateAdminResponse = {
   status: string
   message: string
   data: AdminSummary
}
