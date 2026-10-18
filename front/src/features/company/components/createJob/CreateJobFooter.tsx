import React from "react"

import { ArrowBack, ArrowForward } from "@mui/icons-material"

import { Button } from "@mui/material"

interface CreateJobFooterProps {
   currentStep: number
   onBack: () => void
   onNext: () => void
}

const CreateJobFooter: React.FC<CreateJobFooterProps> = ({
   currentStep,
   onBack,
   onNext
}) => {
   return (
      <div className="flex justify-between border-t border-border px-7 py-4">
         <div>
            {currentStep > 1 && (
               <Button
                  variant="outlined"
                  startIcon={<ArrowBack fontSize="small" />}
                  onClick={onBack}
                  className="app-button-secondary"
                  sx={buttonStyle}>
                  Back
               </Button>
            )}
         </div>

         <div className="flex gap-3">
            <Button
               variant="outlined"
               onClick={() => window.history.back()}
               className="app-button-secondary"
               sx={buttonStyle}>
               Cancel
            </Button>

            {currentStep < 3 ? (
               <Button
                  variant="contained"
                  endIcon={<ArrowForward fontSize="small" />}
                  onClick={onNext}
                  className="app-button-primary"
                  sx={nextButtonStyle}>
                  Next
               </Button>
            ) : (
               <Button
                  variant="contained"
                  onClick={() => {
                     console.log("Publish Job")
                  }}
                  className="app-button-primary"
                  sx={nextButtonStyle}>
                  Publish Job
               </Button>
            )}
         </div>
      </div>
   )
}

const buttonStyle = {
   textTransform: "none",
   borderRadius: "7px",
   borderColor: "#dce2ea",
   color: "#475569",
   fontSize: "12px",
   px: 2,
   height: "36px"
}

const nextButtonStyle = {
   textTransform: "none",
   borderRadius: "7px",
   backgroundColor: "#633cff",
   fontSize: "12px",
   px: 2.5,
   height: "36px",
   boxShadow: "none",

   "&:hover": {
      backgroundColor: "#5530e6",
      boxShadow: "none"
   }
}

export default CreateJobFooter
