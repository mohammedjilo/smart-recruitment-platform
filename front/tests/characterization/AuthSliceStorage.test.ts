import { beforeEach, describe, expect, it, vi } from "vitest"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import type { CompanyRegistrationStatusResponse } from "@/types/auth"

const userInfo = {
   id: "user-1",
   firstName: "Ada",
   lastName: "Lovelace",
   email: "ada@example.test",
   profilePicUrl: "",
   role: "ADMIN",
   permissions: [ADMIN_PERMISSIONS.VIEW_USERS]
}

const companyInfo = {
   id: "company-1",
   companyName: "Analytical Engines",
   email: "company@example.test",
   logoUrl: "",
   role: "company",
   approvalStatus: "APPROVED"
}

const companyReview: CompanyRegistrationStatusResponse = {
   registrationStatus: "REJECTED",
   company: {
      id: "company-2",
      companyName: "Difference Engines",
      slug: "difference-engines",
      description: null,
      email: "review@example.test",
      phone: "1234567890",
      country: null,
      countryCode: null,
      state: null,
      stateCode: null,
      city: null,
      cityGeonameId: null,
      logoUrl: null,
      website: null,
      location: null,
      rejectionReason: "Please update the website.",
      reviewedAt: "2026-10-10T00:00:00.000Z",
      submittedAt: "2026-10-09T00:00:00.000Z"
   }
}

const loadAuthState = async () => {
   vi.resetModules()
   const { authReducer } = await import("@/redux/slices/authSlice")
   return authReducer(undefined, { type: "test/initialize" })
}

describe("auth state storage", () => {
   beforeEach(() => {
      localStorage.clear()
   })

   it("restores a valid saved user and its permissions", async () => {
      localStorage.setItem("userInfo", JSON.stringify(userInfo))
      localStorage.setItem("token", "saved-token")

      const state = await loadAuthState()

      expect(state.user).toEqual(userInfo)
      expect(state.company).toBeNull()
      expect(state.token).toBe("saved-token")
      expect(state.permissions).toEqual([ADMIN_PERMISSIONS.VIEW_USERS])
   })

   it("starts unauthenticated when saved keys are missing", async () => {
      const state = await loadAuthState()

      expect(state).toMatchObject({
         user: null,
         company: null,
         token: null,
         permissions: [],
         companyRegistrationReview: null
      })
   })

   it("does not throw during module import when stored JSON is malformed", async () => {
      localStorage.setItem("userInfo", "{malformed")
      localStorage.setItem("companyRegistrationReview", "{also-malformed")

      await expect(loadAuthState()).resolves.toMatchObject({
         user: null,
         company: null,
         companyRegistrationReview: null
      })
   })

   it("starts without persisted state when localStorage access is unavailable", async () => {
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
         throw new Error("Storage access is unavailable")
      })

      await expect(loadAuthState()).resolves.toMatchObject({
         user: null,
         company: null,
         token: null,
         permissions: [],
         companyRegistrationReview: null
      })
   })

   it("ignores valid JSON with an invalid shape without losing another valid account", async () => {
      localStorage.setItem("userInfo", JSON.stringify({ id: "not-a-user" }))
      localStorage.setItem("companyInfo", JSON.stringify(companyInfo))

      const state = await loadAuthState()

      expect(state.user).toBeNull()
      expect(state.company).toMatchObject({
         id: "company-1",
         role: "company",
         approvalStatus: "APPROVED"
      })
      expect(state.permissions).toEqual([])
   })

   it("does not combine saved user and company accounts", async () => {
      localStorage.setItem("userInfo", JSON.stringify(userInfo))
      localStorage.setItem("companyInfo", JSON.stringify(companyInfo))
      localStorage.setItem("token", "ambiguous-token")

      const state = await loadAuthState()

      expect(state.user).toBeNull()
      expect(state.company).toBeNull()
      expect(state.token).toBeNull()
      expect(state.permissions).toEqual([])
   })

   it("restores a valid company review when there is no authenticated account", async () => {
      localStorage.setItem("companyRegistrationReview", JSON.stringify(companyReview))

      const state = await loadAuthState()

      expect(state.companyRegistrationReview).toEqual(companyReview)
   })

   it("keeps a valid account when another stored key contains malformed JSON", async () => {
      localStorage.setItem("userInfo", JSON.stringify(userInfo))
      localStorage.setItem("companyInfo", "{malformed")
      localStorage.setItem("token", "saved-token")

      const state = await loadAuthState()

      expect(state.user).toEqual(userInfo)
      expect(state.company).toBeNull()
      expect(state.token).toBe("saved-token")
   })
})
