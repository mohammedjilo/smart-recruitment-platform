export type AdminProfile = {
   id: string
   firstName: string
   lastName: string
   email: string
   phone: string
   country: string
   countryCode: string | null
   state: string | null
   stateCode: string | null
   city: string | null
   cityGeonameId: number | null
   profilePicId: string | null
   profilePicUrl: string | null
   role: "ADMIN"
   adminRoleNames: string[]
}

export type AdminProfileResponse = {
   status: string
   data: AdminProfile
}

export type AdminProfileUpdateArgs = Partial<
   Pick<
      AdminProfile,
      | "firstName"
      | "lastName"
      | "phone"
      | "country"
      | "countryCode"
      | "state"
      | "stateCode"
      | "city"
      | "cityGeonameId"
   >
>

export type AdminProfileUpdateResult = {
   status: string
   message?: string
   data: AdminProfile
}
