import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined"
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import type { CompanyJob } from "@/types/company"
import { formatDate, getStatusStyle } from "@/utils/jobDetails.utils"
import { Box, Button, Menu, MenuItem, Typography } from "@mui/material"
import { ArrowBack } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

type JobDetailsHeaderProps = {
   job: CompanyJob
   onEdit: () => void
   isUpdating?: boolean
   onCloseJob: () => void
   onReopenJob: () => void
}

const JobDetailsHeader = ({
   job,
   onEdit,
   isUpdating = false,
   onCloseJob,
   onReopenJob
}: JobDetailsHeaderProps) => {
   const navigate = useNavigate()
   const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
   const isJobOpen = job.status === "OPEN"
   const canToggleStatus = ["OPEN", "CLOSED", "DRAFT", "EXPIRED"].includes(job.status)

   const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
      setMenuAnchor(event.currentTarget)
   }

   const handleMenuClose = () => {
      setMenuAnchor(null)
   }

   return (
      <Box className="contents">
         <Button
            className="my-2! normal-case!"
            startIcon={<ArrowBack />}
            variant="outlined"
            onClick={() => navigate("/company/jobs")}>
            Back to My Jobs
         </Button>
         <Typography className="text-content mb-5! text-[26px]! font-bold!">
            Job Details
         </Typography>

         <Box className="bg-surface flex flex-col gap-5 rounded-xl border p-5 lg:flex-row lg:items-center lg:justify-between">
            <Box className="flex items-center gap-4">
               <Box className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#4f20e8] text-white">
                  <BusinessCenterOutlinedIcon />
               </Box>

               <Box>
                  <Box className="flex flex-wrap items-center gap-3">
                     <Typography className="text-xl! font-bold!">{job.title}</Typography>

                     <Typography
                        className={`rounded-md! px-2! py-1! text-[10px]! font-bold! ${getStatusStyle(job.status)} `}>
                        {job.status}
                     </Typography>
                  </Box>

                  <Typography
                     className="mt-2! text-xs!"
                     color="textSecondary">
                     Created on {formatDate(job.createdAt)}
                     <span className="mx-2">•</span>
                     Updated on {formatDate(job.updatedAt)}
                  </Typography>
               </Box>
            </Box>

            <Box className="flex flex-wrap items-center gap-2">
               <Button
                  className="border-border! bg-surface! text-content! hover:bg-bg! flex! items-center! gap-2! rounded-lg! border! px-4! py-2.5! text-sm! font-medium! capitalize! transition!"
                  onClick={onEdit}>
                  <EditOutlinedIcon className="text-lg!" />
                  Edit Job
               </Button>

               <Button
                  className="border-border! bg-surface! text-muted! hover:bg-bg! flex! h-10! w-10! items-center! justify-center! rounded-lg! border! capitalize! transition!"
                  onClick={handleMenuOpen}>
                  <MoreHorizIcon />
               </Button>

               <Menu
                  anchorEl={menuAnchor}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  open={Boolean(menuAnchor)}
                  slotProps={{
                     paper: {
                        className: "!rounded-xl !border !border-border !shadow-lg"
                     }
                  }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  onClose={handleMenuClose}>
                  {canToggleStatus && (
                     <MenuItem
                        className={`${isJobOpen ? "text-red-600!" : "text-green-600!"} flex! items-center! gap-2!`}
                        disabled={isUpdating}
                        onClick={() => {
                           job.status === "EXPIRED" ? onReopenJob() : onCloseJob()
                           handleMenuClose()
                        }}>
                        {isJobOpen ? (
                           <CloseOutlinedIcon className="text-lg!" />
                        ) : (
                           <LockOpenOutlinedIcon className="text-lg!" />
                        )}
                        <span className="text-sm font-medium">
                           {isJobOpen
                              ? "Close Job"
                              : job.status === "EXPIRED"
                                ? "Reopen Job"
                                : "Open Job"}
                        </span>
                     </MenuItem>
                  )}
               </Menu>
            </Box>
         </Box>
      </Box>
   )
}

export default JobDetailsHeader
