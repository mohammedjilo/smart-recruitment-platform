import React from "react"
import { CheckCircle } from "@mui/icons-material"
import { Box } from "@mui/material"

interface CreateJobStepperProps {
   currentStep: number
   mode?: "create" | "edit"
}

const CreateJobStepper: React.FC<CreateJobStepperProps> = ({
   currentStep,
   mode = "create"
}) => {
   const steps = [
      {
         number: 1,
         label: "Job Details"
      },
      {
         number: 2,
         label: "Questions (Optional)"
      },
      {
         number: 3,
         label: mode === "edit" ? "Edit" : "Review & Publish"
      }
   ]

   return (
      <Box className="border-b border-border px-7 py-5">
         <Box className="flex items-center">
            {steps.map((step, index) => {
               const active = currentStep === step.number
               const completed = currentStep > step.number

               return (
                  <React.Fragment key={step.number}>
                     <Box className="flex shrink-0 items-center gap-2">
                        <Box
                           className={[
                              "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold",
                              active
                                 ? "bg-primary text-white"
                                 : completed
                                   ? "bg-primary-tint text-primary"
                                   : "bg-slate-100 text-muted"
                           ].join(" ")}>
                           {completed ? (
                              <CheckCircle sx={{ fontSize: 16 }} />
                           ) : (
                              step.number
                           )}
                        </Box>

                        <span
                           className={[
                              "text-[11px] whitespace-nowrap",
                              active ? "font-semibold text-content" : "text-muted"
                           ].join(" ")}>
                           {step.label}
                        </span>
                     </Box>

                     {index < steps.length - 1 && (
                        <Box
                           className={[
                              "mx-3 h-0.5 min-w-7.5 flex-1",
                              currentStep > step.number ? "bg-primary" : "bg-slate-200"
                           ].join(" ")}
                        />
                     )}
                  </React.Fragment>
               )
            })}
         </Box>
      </Box>
   )
}

export default CreateJobStepper
