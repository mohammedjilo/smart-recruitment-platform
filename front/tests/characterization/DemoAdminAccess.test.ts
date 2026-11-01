import { describe, expect, it } from "vitest"
import { ADMIN_PERMISSIONS } from "@/types/adminPermissions"
import {
   hasAdminPermission,
   isDemoAdminPathAllowed,
   isDemoAdminPermissions
} from "@/features/admin/authorization/demoAdmin"

const demoPermissions = [
   ADMIN_PERMISSIONS.DEMO_ADMIN_READ_ONLY,
   ADMIN_PERMISSIONS.VIEW_ADMIN_DASHBOARD,
   ADMIN_PERMISSIONS.VIEW_COMPANIES,
   ADMIN_PERMISSIONS.VIEW_USERS,
   ADMIN_PERMISSIONS.VIEW_JOBS,
   ADMIN_PERMISSIONS.VIEW_APPLICATIONS,
   ADMIN_PERMISSIONS.VIEW_SUPPORT,
   ADMIN_PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
]

describe("Demo Admin frontend access policy", () => {
   it("recognizes the dedicated demo role marker", () => {
      expect(isDemoAdminPermissions(demoPermissions)).toBe(true)
      expect(isDemoAdminPermissions([ADMIN_PERMISSIONS.VIEW_USERS])).toBe(false)
   })

   it("grants read permissions without granting write permissions", () => {
      expect(
         hasAdminPermission(
            demoPermissions,
            ADMIN_PERMISSIONS.VIEW_COMPANIES
         )
      ).toBe(true)
      expect(
         hasAdminPermission(demoPermissions, ADMIN_PERMISSIONS.SUSPEND_USERS)
      ).toBe(false)
      expect(hasAdminPermission(demoPermissions, ADMIN_PERMISSIONS.VIEW_SUPPORT)).toBe(true)
   })

   it("allows only reviewed demo pages for direct navigation", () => {
      expect(isDemoAdminPathAllowed("/admin/dashboard")).toBe(true)
      expect(isDemoAdminPathAllowed("/admin/users/candidate-1")).toBe(true)
      expect(isDemoAdminPathAllowed("/admin/jobs/job-1/role")).toBe(true)
      expect(isDemoAdminPathAllowed("/admin/company-requests")).toBe(true)
      expect(isDemoAdminPathAllowed("/admin/support")).toBe(true)
      expect(isDemoAdminPathAllowed("/admin/notifications")).toBe(true)
      expect(isDemoAdminPathAllowed("/admin/admins")).toBe(false)
      expect(isDemoAdminPathAllowed("/admin/admins/admin-1")).toBe(false)
   })
})
