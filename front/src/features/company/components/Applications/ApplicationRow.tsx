import React, { useState } from "react"

import { MoreHoriz, RemoveRedEyeOutlined, SwapHorizOutlined } from "@mui/icons-material"

import { Avatar, Box, IconButton, Menu, MenuItem, Typography } from "@mui/material"

import { useUpdateApplicationStatusMutation } from "@/services/shared/applicationApiCalls"
import type { CompanyApplication, UpdateApplicationStatus } from "@/types/application"
import { getStatusConfig } from "@/utils/applicationStatus"
import { showAlert } from "@/utils/swal"
import ApplicationStatusBadge from "./ApplicationStatusBadge"
import MatchScore from "./MatchScore"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"

interface ApplicationRowProps {
   application: CompanyApplication
   onViewApplication: (application: CompanyApplication) => void
}

const ApplicationRow: React.FC<ApplicationRowProps> = ({
   application,
   onViewApplication
}) => {
   const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
   const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null)
   const [updateApplicationStatus, mutationResult] = useUpdateApplicationStatusMutation()
   const mutationState = getMutationState(mutationResult)
   const mutationPresentation = getMutationPresentation(mutationState, {
      surface: "action",
      importance: "important"
   })

   const fullName = `${application.user.firstName} ${application.user.lastName}`

   const formattedDate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
   }).format(new Date(application.createdAt))

   const statusOptions: UpdateApplicationStatus[] = [
      "PENDING",
      "REVIEWING",
      "SHORTLISTED",
      "INTERVIEW",
      "ACCEPTED",
      "REJECTED"
   ]

   const isApplicationWithdrawn = application.status === "WITHDRAWN"

   const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
      setMenuAnchor(event.currentTarget)
   }

   const handleCloseMenu = () => {
      setMenuAnchor(null)
      setStatusMenuAnchor(null)
   }

   const handleOpenStatusMenu = (event: React.MouseEvent<HTMLElement>) => {
      setStatusMenuAnchor(event.currentTarget)
      setMenuAnchor(null)
   }

   const handleStatusChange = async (status: UpdateApplicationStatus) => {
      if (isApplicationWithdrawn) return

      const config = getStatusConfig(status)

      handleCloseMenu()

      await showAlert({
         type: "confirm",
         title: "Change application status?",
         text: `Are you sure you want to change this application to ${config.label}?`,
         confirmText: "Yes, change",
         cancelText: "Cancel",
         onConfirm: async () => {
            try {
               await updateApplicationStatus({
                  applicationId: application.id,
                  status
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
                     text: `Application has been moved to ${config.label}.`
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
      })
   }

   const getEmploymentLabel = () => {
      return null
   }

   return (
      <>
         <tr className="border-b border-border transition hover:bg-bg/70">
            {/* Candidate */}
            <td className="px-3 py-4">
               <Box className="flex items-center gap-3">
                  <Avatar
                     src={application.user.profilePicUrl ?? undefined}
                     sx={{
                        width: 34,
                        height: 34,
                        fontSize: "12px"
                     }}>
                     {application.user.firstName?.charAt(0)}
                  </Avatar>

                  <Box>
                     <Typography className="text-[11px]! font-semibold!">
                        {fullName}
                     </Typography>

                     <Typography
                        className="mt-1! text-[9px]! text-muted"
                        color="textSecondary">
                        {application.user.email}
                     </Typography>
                  </Box>
               </Box>
            </td>

            {/* Job */}
            <td className="px-3 py-4">
               <Typography className="text-[11px]! font-semibold!">
                  {application.job.title}
               </Typography>

               {getEmploymentLabel() && (
                  <span className="mt-1 inline-flex rounded bg-violet-50 px-2 py-0.5 text-[9px] text-violet-600">
                     {getEmploymentLabel()}
                  </span>
               )}
            </td>

            {/* Status */}
            <td className="px-3 py-4">
               <ApplicationStatusBadge status={application.status} />
            </td>

            {/* Match Score */}
            <td className="px-3 py-4">
               <MatchScore score={application.matchScore} />
            </td>

            {/* Applied Date */}
            <td className="px-3 py-4">
               <Typography className="text-[10px]! whitespace-nowrap text-muted!">
                  {formattedDate}
               </Typography>
            </td>

            {/* Actions */}
            <td className="px-4 py-4">
               <Box className="flex justify-center gap-1">
                  <IconButton
                     size="small"
                     onClick={() => onViewApplication(application)}
                     className="border! border-border!">
                     <RemoveRedEyeOutlined
                        sx={{
                           fontSize: 16,
                           color: "#64748b"
                        }}
                     />
                  </IconButton>

                  <IconButton
                     size="small"
                     onClick={handleOpenMenu}
                     className="border! border-border!">
                     <MoreHoriz
                        sx={{
                           fontSize: 17,
                           color: "#64748b"
                        }}
                     />
                  </IconButton>
               </Box>
            </td>
         </tr>

         <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
               paper: {
                  className: "!rounded-xl !border !border-border !shadow-lg"
               }
            }}>
            {!isApplicationWithdrawn && (
               <MenuItem
                  onClick={handleOpenStatusMenu}
                  disabled={mutationPresentation.category === "loading"}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SwapHorizOutlined sx={{ fontSize: 18, color: "#475569" }} />
                  <Typography className="text-sm! font-medium! text-content">
                     Change Status
                  </Typography>
               </MenuItem>
            )}
         </Menu>

         <Menu
            anchorEl={statusMenuAnchor}
            open={Boolean(statusMenuAnchor)}
            onClose={handleCloseMenu}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            slotProps={{
               paper: {
                  className: "!rounded-xl !border !border-border !shadow-lg"
               }
            }}>
            {statusOptions.map(status => {
               const config = getStatusConfig(status)

               return (
                  <MenuItem
                     key={status}
                     onClick={() => handleStatusChange(status)}
                     sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                     <Box
                        component="span"
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[9px] font-semibold ${config.className}`}>
                        {config.icon}
                        {config.label}
                     </Box>
                  </MenuItem>
               )
            })}
         </Menu>
      </>
   )
}

export default ApplicationRow
