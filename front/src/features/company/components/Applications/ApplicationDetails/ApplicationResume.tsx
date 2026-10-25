import { Box, Button, Typography } from "@mui/material"
import { DescriptionOutlined } from "@mui/icons-material"
import type { CompanyApplication } from "@/types/application"

const ApplicationResume = ({ application }: { application: CompanyApplication }) => (
   <Box className="border-t border-[#E7EAF0] px-5 py-4">
      <Box className="flex items-center justify-between gap-4">
         <Box className="flex items-center gap-3">
            <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8FAFC]">
               <DescriptionOutlined className="text-[#64748B]!" fontSize="small" />
            </Box>
            <Box>
               <Typography className="text-sm! font-semibold! text-[#334155]!">
                  Resume Details
               </Typography>
               <Typography className="text-xs! text-[#64748B]!">
                  {application.resumeType === "PROFILE" ? "Profile-based" : "Uploaded CV"}
               </Typography>
            </Box>
         </Box>
         {application.cvUrl && (
            <Button
               className="normal-case!"
               href={application.cvUrl}
               color="primary"
               component="a"
               rel="noopener noreferrer"
               size="small"
               target="_blank"
               variant="outlined">
               View Resume
            </Button>
         )}
      </Box>
   </Box>
)

export default ApplicationResume
