import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwind from "@tailwindcss/vite"
import path from "node:path"

export default defineConfig({
   plugins: [react(), tailwind()],
   preview: {
      allowedHosts: ["front-production-bc34.up.railway.app"]
   },
   build: {
      rolldownOptions: {
         output: {
            codeSplitting: {
               groups: [
                  {
                     name: "mui-icons",
                     test: /[**\\\\**/]@mui[**\\\\**/]icons-material[**\\\\**/]/
                  }
               ]
            }
         }
      }
   },
   resolve: {
      alias: {
         "@": path.resolve(import.meta.dirname, "src")
      }
   }
})
