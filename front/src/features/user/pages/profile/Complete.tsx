import { useState } from "react"
import {
   Box,
   LinearProgress,
   Paper,
   Typography,
   IconButton,
   Collapse
} from "@mui/material"
import {
   CheckCircle,
   RadioButtonUnchecked,
   SchoolOutlined,
   BusinessCenterOutlined,
   HandymanOutlined,
   FolderOutlined,
   WorkspacePremiumOutlined,
   WorkOffOutlined,
   ExpandMore,
   ExpandLess
} from "@mui/icons-material"
import ProjectForm from "@/features/user/components/complete/ProjectForm"
import EducationForm from "@/features/user/components/complete/EducationForm"
import CertificateForm from "@/features/user/components/complete/CertificateForm"
import ExperienceForm from "@/features/user/components/complete/ExperienceForm"
import SkillForm from "@/features/user/components/complete/SkillForm"
import { useGetProfessionalProfileQuery } from "@/features/user/services/professionalProfileApiCalls"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import BasicInformationForm from "@/features/user/components/complete/BasicInformationForm"
import PageHeader from "@/features/user/components/PageHeader"

const profileSections = [
   {
      id: 1,
      title: "Basic Information",
      description: "Name, job title, short bio",
      completionKey: "basicInformation",
      icon: BusinessCenterOutlined,
      hasForm: true,
      component: BasicInformationForm
   },
   {
      id: 2,
      title: "Skills",
      description: "Add your technical and soft skills",
      completionKey: "skills",
      icon: HandymanOutlined,
      hasForm: true,
      component: SkillForm
   },
   {
      id: 4,
      title: "Projects",
      description: "Add projects you have worked on",
      completionKey: "projects",
      icon: FolderOutlined,
      hasForm: true,
      component: ProjectForm
   },
   {
      id: 5,
      title: "Education",
      description: "Add your educational background",
      completionKey: "educations",
      icon: SchoolOutlined,
      hasForm: true,
      component: EducationForm
   },
   {
      id: 6,
      title: "Certifications",
      description: "Add certificates and training courses",
      completionKey: "certificates",
      icon: WorkspacePremiumOutlined,
      hasForm: true,
      component: CertificateForm
   },
   {
      id: 7,
      title: "Work Experience",
      description: "Add your professional experience",
      completionKey: "experiences",
      icon: WorkOffOutlined,
      hasForm: true,
      component: ExperienceForm
   }
]
const statusConfig = {
   completed: {
      label: "Completed",
      color: "#16A34A",
      bg: "#ECFDF3",
      icon: CheckCircle
   },
   "not-added": {
      label: "Not Added",
      color: "#64748B",
      bg: "#F8FAFC",
      icon: RadioButtonUnchecked
   }
}
function ProfileCard({
   item,
   onClick,
   onSave,
   isExpanded,
   completion
}: {
   item: any
   onClick: () => void
   onSave: () => void
   isExpanded: boolean
   completion?: any
}) {
   const Icon = item.icon

   const isCompleted = completion?.[item.completionKey] === true

   const status = statusConfig[isCompleted ? "completed" : "not-added"]

   const StatusIcon = status.icon

   const FormComponent = item.component

   return (
      <Box className="col-span-1 w-full">
         <Paper
            className={`group cursor-pointer rounded-xl border px-4 py-3 transition-all duration-200 hover:border-[#D8CCFF] hover:shadow-sm ${
               isExpanded
                  ? "border-primary! bg-primary-tint!"
                  : "bg-mui-blue-100! border-[#E7EAF0]!"
            }`}
            elevation={0}
            onClick={onClick}>
            <Box className="flex items-center justify-between gap-4">
               <Box className="flex min-w-0 items-center gap-4">
                  <Box className="bg-primary-tint text-primary group-hover:bg-primary-dark group-hover:text-white flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition">
                     <Icon fontSize="small" />
                  </Box>

                  <Box className="min-w-0">
                     <Typography className="text-[16px]! font-bold!">
                        {item.title}
                     </Typography>

                     <Typography
                        className="mt-0.5! text-xs!"
                        color="textSecondary">
                        {item.description}
                     </Typography>
                  </Box>
               </Box>

               <Box className="flex shrink-0 items-center gap-2">
                  <Typography
                     className="text-[13px]! font-semibold!"
                     sx={{ color: status.color }}>
                     {status.label}
                  </Typography>

                  <StatusIcon
                     className="text-lg!"
                     sx={{ color: status.color }}
                  />

                  {item.hasForm && (
                     <IconButton
                        size="small"
                        className="ml-1">
                        {isExpanded ? <ExpandLess /> : <ExpandMore />}
                     </IconButton>
                  )}
               </Box>
            </Box>
         </Paper>

         {item.hasForm && FormComponent && (
            <Collapse
               in={isExpanded}
               timeout="auto"
               unmountOnExit>
               <Box className="mt-2 w-full">
                  <FormComponent
                     onSave={onSave}
                     onCancel={() => onClick()}
                  />
               </Box>
            </Collapse>
         )}
      </Box>
   )
}

export default function Complete() {
   const [expandedId, setExpandedId] = useState<number | null>(null)
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const { data: professionalProfileData } = useGetProfessionalProfileQuery(
      userId ?? "",
      {
         skip: !userId
      }
   )

   const completion = professionalProfileData?.data.completion

   const progress = completion?.percentage ?? 0

   const handleCardClick = (id: number) => {
      setExpandedId(prev => (prev === id ? null : id))
   }
   return (
      <Box
         className="min-h-screen"
         dir="ltr">
         <Box className="mx-auto max-w-300">
            <PageHeader
               title={<>Welcome back, Ahmed!</>}
               description="Complete your profile to get better job recommendations and increase your chances of finding the right opportunity."
            />

            {/* Profile Completion */}
            <Box>
               <Box className="mb-3 flex items-center justify-between">
                  <Typography className="text-lg! font-bold!">
                     Profile Completion
                  </Typography>

                  <Typography className="text-2xl! font-extrabold">
                     {progress}%
                  </Typography>
               </Box>

               <LinearProgress
                  className="h-3! rounded-[20px]!"
                  variant="determinate"
                  value={progress}
                  sx={{
                     "& .MuiLinearProgress-bar": {
                        background: "linear-gradient(90deg, #673DE6 0%, #7654F4 100%)"
                     }
                  }}
               />
            </Box>

            {/* Profile Sections */}
            <Box className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">
               {profileSections.map(item => (
                  <ProfileCard
                     key={item.id}
                     item={item}
                     completion={completion}
                     isExpanded={expandedId === item.id}
                     onClick={() => handleCardClick(item.id)}
                     onSave={() => setExpandedId(null)}
                  />
               ))}
            </Box>
         </Box>
      </Box>
   )
}
