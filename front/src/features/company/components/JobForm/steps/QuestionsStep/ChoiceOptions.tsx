import React from "react"

import { Add, DeleteOutlined, DragIndicator } from "@mui/icons-material"

import { Box, IconButton, TextField } from "@mui/material"

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
      <Box className="mt-5">
         <Box className="flex items-center justify-between">
            <label className="text-content text-[11px] font-semibold">Options</label>

            <span className="text-muted text-[9px]">
               {multiple ? "Candidates can select multiple" : "Candidates can select one"}
            </span>
         </Box>

         <Box className="mt-3 space-y-2">
            {options.map((option, index) => (
               <Box
                  className="flex items-center gap-2"
                  key={index}>
                  <DragIndicator className="text-[17px]! text-[#94a3b8]!" />

                  <Box className="bg-bg text-muted flex h-7 w-7 shrink-0 items-center justify-center rounded text-[10px] font-medium">
                     {index + 1}
                  </Box>

                  <TextField
                     placeholder={`Enter option ${index + 1}`}
                     value={option}
                     fullWidth
                     size="small"
                     sx={inputStyle}
                     onChange={e => updateOption(index, e.target.value)}
                  />

                  <IconButton
                     className="text-red-500!"
                     disabled={options.length <= 2}
                     size="small"
                     onClick={() => deleteOption(index)}>
                     <DeleteOutlined className="text-[17px]!" />
                  </IconButton>
               </Box>
            ))}
         </Box>

         <button
            className="border-primary text-primary hover:bg-primary-tint mt-3 inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-[10px] font-medium transition"
            type="button"
            onClick={addOption}>
            <Add className="text-[15px]!" />
            Add Option
         </button>
      </Box>
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
