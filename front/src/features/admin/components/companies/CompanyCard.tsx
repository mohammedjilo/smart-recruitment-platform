import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"

import { Avatar, Box, IconButton, Menu, MenuItem, Typography } from "@mui/material"

import { useState } from "react"

import CompanyApprovalStatusChip from "@/components/common/CompanyApprovalStatusChip"
import type { AdminCompany } from "@/types/admin"
import { getInitials } from "@/utils/string/getInitials"
import formatCreatedAt from "@/utils/formatDate"
import { useNavigate } from "react-router-dom"
import { getAdminCompanyDetailsPath } from "@/utils/companyRoutes"

type Props = {
   company: AdminCompany
}

const CompanyCard = ({ company }: Props) => {
   const navigate = useNavigate()
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
   const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
   }

   const handleMenuClose = () => {
      navigate(getAdminCompanyDetailsPath(company.id))
   }

   return (
      <Box className="bg-surface border-border flex min-h-62.5 flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
         {/* Top section */}
         <Box className="flex-1 px-5 pt-5">
            <Box className="flex items-start justify-between">
               <Avatar
                  className="h-14.5! w-14.5! rounded-full! bg-[#F5F3FF]! text-lg! font-bold! text-[#5425D4]!"
                  alt={company.companyName}
                  src={company.logoUrl || undefined}
                  variant="rounded">
                  {getInitials(company.companyName)}
               </Avatar>

               <CompanyApprovalStatusChip status={company.approvalStatus} />
            </Box>

            <Typography className="mt-4! truncate! text-[16px]! font-bold!">
               {company.companyName}
            </Typography>

            <Box className="text-muted mt-2 flex items-center gap-1">
               <LocationOnOutlinedIcon className="text-[15px]!" />

               <Typography
                  className="truncate! text-xs!"
                  color="textSecondary">
                  {company.location || "Location not provided"}
               </Typography>
            </Box>

            <Typography
               className="mt-3! line-clamp-2! min-h-10! text-xs! leading-5!"
               color="textSecondary">
               {company.description || "No company description provided."}
            </Typography>
         </Box>

         {/* Bottom section */}
         <Box className="border-border mt-4 flex items-center justify-between border-t px-5 py-3">
            <Box className="flex items-center gap-5">
               <Box className="flex items-center gap-1.5">
                  <WorkOutlineOutlinedIcon className="text-[17px]! text-[#64748B]!" />

                  <Typography
                     className="text-xs!"
                     color="textSecondary">
                     {company._count.jobs} {company._count.jobs === 1 ? "Job" : "Jobs"}
                  </Typography>
               </Box>

               <Box className="flex items-center gap-1.5">
                  <CalendarMonthOutlinedIcon className="text-[17px]! text-[#64748B]!" />

                  <Typography
                     className="text-xs! whitespace-nowrap!"
                     color="textSecondary">
                     {company.reviewedAt && formatCreatedAt(company.reviewedAt)}
                  </Typography>
               </Box>
            </Box>

            <IconButton
               className="rounded-lg! border! border-[#E2E8F0]!"
               size="small"
               onClick={handleMenuOpen}>
               <MoreHorizIcon fontSize="small" />
            </IconButton>

            <Menu
               anchorEl={anchorEl}
               open={Boolean(anchorEl)}
               onClose={handleMenuClose}>
               <MenuItem onClick={handleMenuClose}>View Details</MenuItem>

               <MenuItem onClick={handleMenuClose}>Edit Company</MenuItem>
            </Menu>
         </Box>
      </Box>
   )
}

export default CompanyCard
