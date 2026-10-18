import React from "react"

import { Add, DeleteOutlined, DragIndicator } from "@mui/icons-material"

import { IconButton, TextField } from "@mui/material"

interface ChoiceOptionsProps {
   options: string[]
   multiple?: boolean
   onChange: (options: string[]) => void
}

const ChoiceOptions: React.FC<ChoiceOptionsProps> = ({
   options,
   multiple = false,
   onChange
}) => {
   const addOption = () => {
      onChange([...options, ""])
   }

   const updateOption = (index: number, text: string) => {
      onChange(
         options.map((option, optionIndex) => (optionIndex === index ? text : option))
      )
   }

   const deleteOption = (index: number) => {
      if (options.length <= 2) return

      onChange(options.filter((_, optionIndex) => optionIndex !== index))
   }

   return (
      <div className="mt-5">
         <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-content">Options</label>

            <span className="text-[9px] text-muted">
               {multiple ? "Candidates can select multiple" : "Candidates can select one"}
            </span>
         </div>

         <div className="mt-3 space-y-2">
            {options.map((option, index) => (
               <div
                  key={index}
                  className="flex items-center gap-2">
                  <DragIndicator
                     sx={{
                        fontSize: 17,
                        color: "#94a3b8"
                     }}
                  />

                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-bg text-[10px] font-medium text-muted">
                     {index + 1}
                  </div>

                  <TextField
                     fullWidth
                     size="small"
                     placeholder={`Enter option ${index + 1}`}
                     value={option}
                     onChange={e => updateOption(index, e.target.value)}
                     sx={inputStyle}
                  />

                  <IconButton
                     size="small"
                     onClick={() => deleteOption(index)}
                     disabled={options.length <= 2}
                     className="text-red-500!">
                     <DeleteOutlined sx={{ fontSize: 17 }} />
                  </IconButton>
               </div>
            ))}
         </div>

         <button
            type="button"
            onClick={addOption}
            className="border-primary text-primary hover:bg-primary-tint mt-3 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[10px] font-medium transition">
            <Add sx={{ fontSize: 15 }} />
            Add Option
         </button>
      </div>
   )
}

const inputStyle = {
   "& .MuiOutlinedInput-root": {
      height: "32px",
      borderRadius: "6px",
      fontSize: "10px",

      "& fieldset": {
         borderColor: "#dce2ea"
      },

      "&.Mui-focused fieldset": {
         borderColor: "#633cff"
      }
   }
}

export default ChoiceOptions
