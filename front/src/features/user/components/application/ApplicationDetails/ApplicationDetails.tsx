import { useRef, useState } from "react"
import {
   Box,
   Button,
   Chip,
   Divider,
   IconButton,
   Paper,
   TextField,
   Typography
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CancelIcon from "@mui/icons-material/Cancel"
import SendOutlinedIcon from "@mui/icons-material/SendOutlined"
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import TuneIcon from "@mui/icons-material/Tune"
import formatCreatedAt from "@/utils/formatDate"
import { useWithdrawApplicationMutation } from "@/services/shared/applicationApiCalls"
import { useSendApplicationMessageMutation } from "@/services/shared/messageApiCalls"
import { showAlert } from "@/utils/swal"
import { useNavigate } from "react-router-dom"
import { CompanyLogo, getCompanyName, getJobTitle } from "../ApplicationItem"
import ApplicationStatusChip from "@/components/common/ApplicationStatusChip"
import type { UserApplicationDetails } from "@/types/api/applications"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import ApplicationAnswers from "./ApplicationAnswers"
import ApplicationMatchScore from "./ApplicationMatchScore"
import { canWithdrawApplication } from "@/utils/applicationWithdrawal"

const normalizeArray = (value: unknown): string[] => {
   if (!value) return []

   if (Array.isArray(value)) {
      return value
         .map(item => {
            if (typeof item === "string") return item

            if (typeof item === "object" && item !== null && "name" in item) {
               return String((item as { name?: unknown }).name ?? "")
            }

            return String(item)
         })
         .filter(Boolean)
   }

   if (typeof value === "string") {
      return value
         .split(",")
         .map(item => item.trim())
         .filter(Boolean)
   }

   return []
}

interface ApplicationDetailsProps {
   application: UserApplicationDetails
   onClose: () => void
}
export const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
   application,
   onClose
}) => {
   const navigate = useNavigate()
   const [message, setMessage] = useState("")
   const [isComposerOpen, setIsComposerOpen] = useState(false)
   const [areAnswersVisible, setAreAnswersVisible] = useState(false)
   const withdrawalInProgress = useRef(false)
   const [withdrawApplication, withdrawResult] = useWithdrawApplicationMutation()
   const withdrawState = getMutationState(withdrawResult)
   const withdrawPresentation = getMutationPresentation(withdrawState, {
      surface: "action",
      importance: "important"
   })
   const [sendMessage, sendMessageResult] = useSendApplicationMessageMutation()
   const sendMessageState = getMutationState(sendMessageResult)
   const sendMessagePresentation = getMutationPresentation(sendMessageState, {
      surface: "action",
      importance: "routine"
   })
   const isSendingMessage = sendMessagePresentation.category === "loading"
   const isWithdrawing = withdrawPresentation.category === "loading"

   const strengths = normalizeArray(application.strengths)

   const missingSkills = normalizeArray(application.missingSkills)

   const answers = application.answers

   const score = Math.round(application.matchScore ?? 0)

   const handleWithdraw = async () => {
      if (withdrawalInProgress.current || !canWithdrawApplication(application.status)) {
         return
      }

      withdrawalInProgress.current = true
      try {
         const isAccepted = application.status === "ACCEPTED"
         const result = await showAlert({
            type: "confirm",
            title: isAccepted
               ? "Withdraw Accepted Application?"
               : "Withdraw Application?",
            text: isAccepted
               ? "The company has accepted your application. If you withdraw, the company will be notified. This action cannot be undone through the usual process."
               : "This action cannot be undone.",
            confirmText: isAccepted ? "Confirm withdrawal" : "Yes, withdraw",
            cancelText: isAccepted ? "Keep application" : "Cancel"
         })

         if (!result?.isConfirmed) return

         await withdrawApplication({
            applicationId: application.id,
            userId: application.userId,
            jobId: application.jobId
         }).unwrap()
         if (
            getMutationPresentation(
               { status: "success" },
               { surface: "action", importance: "important" }
            ).category === "contextual_success"
         ) {
            await showAlert({
               type: "success",
               title: "Application Withdrawn",
               text: "Your application has been withdrawn successfully."
            })
         }
         onClose()
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "important"
         })
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Withdrawal Failed",
            text: errorPresentation.message
         })
      } finally {
         withdrawalInProgress.current = false
      }
   }

   const handleSendMessage = async () => {
      const content = message.trim()
      if (!content || isSendingMessage) return

      try {
         await sendMessage({
            applicationId: application.id,
            userId: application.userId,
            content
         }).unwrap()
         setMessage("")
         setIsComposerOpen(false)
         navigate("/messages")
      } catch (error) {
         const errorPresentation = getMutationPresentation(getMutationErrorState(error), {
            surface: "action",
            importance: "routine"
         })
         if (errorPresentation.category === "silent") return
         await showAlert({
            type: "error",
            title: "Message Failed",
            text: errorPresentation.message
         })
      }
   }

   return (
      <Paper
         className="bg-surface! h-fit overflow-hidden rounded-xl! border! border-[#E7EAF0]!"
         elevation={0}>
         {/* =================================================
             Details Header
         ================================================= */}

         <Box className="flex items-start justify-between border-b border-[#E7EAF0] p-5">
            <Box className="flex min-w-0 items-center gap-3">
               <CompanyLogo application={application} />

               <Box className="min-w-0">
                  <Typography className="truncate! text-base! font-bold!">
                     {getJobTitle(application)}
                  </Typography>

                  <Typography
                     className="truncate! text-sm!"
                     color="textSecondary">
                     {getCompanyName(application)}
                  </Typography>
               </Box>
            </Box>

            <IconButton
               className="shrink-0"
               size="small"
               onClick={onClose}>
               <CloseIcon fontSize="small" />
            </IconButton>
         </Box>

         {/* =================================================
             Status + Date
         ================================================= */}

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

         {/* =================================================
             Match Score
         ================================================= */}

         <ApplicationMatchScore score={score} />

         <Divider />

         {/* =================================================
             AI Recommendation
         ================================================= */}

         {application.recommendation && (
            <Box className="p-5">
               <Box className="rounded-lg border border-[#E8E2FF] bg-[#FCFAFF] p-4">
                  <Box className="mb-2 flex items-center gap-2">
                     <AutoAwesomeIcon
                        className="text-[#6741E8]!"
                        fontSize="small"
                     />

                     <Typography className="text-sm! font-semibold! text-[#17213B]!">
                        AI Recommendation
                     </Typography>
                  </Box>

                  <Typography className="text-xs! leading-5! text-[#64748B]!">
                     {application.recommendation}
                  </Typography>
               </Box>
            </Box>
         )}

         {/* =================================================
             Strengths
         ================================================= */}

         {strengths.length > 0 && (
            <Box className="px-5 pb-5">
               <Box className="mb-3 flex items-center gap-2">
                  <CheckCircleIcon
                     className="text-[#10B981]!"
                     fontSize="small"
                  />

                  <Typography className="text-sm! font-semibold! text-[#17213B]!">
                     Top Strengths
                  </Typography>
               </Box>

               <Box className="flex flex-wrap gap-2">
                  {strengths.map((strength, index) => (
                     <Chip
                        className="bg-[#ECFDF5]! text-[#059669]!"
                        key={`${strength}-${index}`}
                        icon={<CheckCircleIcon fontSize="small" />}
                        label={strength}
                        size="small"
                        sx={{
                           "& .MuiChip-icon": {
                              color: "#10B981"
                           }
                        }}
                     />
                  ))}
               </Box>
            </Box>
         )}

         {/* =================================================
             Missing Skills
         ================================================= */}

         {missingSkills.length > 0 && (
            <Box className="border-t border-[#E7EAF0] px-5 py-5">
               <Box className="mb-3 flex items-center gap-2">
                  <TuneIcon
                     className="text-[#F59E0B]!"
                     fontSize="small"
                  />

                  <Typography className="text-sm! font-semibold! text-[#17213B]!">
                     Missing Skills
                  </Typography>
               </Box>

               <Box className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, index) => (
                     <Chip
                        className="bg-[#FFF8E7]! text-[#D97706]!"
                        key={`${skill}-${index}`}
                        label={skill}
                        size="small"
                     />
                  ))}
               </Box>
            </Box>
         )}

         {/* =================================================
             Resume
         ================================================= */}

         <Box className="border-t border-[#E7EAF0] px-5 py-4">
            <Box className="flex items-center justify-between gap-4">
               <Box className="flex items-center gap-3">
                  <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8FAFC]">
                     <DescriptionOutlinedIcon
                        className="text-[#64748B]!"
                        fontSize="small"
                     />
                  </Box>

                  <Box>
                     <Typography className="text-sm! font-semibold! text-[#334155]!">
                        Resume Type
                     </Typography>

                     <Typography className="text-xs! text-[#64748B]!">
                        {application.resumeType || "Uploaded CV"}
                     </Typography>
                  </Box>
               </Box>

               {application.cvUrl && (
                  <Button
                     className="normal-case!"
                     href={application.cvUrl}
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

         {/* =================================================
             Answers
         ================================================= */}

         <ApplicationAnswers
            answers={answers}
            expanded={areAnswersVisible}
            onToggle={() => setAreAnswersVisible(visible => !visible)}
         />

         <Box className="px-5 pb-4">
            {isComposerOpen ? (
               <Box className="mt-4 rounded-lg border border-[#E8E2FF] bg-[#FCFAFF] p-3">
                  <TextField
                     placeholder="Write a message to the company..."
                     value={message}
                     fullWidth
                     maxRows={6}
                     minRows={3}
                     multiline
                     onChange={event => setMessage(event.target.value)}
                  />
                  <Box className="mt-2 flex justify-end gap-2">
                     <Button
                        className="normal-case!"
                        size="small"
                        variant="outlined"
                        onClick={() => {
                           setMessage("")
                           setIsComposerOpen(false)
                        }}>
                        Cancel
                     </Button>
                     <Button
                        className="normal-case!"
                        disabled={!message.trim() || isSendingMessage}
                        size="small"
                        startIcon={<SendOutlinedIcon />}
                        variant="contained"
                        onClick={() => void handleSendMessage()}>
                        {isSendingMessage ? "Sending..." : "Send"}
                     </Button>
                  </Box>
               </Box>
            ) : (
               <Button
                  className="mt-4! normal-case!"
                  fullWidth
                  size="small"
                  startIcon={<SendOutlinedIcon />}
                  variant="contained"
                  onClick={() => setIsComposerOpen(true)}>
                  Message Company
               </Button>
            )}

            {canWithdrawApplication(application.status) && (
               <Button
                  className="mt-3! w-full! border! border-[#64748B]! bg-[#F1F5F9]! text-[#64748B]! normal-case!"
                  disabled={isWithdrawing}
                  size="small"
                  onClick={() => void handleWithdraw()}>
                  <CancelIcon />
                  {isWithdrawing ? "Withdrawing..." : "Withdraw Application"}
               </Button>
            )}
         </Box>
      </Paper>
   )
}
