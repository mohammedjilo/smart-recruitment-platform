import { useState } from "react"
import { Close } from "@mui/icons-material"
import { Box, Chip, TextField, Typography } from "@mui/material"
import type { JobDetailsFieldsProps } from "./types"

const SkillsField = ({ form, onChange }: JobDetailsFieldsProps) => {
   const [skillInput, setSkillInput] = useState("")

   const addSkill = () => {
      const skill = skillInput.trim()
      if (!skill) return

      if (!form.skills.includes(skill)) {
         onChange("skills", [...form.skills, skill])
      }
      setSkillInput("")
   }

   const removeSkill = (skill: string) => {
      onChange(
         "skills",
         form.skills.filter(item => item !== skill)
      )
   }

   return (
      <Box className="mt-5">
         <Typography className="mb-2! block! text-[11px]! font-semibold!">
            Skills
         </Typography>
         <TextField
            fullWidth
            size="small"
            placeholder="Add skills and press Enter"
            value={skillInput}
            onChange={event => setSkillInput(event.target.value)}
            onKeyDown={event => {
               if (event.key === "Enter") {
                  event.preventDefault()
                  addSkill()
               }
            }}
         />
         {form.skills.length > 0 && (
            <Box className="mt-2 flex flex-wrap gap-2">
               {form.skills.map(skill => (
                  <Chip
                     key={skill}
                     label={skill}
                     size="small"
                     onDelete={() => removeSkill(skill)}
                     deleteIcon={<Close sx={{ fontSize: 14 }} />}
                     sx={{
                        height: 26,
                        borderRadius: "5px",
                        border: "1px solid #dbe2ea",
                        backgroundColor: "#fff",
                        color: "#475569",
                        fontSize: "11px"
                     }}
                  />
               ))}
            </Box>
         )}
      </Box>
   )
}

export default SkillsField