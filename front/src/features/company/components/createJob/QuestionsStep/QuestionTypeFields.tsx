import React from "react"

import { FormControlLabel, Switch, TextField } from "@mui/material"

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
            <div>
               <ChoiceOptions
                  options={form.options}
                  multiple
                  onChange={options => onChange("options", options)}
               />

               <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                     <label className="mb-2 block text-[10px] font-semibold text-content">
                        Min Selection
                        <span className="ml-1 font-normal text-muted">
                           (Optional)
                        </span>
                     </label>

                     <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Select minimum"
                        value={form.minSelections}
                        onChange={e => onChange("minSelections", e.target.value)}
                        sx={inputStyle}
                     />

                     <p className="mt-1 text-[9px] text-muted">
                        Minimum number of options candidates must select
                     </p>
                  </div>

                  <div>
                     <label className="mb-2 block text-[10px] font-semibold text-content">
                        Max Selection
                        <span className="ml-1 font-normal text-muted">
                           (Optional)
                        </span>
                     </label>

                     <TextField
                        fullWidth
                        size="small"
                        type="number"
                        placeholder="Select maximum"
                        value={form.maxSelections}
                        onChange={e => onChange("maxSelections", e.target.value)}
                        sx={inputStyle}
                     />

                     <p className="mt-1 text-[9px] text-muted">
                        Maximum number of options candidates can select
                     </p>
                  </div>
               </div>
            </div>
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
      <div className="mt-5 rounded-lg bg-bg/70 p-4">
         <div className="flex items-center justify-between">
            <div>
               <p className="text-[11px] font-semibold text-content">Number Settings</p>

               <p className="mt-1 text-[9px] text-muted">
                  Configure the numeric answer
               </p>
            </div>

            <FormControlLabel
               label=""
               control={
                  <Switch
                     size="small"
                     checked={form.allowDecimal}
                     onChange={e => onChange("allowDecimal", e.target.checked)}
                  />
               }
            />

            <span className="-ml-3 text-[10px] text-muted">
               Allow Decimal Numbers
            </span>
         </div>

         <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
               <label className="mb-2 block text-[10px] font-semibold text-content">
                  Min Value
                  <span className="ml-1 font-normal text-muted">(Optional)</span>
               </label>

               <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="e.g. 0"
                  value={form.minValue}
                  onChange={e => onChange("minValue", e.target.value)}
                  sx={inputStyle}
               />
            </div>

            <div>
               <label className="mb-2 block text-[10px] font-semibold text-content">
                  Max Value
                  <span className="ml-1 font-normal text-muted">(Optional)</span>
               </label>

               <TextField
                  fullWidth
                  size="small"
                  type="number"
                  placeholder="e.g. 100"
                  value={form.maxValue}
                  onChange={e => onChange("maxValue", e.target.value)}
                  sx={inputStyle}
               />
            </div>
         </div>
      </div>
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
