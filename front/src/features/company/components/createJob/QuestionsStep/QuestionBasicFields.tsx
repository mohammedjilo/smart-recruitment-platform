import React from "react"

import { FormControlLabel, Switch, TextField } from "@mui/material"
import type { QuestionFormData } from "@/types/question.types"

interface QuestionBasicFieldsProps {
   form: QuestionFormData
   onChange: (field: keyof QuestionFormData, value: any) => void
}

const QuestionBasicFields: React.FC<QuestionBasicFieldsProps> = ({ form, onChange }) => {
   return (
      <div className="mt-6">
         <h3 className="text-[13px] font-semibold text-content">
            2. Configure Question
         </h3>

         {/* Question Text */}
         <div className="mt-4">
            <label className="mb-2 block text-[11px] font-semibold text-content">
               Question Text
               <span className="ml-1 text-red-500">*</span>
            </label>

            <div className="relative">
               <TextField
                  fullWidth
                  multiline
                  rows={2}
                  placeholder="Enter your question here..."
                  value={form.question}
                  onChange={e => onChange("question", e.target.value)}
                  slotProps={{
                     htmlInput: {
                        maxLength: 500
                     }
                  }}
                  sx={textareaStyle}
               />

               <span className="absolute right-3 bottom-2 text-[9px] text-muted">
                  {form.question.length}/500
               </span>
            </div>
         </div>

         {/* Required */}
         <div className="mt-4 flex items-center justify-between border-b border-border pb-4">
            <div>
               <p className="text-[11px] font-semibold text-content">Required Answer</p>

               <p className="mt-1 text-[10px] text-muted">
                  Candidate must answer this question
               </p>
            </div>

            <FormControlLabel
               control={
                  <Switch
                     checked={form.required}
                     onChange={e => onChange("required", e.target.checked)}
                     size="small"
                     sx={switchStyle}
                  />
               }
               label=""
            />
         </div>

         {/* Order */}
         <div className="mt-5">
            <h3 className="text-[13px] font-semibold text-content">
               3. Additional Settings
               <span className="ml-1 font-normal text-muted">(Optional)</span>
            </h3>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr]">
               <div>
                  <label className="mb-2 block text-[10px] font-semibold text-content">
                     Order
                  </label>

                  <TextField
                     fullWidth
                     size="small"
                     type="number"
                     value={form.order}
                     onChange={e => onChange("order", Number(e.target.value))}
                     sx={inputStyle}
                  />

                  <p className="mt-1 text-[9px] text-muted">
                     Display order of this question
                  </p>
               </div>
            </div>
         </div>
      </div>
   )
}

const inputStyle = {
   "& .MuiOutlinedInput-root": {
      height: "38px",
      borderRadius: "7px",
      fontSize: "11px",

      "& fieldset": {
         borderColor: "#dce2ea"
      },

      "&:hover fieldset": {
         borderColor: "#b9c2d0"
      },

      "&.Mui-focused fieldset": {
         borderColor: "#633cff"
      }
   }
}

const textareaStyle = {
   "& .MuiOutlinedInput-root": {
      borderRadius: "7px",
      fontSize: "11px",

      "& fieldset": {
         borderColor: "#dce2ea"
      },

      "&:hover fieldset": {
         borderColor: "#b9c2d0"
      },

      "&.Mui-focused fieldset": {
         borderColor: "#633cff"
      }
   },

   "& textarea": {
      paddingBottom: "20px"
   }
}

const switchStyle = {
   "& .MuiSwitch-switchBase.Mui-checked": {
      color: "#633cff",

      "& + .MuiSwitch-track": {
         backgroundColor: "#633cff",
         opacity: 1
      }
   },

   "& .MuiSwitch-track": {
      backgroundColor: "#cbd5e1"
   }
}

export default QuestionBasicFields
