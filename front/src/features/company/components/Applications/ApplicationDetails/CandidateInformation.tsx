import { Box, Typography } from "@mui/material"
import { EmailOutlined } from "@mui/icons-material"
import type { CompanyApplication } from "@/types/application"

type Props = {
   application: CompanyApplication
   fullName: string
}

const CandidateInformation = ({ application, fullName }: Props) => (
   <Box className="border-t border-[#E7EAF0] px-5 py-4">
      <Box className="mb-3 flex items-start gap-3">
         <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8FAFC]">
            <EmailOutlined className="text-[#64748B]!" fontSize="small" />
         </Box>
         <Box>
            <Typography className="text-sm! font-semibold! text-[#334155]!">
               Candidate Information
            </Typography>
            <Typography className="text-xs! text-[#64748B]!">
               {application.job.title}
            </Typography>
         </Box>
      </Box>
      <Box className="space-y-3">
         <DetailRow label="Job" value={application.job.title} />
         <DetailRow label="Candidate" value={fullName} />
         <DetailRow label="Email" value={application.user.email} />
      </Box>
   </Box>
)

const DetailRow = ({ label, value }: { label: string; value: string }) => (
   <Box className="flex items-start justify-between gap-4">
      <span className="text-[10px] text-muted">{label}</span>
      <span className="max-w-42.5 text-right text-[10px] font-medium text-content">
         {value}
      </span>
   </Box>
)

export default CandidateInformation
