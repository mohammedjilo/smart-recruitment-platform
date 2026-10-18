import React from "react"
import { Box, Button } from "@mui/material"
import JobInformationFields from "./JobInformationFields"
import JobRequirementsFields from "./JobRequirementsFields"
import JobStatusField from "./JobStatusField"
import SkillsField from "./SkillsField"
import type { JobDetailsStepProps } from "./types"

const JobDetailsStep: React.FC<JobDetailsStepProps> = ({
   form,
   onChange,
   onNext,
   onCancel
}) => (
   <Box>
      <Box className="px-7 py-6">
         <h2 className="mb-6 text-[16px] font-semibold text-[#172033]">
            Job Information
         </h2>
         <JobInformationFields form={form} onChange={onChange} />
         <JobRequirementsFields form={form} onChange={onChange} />
         <SkillsField form={form} onChange={onChange} />
         <JobStatusField form={form} onChange={onChange} />
      </Box>
      <Box className="border-border flex justify-end gap-3 border-t px-7 py-4">
         <Button
            className="app-button-secondary capitalize!"
            variant="outlined"
            onClick={onCancel}>
            Cancel
         </Button>
         <Button
            className="app-button-primary capitalize!"
            variant="contained"
            onClick={onNext}>
            Next
         </Button>
      </Box>
   </Box>
)

export default JobDetailsStep
