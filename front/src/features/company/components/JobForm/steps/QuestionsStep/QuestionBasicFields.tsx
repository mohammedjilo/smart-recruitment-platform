import React from "react"

import { Box, FormControlLabel, Switch, TextField, Typography } from "@mui/material"
import type { QuestionFormData } from "@/types/question.types"

interface QuestionBasicFieldsProps {
   form: QuestionFormData
   onChange: (field: keyof QuestionFormData, value: any) => void
}

const QuestionBasicFields: React.FC<QuestionBasicFieldsProps> = ({ form, onChange }) => {
   return (
      <Box className="mt-6">
         <Typography
            className="text-[13px]! font-semibold! text-content!"
            variant="h3">
            2. Configure Question
         </Typography>

         {/* Question Text */}
         <Box className="mt-4">
            <label className="mb-2 block text-[11px] font-semibold text-content">
               Question Text
               <span className="ml-1 text-red-500">*</span>
            </label>

            <Box className="relative">
               <TextField
                  placeholder="Enter your question here..."
                  value={form.question}
                  fullWidth
                  multiline
                  rows={2}
                  slotProps={{
                     htmlInput: {
                        maxLength: 500
                     }
                  }}
                  sx={textareaStyle}
                  onChange={e => onChange("question", e.target.value)}
               />

               <span className="absolute right-3 bottom-2 text-[9px] text-muted">
                  {form.question.length}/500
               </span>
            </Box>
         </Box>

         {/* Required */}
         <Box className="mt-4 flex items-center justify-between border-b border-border pb-4">
            <Box>
               <Typography className="text-[11px]! font-semibold! text-content!">
                  Required Answer
               </Typography>

               <Typography className="mt-1! text-[10px]!" color="textSecondary">
                  Candidate must answer this question
               </Typography>
            </Box>

            <FormControlLabel
               control={
                  <Switch
                     checked={form.required}
                     size="small"
                     sx={switchStyle}
                     onChange={e => onChange("required", e.target.checked)}
                  />
               }
               label=""
            />
         </Box>

         {/* Order */}
         <Box className="mt-5">
            <Typography
               className="text-[13px]! font-semibold! text-content!"
               variant="h3">
               3. Additional Settings
               <span className="ml-1 font-normal text-muted">(Optional)</span>
            </Typography>

            <Box className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr]">
               <Box>
                  <label className="mb-2 block text-[10px] font-semibold text-content">
                     Order
                  </label>

                  <TextField
                     type="number"
                     value={form.order}
                     fullWidth
                     size="small"
                     sx={inputStyle}
                     onChange={e => onChange("order", Number(e.target.value))}
                  />

                  <Typography className="mt-1! text-[9px]!" color="textSecondary">
                     Display order of this question
                  </Typography>
               </Box>
            </Box>
         </Box>
      </Box>
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
