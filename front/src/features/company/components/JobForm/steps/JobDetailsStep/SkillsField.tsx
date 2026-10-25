import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Close } from "@mui/icons-material"
import { Box, Chip, TextField, Typography } from "@mui/material"
import type { JobFormInput } from "../../types"

const SkillsField = () => {
   const [skillInput, setSkillInput] = useState("")
   const { control, setValue } = useFormContext<JobFormInput>()
   const skills = useWatch({ control, name: "skills" }) ?? []

   const addSkill = () => {
      const skill = skillInput.trim()
      if (!skill) return

      if (!skills.includes(skill)) {
         setValue("skills", [...skills, skill], { shouldDirty: true })
      }
      setSkillInput("")
   }

   const removeSkill = (skill: string) => {
      setValue(
         "skills",
         skills.filter(item => item !== skill),
         { shouldDirty: true }
      )
   }

   return (
      <Box className="mt-5">
         <Typography className="mb-2! block! text-[11px]! font-semibold!">
            Skills
         </Typography>
         <TextField
            placeholder="Add skills and press Enter"
            value={skillInput}
            fullWidth
            size="small"
            onChange={event => setSkillInput(event.target.value)}
            onKeyDown={event => {
               if (event.key === "Enter") {
                  event.preventDefault()
                  addSkill()
               }
            }}
         />
         {skills.length > 0 && (
            <Box className="mt-2 flex flex-wrap gap-2">
               {skills.map(skill => (
                  <Chip
                     className="h-6.5! rounded-[5px]! bg-[#fff]! text-[11px]! text-[#475569]! border! border-[#dbe2ea]!"
                     key={skill}
                     deleteIcon={<Close className="text-sm!" />}
                     label={skill}
                     size="small"
                     onDelete={() => removeSkill(skill)}
                  />
               ))}
            </Box>
         )}
      </Box>
   )
}

export default SkillsField
