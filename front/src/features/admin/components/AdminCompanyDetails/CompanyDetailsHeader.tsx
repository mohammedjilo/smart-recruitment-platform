import {
   CalendarMonthOutlined,
   EmailOutlined,
   LocationOnOutlined,
   PhoneOutlined,
   PublicOutlined,
   ShieldOutlined
} from "@mui/icons-material"

import { Avatar, Box, Button, Menu, MenuItem, Typography } from "@mui/material"

import { useState } from "react"

import type { Company } from "@/types/company"
import type { CompanyApprovalStatus, CompanyStatus } from "@/types/admin"
import { useUpdateCompanyStatusByAdminMutation } from "@/features/admin/services/adminApiCalls"
import { showAlert } from "@/utils/swal"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { getInitials } from "@/utils/string/getInitials"
import formatCreatedAt from "@/utils/formatDate"
import CompanyApprovalStatusChip from "@/components/common/CompanyApprovalStatusChip"
import CompanyStatusChip from "@/components/common/CompanyStatusChip"

type Props = {
   company: Company & {
      approvalStatus: CompanyApprovalStatus
   }
}

const InfoItem = ({
   icon,
   label,
   value
}: {
   icon: React.ReactNode
   label: string
   value: React.ReactNode
}) => {
   return (
      <Box className="flex items-start gap-3">
         <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            {icon}
         </Box>

         <Box className="min-w-0">
            <Typography className="text-xs! font-medium!">{label}</Typography>

            <Box className="mt-1">
               {typeof value === "string" ? (
                  <Typography
                     className="text-sm! font-medium! break-all!"
                     color="textSecondary">
                     {value}
                  </Typography>
               ) : (
                  value
               )}
            </Box>
         </Box>
      </Box>
   )
}

const CompanyDetailsHeader = ({ company }: Props) => {
   const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
   const [updateCompanyStatus, statusResult] = useUpdateCompanyStatusByAdminMutation()
   const statusState = getMutationState(statusResult)
   const statusPresentation = getMutationPresentation(statusState, {
      surface: "action",
      importance: "important"
   })
   const isUpdatingStatus = statusPresentation.category === "loading"

   const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget)
   }

   const handleCloseMenu = () => {
      setAnchorEl(null)
   }

   const handleStatusChange = async () => {
      const nextStatus: CompanyStatus =
         company.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE"
      const actionLabel = nextStatus === "ACTIVE" ? "reactivate" : "deactivate"

      handleCloseMenu()

      const confirmation = await showAlert({
         type: "confirm",
         title: `${nextStatus === "ACTIVE" ? "Reactivate" : "Deactivate"} company?`,
         text: `Are you sure you want to ${actionLabel} ${company.companyName}?`,
         confirmText: nextStatus === "ACTIVE" ? "Reactivate" : "Deactivate"
      })

      if (!confirmation || !confirmation.isConfirmed) {
         return
      }

      try {
         await updateCompanyStatus({
            id: company.id,
            status: nextStatus
         }).unwrap()

         if (
            getMutationPresentation(
               { status: "success" },
               { surface: "action", importance: "important" }
            ).category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Status updated",
               text: `${company.companyName} is now ${nextStatus.toLowerCase()}.`
            })
         }
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "action", importance: "important" }
         )
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Update failed",
            text: errorPresentation.message
         })
      }
   }

   return (
      <Box>
         {/* Actions */}
         <Box className="mb-3 flex justify-end gap-2">
            <Button
               variant="outlined"
               onClick={handleOpenMenu}
               className="border-border! bg-surface! text-content! capitalize!">
               More Actions
            </Button>

            <Menu
               anchorEl={anchorEl}
               open={Boolean(anchorEl)}
               onClose={handleCloseMenu}>
               <MenuItem
                  onClick={handleStatusChange}
                  disabled={isUpdatingStatus}>
                  {company.status === "ACTIVE"
                     ? "Deactivate Company"
                     : "Reactivate Company"}
               </MenuItem>
            </Menu>
         </Box>

         {/* Main Header */}
         <Box className="rounded-xl border bg-surface p-5 shadow-sm">
            <Box className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.7fr_0.85fr]">
               {/* Company Main Info */}
               <Box className="flex flex-col gap-5 sm:flex-row">
                  <Avatar
                     src={company.logoUrl || undefined}
                     alt={company.companyName}
                     variant="rounded"
                     sx={{
                        width: 140,
                        height: 140,
                        borderRadius: "10px",
                        border: "1px solid #E2E8F0",
                        backgroundColor: "#F8FAFC",
                        color: "#5425D4",
                        fontSize: "32px",
                        fontWeight: 700
                     }}>
                     {getInitials(company.companyName)}
                  </Avatar>

                  <Box className="pt-1">
                     <Typography className="text-[25px]! font-bold!">
                        {company.companyName}
                     </Typography>

                     <Box className="mt-3 flex flex-wrap gap-2">
                        <CompanyApprovalStatusChip status={company.approvalStatus} />

                        <CompanyStatusChip status={company.status} />
                     </Box>

                     <Typography
                        className="mt-5! max-w-82.5! text-sm! leading-6!"
                        color="textSecondary">
                        {company.description || "No company description provided."}
                     </Typography>
                  </Box>
               </Box>

               {/* Contact Information */}
               <Box className="grid gap-5 border-t pt-6 xl:border-t-0 xl:border-l xl:pt-1 xl:pl-7">
                  <InfoItem
                     icon={<PhoneOutlined fontSize="small" />}
                     label="Phone"
                     value={company.phone}
                  />

                  <InfoItem
                     icon={<EmailOutlined fontSize="small" />}
                     label="Email"
                     value={company.email}
                  />

                  <InfoItem
                     icon={<PublicOutlined fontSize="small" />}
                     label="Website"
                     value={company.website || "Not provided"}
                  />
               </Box>

               {/* Additional Information */}
               <Box className="grid gap-5 border-t pt-6 xl:border-t-0 xl:border-l xl:pt-1 xl:pl-7">
                  <InfoItem
                     icon={<LocationOnOutlined fontSize="small" />}
                     label="Location"
                     value={company.location || "Not provided"}
                  />

                  <InfoItem
                     icon={<CalendarMonthOutlined fontSize="small" />}
                     label="Joined On"
                     value={formatCreatedAt(company.createdAt)}
                  />

                  <InfoItem
                     icon={<ShieldOutlined fontSize="small" />}
                     label="Status"
                     value={<CompanyStatusChip status={company.status} />}
                  />
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default CompanyDetailsHeader
