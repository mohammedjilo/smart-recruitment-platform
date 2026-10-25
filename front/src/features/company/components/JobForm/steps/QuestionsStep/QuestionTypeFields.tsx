import React from "react"

import { Box, FormControlLabel, Switch, TextField, Typography } from "@mui/material"

import ChoiceOptions from "./ChoiceOptions"
import type { QuestionFormData } from "@/types/question.types"

interface QuestionTypeFieldsProps {
   form: QuestionFormData
   onChange: (field: keyof QuestionFormData, value: any) => void
}

const QuestionTypeFields: React.FC<QuestionTypeFieldsProps> = ({ form, onChange }) => {
   switch (form.type) {
      case "YES_NO":
         return null

      case "TEXT":
         return null

      case "NUMBER":
         return (
            <NumberFields
               form={form}
               onChange={onChange}
            />
         )

      case "SINGLE_CHOICE":
         return (
            <ChoiceOptions
               options={form.options}
               onChange={options => onChange("options", options)}
            />
         )

      case "MULTIPLE_CHOICE":
         return (
            <Box>
               <ChoiceOptions
                  multiple
                  options={form.options}
                  onChange={options => onChange("options", options)}
               />

               <Box className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Box>
                     <label className="mb-2 block text-[10px] font-semibold text-content">
                        Min Selection
                        <span className="ml-1 font-normal text-muted">
                           (Optional)
                        </span>
                     </label>

                     <TextField
                        placeholder="Select minimum"
                        type="number"
                        value={form.minSelections}
                        fullWidth
                        size="small"
                        sx={inputStyle}
                        onChange={e => onChange("minSelections", e.target.value)}
                     />

                     <Typography className="mt-1! text-[9px]!" color="textSecondary">
                        Minimum number of options candidates must select
                     </Typography>
                  </Box>

                  <Box>
                     <label className="mb-2 block text-[10px] font-semibold text-content">
                        Max Selection
                        <span className="ml-1 font-normal text-muted">
                           (Optional)
                        </span>
                     </label>

                     <TextField
                        placeholder="Select maximum"
                        type="number"
                        value={form.maxSelections}
                        fullWidth
                        size="small"
                        sx={inputStyle}
                        onChange={e => onChange("maxSelections", e.target.value)}
                     />

                     <Typography className="mt-1! text-[9px]!" color="textSecondary">
                        Maximum number of options candidates can select
                     </Typography>
                  </Box>
               </Box>
            </Box>
         )

      default:
         return null
   }
}

interface NumberFieldsProps {
   form: QuestionFormData
   onChange: (field: keyof QuestionFormData, value: any) => void
}

const NumberFields: React.FC<NumberFieldsProps> = ({ form, onChange }) => {
   return (
      <Box className="mt-5 rounded-lg bg-bg/70 p-4">
         <Box className="flex items-center justify-between">
            <Box>
               <Typography className="text-[11px]! font-semibold! text-content!">
                  Number Settings
               </Typography>

               <Typography className="mt-1! text-[9px]!" color="textSecondary">
                  Configure the numeric answer
               </Typography>
            </Box>

            <FormControlLabel
               control={
                  <Switch
                     checked={form.allowDecimal}
                     size="small"
                     onChange={e => onChange("allowDecimal", e.target.checked)}
                  />
               }
               label=""
            />

            <span className="-ml-3 text-[10px] text-muted">
               Allow Decimal Numbers
            </span>
         </Box>

         <Box className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Box>
               <label className="mb-2 block text-[10px] font-semibold text-content">
                  Min Value
                  <span className="ml-1 font-normal text-muted">(Optional)</span>
               </label>

               <TextField
                  placeholder="e.g. 0"
                  type="number"
                  value={form.minValue}
                  fullWidth
                  size="small"
                  sx={inputStyle}
                  onChange={e => onChange("minValue", e.target.value)}
               />
            </Box>

            <Box>
               <label className="mb-2 block text-[10px] font-semibold text-content">
                  Max Value
                  <span className="ml-1 font-normal text-muted">(Optional)</span>
               </label>

               <TextField
                  placeholder="e.g. 100"
                  type="number"
                  value={form.maxValue}
                  fullWidth
                  size="small"
                  sx={inputStyle}
                  onChange={e => onChange("maxValue", e.target.value)}
               />
            </Box>
         </Box>
      </Box>
   )
}

const inputStyle = {
   "& .MuiOutlinedInput-root": {
      height: "36px",
      borderRadius: "7px",
      fontSize: "10px",
      backgroundColor: "#fff",

      "& fieldset": {
         borderColor: "#dce2ea"
      },

      "&.Mui-focused fieldset": {
         borderColor: "#633cff"
      }
   }
}

export default QuestionTypeFields
