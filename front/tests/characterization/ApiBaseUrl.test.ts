import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { createApiMock, fetchBaseQueryMock } = vi.hoisted(() => ({
   createApiMock: vi.fn(() => ({ util: { resetApiState: vi.fn() } })),
   fetchBaseQueryMock: vi.fn(() => vi.fn())
}))

vi.mock("@reduxjs/toolkit/query/react", () => ({
   createApi: createApiMock,
   fetchBaseQuery: fetchBaseQueryMock
}))

vi.mock("@/services/api/requestReliability", () => ({
   createReliableBaseQuery: ({ execute }: { execute: (...args: unknown[]) => unknown }) =>
      execute,
   interpretRefreshResult: vi.fn()
}))

vi.mock("@/redux/slices/authSlice", () => ({
   authActions: { logout: vi.fn(), setToken: vi.fn() }
}))

vi.mock("@/utils/apiError", () => ({
   normalizeApiError: vi.fn()
}))

describe("API base URL configuration", () => {
   beforeEach(() => {
      vi.resetModules()
      vi.clearAllMocks()
   })

   afterEach(() => {
      vi.unstubAllEnvs()
   })

   it("uses VITE_API_BASE_URL when supplied", async () => {
      vi.stubEnv("VITE_API_BASE_URL", "https://api.example.test")

      await import("@/services/api/baseApi")

      expect(fetchBaseQueryMock).toHaveBeenCalledWith(
         expect.objectContaining({
            baseUrl: "https://api.example.test",
            timeout: 30_000,
            credentials: "include"
         })
      )
   })

   it("uses the existing local API address in tests without requiring a backend", async () => {
      await import("@/services/api/baseApi")

      expect(fetchBaseQueryMock).toHaveBeenCalledWith(
         expect.objectContaining({
            baseUrl: "http://localhost:3000"
         })
      )
   })

   it("fails clearly when a production build has no API base URL", async () => {
      vi.stubEnv("DEV", false)
      vi.stubEnv("MODE", "production")

      await expect(import("@/services/api/baseApi")).rejects.toThrow(
         "VITE_API_BASE_URL is required outside development and tests."
      )
   })
})
