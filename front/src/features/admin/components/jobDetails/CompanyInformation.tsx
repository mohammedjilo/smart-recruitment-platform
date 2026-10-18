import { Avatar, Box, Button, Typography } from "@mui/material"

import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined"
import type { CompanyApprovalStatus } from "@/types/admin"
import CompanyApprovalStatusChip from "@/components/common/CompanyApprovalStatusChip"
import { useNavigate } from "react-router-dom"
import { getAdminCompanyDetailsPath } from "@/utils/companyRoutes"

type CompanyInformationProps = {
   company: {
      id: string
      companyName: string
      slug: string
      logoUrl: string | null
      website: string | null
      email: string
      approvalStatus: CompanyApprovalStatus
   }
}

const CompanyInformation = ({ company }: CompanyInformationProps) => {
   const navigate = useNavigate()

   return (
      <Box className="bg-surface rounded-xl border p-6">
         <Box className="flex items-center gap-3">
            <BusinessOutlinedIcon
               className="text-primary"
               fontSize="small"
            />

            <Typography className="text-content text-sm! font-bold!">
               Company Information
            </Typography>
         </Box>

         <Box className="mt-6 flex items-center gap-4">
            <Avatar
               src={company.logoUrl ?? undefined}
               alt={company.companyName}
               variant="rounded"
               className="bg-primary/10 text-primary h-14 w-14 rounded-xl text-xl font-bold">
               {company.companyName.charAt(0)}
            </Avatar>

            <Box>
               <Typography className="text-content text-base! font-bold!">
                  {company.companyName}
               </Typography>

               <CompanyApprovalStatusChip status={company.approvalStatus} />
            </Box>
         </Box>

         <Box className="mt-6 space-y-5">
            <CompanyDetail
               icon={<LanguageOutlinedIcon />}
               label="Website"
               value={company.website ?? "Not specified"}
            />

            <CompanyDetail
               icon={<EmailOutlinedIcon />}
               label="Email"
               value={company.email}
            />
         </Box>

         <Button
            fullWidth
            variant="text"
            color="primary"
            onClick={() => navigate(getAdminCompanyDetailsPath(company.id))}
            startIcon={<VisibilityOutlinedIcon />}
            className="mt-7! min-w-22! rounded-lg! text-xs! font-medium! normal-case!">
            View Company Profile
         </Button>
      </Box>
   )
}

type CompanyDetailProps = {
   icon: React.ReactNode
   label: string
   value: string
}

const CompanyDetail = ({ icon, label, value }: CompanyDetailProps) => {
   return (
      <Box className="flex gap-3">
         <Box className="text-primary">{icon}</Box>

         <Box className="min-w-0">
            <Typography className="text-[10px]!">{label}</Typography>

            <Typography
               className="mt-1! text-xs! font-medium! break-all!"
               color="textSecondary">
               {value}
            </Typography>
         </Box>
      </Box>
   )
}

export default CompanyInformation
