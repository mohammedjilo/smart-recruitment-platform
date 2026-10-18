import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "node:path"
import { fileURLToPath } from "node:url"

export default defineConfig({
   plugins: [react()],
   resolve: {
      alias: {
         "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "src")
      }
   },
   test: {
      environment: "jsdom",
      setupFiles: ["./tests/characterization/setup.ts"],
      include: ["tests/characterization/**/*.test.{ts,tsx}"],
      testTimeout: 15_000,
      clearMocks: true,
      restoreMocks: true
   }
})
