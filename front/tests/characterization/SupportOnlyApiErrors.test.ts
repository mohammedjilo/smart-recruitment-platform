import { afterEach, describe, expect, it, vi } from "vitest"
import {
   verifySupportOnlyCredentials
} from "@/services/api/supportOnlyApi"

const credentials = {
   role: "user" as const,
   email: "user@example.test",
   password: "valid-password"
}

describe("support-only credential verification errors", () => {
   afterEach(() => {
      vi.unstubAllGlobals()
   })

   it("keeps the expected invalid-credentials response understandable", async () => {
      vi.stubGlobal(
         "fetch",
         vi.fn().mockResolvedValue(
            new Response(
               JSON.stringify({
                  success: false,
                  error: { code: "UNAUTHORIZED", message: "Invalid email or password" }
               }),
               { status: 401, headers: { "Content-Type": "application/json" } }
            )
         )
      )

      await expect(verifySupportOnlyCredentials(credentials)).rejects.toMatchObject({
         name: "SupportOnlyAccessError",
         message: "Invalid email or password."
      })
   })

   it.each([
      [403, "Support-only access is not available for this account."],
      [429, "Too many attempts. Please try again later."]
   ])("uses a safe message for expected HTTP %i responses", async (status, message) => {
      vi.stubGlobal(
         "fetch",
         vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ success: false }), { status })
         )
      )

      await expect(verifySupportOnlyCredentials(credentials)).rejects.toMatchObject({
         name: "SupportOnlyAccessError",
         message
      })
   })

   it("does not expose arbitrary server messages for unexpected responses", async () => {
      vi.stubGlobal(
         "fetch",
         vi.fn().mockResolvedValue(
            new Response(
               JSON.stringify({
                  success: false,
                  error: {
                     code: "INTERNAL_ERROR",
                     message: "Database password=internal-value"
                  }
               }),
               { status: 500, headers: { "Content-Type": "application/json" } }
            )
         )
      )

      await expect(verifySupportOnlyCredentials(credentials)).rejects.toMatchObject({
         name: "SupportOnlyAccessError",
         message: "Something went wrong. Please try again later."
      })
   })

   it("uses safe generic errors for invalid JSON and invalid successful responses", async () => {
      vi.stubGlobal(
         "fetch",
         vi.fn()
            .mockResolvedValueOnce(new Response("{invalid-json", { status: 200 }))
            .mockResolvedValueOnce(
               new Response(JSON.stringify({ success: true, data: { mode: "unknown" } }), {
                  status: 200
               })
            )
      )

      await expect(verifySupportOnlyCredentials(credentials)).rejects.toMatchObject({
         name: "SupportOnlyAccessError",
         message: "Credentials could not be verified."
      })
      await expect(verifySupportOnlyCredentials(credentials)).rejects.toMatchObject({
         name: "SupportOnlyAccessError",
         message: "Credentials could not be verified."
      })
   })

   it("normalizes network failures instead of exposing transport details", async () => {
      vi.stubGlobal(
         "fetch",
         vi.fn().mockRejectedValue(new Error("fetch failed with internal transport detail"))
      )

      await expect(verifySupportOnlyCredentials(credentials)).rejects.toMatchObject({
         name: "SupportOnlyAccessError",
         message: "Unable to connect to the server. Please try again."
      })
   })

   it("returns only the validated support-access response shape", async () => {
      vi.stubGlobal(
         "fetch",
         vi.fn().mockResolvedValue(
            new Response(
               JSON.stringify({ success: true, data: { mode: "active" } }),
               { status: 200, headers: { "Content-Type": "application/json" } }
            )
         )
      )

      await expect(verifySupportOnlyCredentials(credentials)).resolves.toEqual({
         success: true,
         data: { mode: "active" }
      })
   })
})
