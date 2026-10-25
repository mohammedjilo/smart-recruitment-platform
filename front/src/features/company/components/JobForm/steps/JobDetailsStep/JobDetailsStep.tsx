import React from "react"
import { Box, Button, Typography } from "@mui/material"
import JobInformationFields from "./JobInformationFields"
import JobRequirementsFields from "./JobRequirementsFields"
import JobStatusField from "./JobStatusField"
import SkillsField from "./SkillsField"
import type { JobDetailsStepProps } from "./types"

const JobDetailsStep: React.FC<JobDetailsStepProps> = ({ onNext, onCancel }) => (
   <Box>
      <Box className="px-7 py-6">
         <Typography
            className="mb-6! text-[16px]! font-semibold!"
            variant="h2">
            Job Information
         </Typography>
         <JobInformationFields />
         <JobRequirementsFields />
         <SkillsField />
         <JobStatusField />
      </Box>
      <Box className="border-border flex justify-end gap-3 border-t px-7 py-4">
         <Button
            className="capitalize!"
            variant="outlined"
            onClick={onCancel}>
            Cancel
         </Button>
         <Button
            className="capitalize!"
            variant="contained"
            onClick={onNext}>
            Next
         </Button>
      </Box>
   </Box>
)

export default JobDetailsStep
