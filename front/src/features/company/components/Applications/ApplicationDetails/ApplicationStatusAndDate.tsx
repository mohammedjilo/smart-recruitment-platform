import { Box, Typography } from "@mui/material"
import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import type { CompanyApplication } from "@/types/application"
import formatCreatedAt from "@/utils/formatDate"

const ApplicationStatusAndDate = ({ application }: { application: CompanyApplication }) => (
   <Box className="grid grid-cols-2 divide-x divide-[#E7EAF0] border-b border-[#E7EAF0]">
      <Box className="p-4">
         <Typography className="text-xs! text-[#64748B]!">Status</Typography>
         <Box className="mt-2">
            <ApplicationStatusChip status={application.status} />
         </Box>
      </Box>
      <Box className="p-4">
         <Typography className="text-xs! text-[#64748B]!">Applied On</Typography>
         <Typography className="mt-2! text-sm! font-semibold!">
            {formatCreatedAt(application.createdAt)}
         </Typography>
      </Box>
   </Box>
)

export default ApplicationStatusAndDate
