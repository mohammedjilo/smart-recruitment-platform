import { LocationOnOutlined, Verified } from "@mui/icons-material"
import { Avatar, Box, Button } from "@mui/material"
import type { JobDetails } from "@/types/api/jobs"

type CompanyCardProps = {
   company: JobDetails["company"]
   onViewCompany: () => void
}

const CompanyCard = ({ company, onViewCompany }: CompanyCardProps) => (
   <aside className="bg-surface rounded-xl border border-[#e8eaf0] p-6 shadow-[0_2px_8px_rgba(20,30,60,0.035)]">
      <Box className="flex items-center gap-4">
         <Box className="bg-surface flex h-14.25 w-14.25 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#edf0f4]">
            {company.logoUrl ? (
               <Avatar
                  className="h-full! w-full!"
                  variant="rounded"
                  src={company.logoUrl}
                  alt={company.companyName}
               />
            ) : (
               <span className="text-xl font-bold text-[#4f20e8]">
                  {company.companyName?.charAt(0)?.toUpperCase()}
               </span>
            )}
         </Box>
         <Box className="flex items-center gap-1.5">
            <h2 className="text-[18px] font-semibold text-[#10142c]">
               {company.companyName}
            </h2>
            <Verified sx={{ fontSize: 17, color: "#1477e8" }} />
         </Box>
      </Box>

      <p className="mt-5 text-[14px] leading-6 text-[#424b67]">{company.description}</p>

      <Box className="mt-4 flex items-start gap-2 text-[14px] text-[#424b67]">
         <LocationOnOutlined sx={{ fontSize: 19 }} />
         <span>{company.location}</span>
      </Box>

      <Button
         onClick={onViewCompany}
         className="app-button-secondary mt-5! flex! items-center! gap-2! text-sm! font-semibold! transition!">
         View company profile
         <span className="text-xl!">→</span>
      </Button>
   </aside>
)

export default CompanyCard
