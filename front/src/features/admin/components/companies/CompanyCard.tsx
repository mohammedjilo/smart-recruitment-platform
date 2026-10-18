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
      <Box className="bg-surface flex min-h-62.5 flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
         {/* Top section */}
         <Box className="flex-1 px-5 pt-5">
            <Box className="flex items-start justify-between">
               <Avatar
                  src={company.logoUrl || undefined}
                  alt={company.companyName}
                  variant="rounded"
                  sx={{
                     width: 58,
                     height: 58,
                     borderRadius: "50%",
                     backgroundColor: "#F5F3FF",
                     color: "#5425D4",
                     fontWeight: 700,
                     fontSize: "18px"
                  }}>
                  {getInitials(company.companyName)}
               </Avatar>

               <CompanyApprovalStatusChip status={company.approvalStatus} />
            </Box>

            <Typography className="mt-4! truncate! text-[16px]! font-bold!">
               {company.companyName}
            </Typography>

            <Box className="text-muted mt-2 flex items-center gap-1">
               <LocationOnOutlinedIcon sx={{ fontSize: 15 }} />

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
                  <WorkOutlineOutlinedIcon
                     sx={{
                        fontSize: 17,
                        color: "#64748B"
                     }}
                  />

                  <Typography
                     className="text-xs!"
                     color="textSecondary">
                     {company._count.jobs} {company._count.jobs === 1 ? "Job" : "Jobs"}
                  </Typography>
               </Box>

               <Box className="flex items-center gap-1.5">
                  <CalendarMonthOutlinedIcon
                     sx={{
                        fontSize: 17,
                        color: "#64748B"
                     }}
                  />

                  <Typography
                     className="text-xs! whitespace-nowrap!"
                     color="textSecondary">
                     {company.reviewedAt && formatCreatedAt(company.reviewedAt)}
                  </Typography>
               </Box>
            </Box>

            <IconButton
               size="small"
               onClick={handleMenuOpen}
               sx={{
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px"
               }}>
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
