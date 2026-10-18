import React from "react"

import { CheckCircleOutlined, FiberManualRecord } from "@mui/icons-material"
import { Box, Typography } from "@mui/material"
import type { CompanyApplication } from "@/types/application"

interface ApplicationAiInsightsProps {
   application: CompanyApplication
}

const ApplicationAiInsights: React.FC<ApplicationAiInsightsProps> = ({ application }) => {
   const strengths = normalizeArray(application.strengths)

   const missingSkills = normalizeArray(application.missingSkills)

   return (
      <Box className="mt-5 border-t border-border pt-5">
         <Box className="flex items-center justify-between gap-3">
            <Typography className="text-[12px]! font-semibold! text-[#172033]!">
               AI Recommendation
            </Typography>

            <span className="rounded-md bg-green-50 px-2 py-1 text-[9px] font-semibold text-green-600">
               AI Analysis
            </span>
         </Box>

         <Typography className="mt-3! text-[10px]! leading-5! text-muted!">
            {application.recommendation}
         </Typography>

         {strengths.length > 0 && (
            <Box className="mt-4">
               <Typography className="text-[10px]! font-semibold! text-[#172033]!">
                  Strengths
               </Typography>

               <Box className="mt-2 space-y-2">
                  {strengths.map((strength, index) => (
                     <Box
                        key={`${strength}-${index}`}
                        className="flex items-start gap-2">
                        <CheckCircleOutlined
                           sx={{
                              fontSize: 13,
                              color: "#22c55e",
                              marginTop: "1px"
                           }}
                        />

                        <Typography className="text-[9px]! leading-4! text-muted!">
                           {strength}
                        </Typography>
                     </Box>
                  ))}
               </Box>
            </Box>
         )}

         {missingSkills.length > 0 && (
            <Box className="mt-4">
               <Typography className="text-[10px]! font-semibold! text-[#172033]!">
                  Missing Skills
               </Typography>

               <Box className="mt-2 space-y-2">
                  {missingSkills.map((skill, index) => (
                     <Box
                        key={`${skill}-${index}`}
                        className="flex items-start gap-2">
                        <FiberManualRecord
                           sx={{
                              fontSize: 8,
                              color: "#f97316",
                              marginTop: "4px"
                           }}
                        />

                        <Typography className="text-[9px]! leading-4! text-muted!">
                           {skill}
                        </Typography>
                     </Box>
                  ))}
               </Box>
            </Box>
         )}
      </Box>
   )
}

const normalizeArray = (value: unknown): string[] => {
   if (!Array.isArray(value)) {
      return []
   }

   return value
      .map(item => {
         if (typeof item === "string") {
            return item
         }

         if (typeof item === "object" && item !== null && "name" in item) {
            const name = (item as { name?: unknown }).name

            return typeof name === "string" ? name : null
         }

         return null
      })
      .filter((item): item is string => item !== null)
}

export default ApplicationAiInsights
