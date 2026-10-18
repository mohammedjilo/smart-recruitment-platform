import { ArrowBack, PersonOutlineOutlined } from "@mui/icons-material"
import { Avatar, Box, Button, Typography } from "@mui/material"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import type { ProfileSnapshot } from "@/types/admin"
import { useGetCompleteUserProfileQuery } from "@/features/user/services/userApiCalls"
import SnapshotStats from "@/features/admin/components/applicationDetails/profileSnapshotStep/SnapshotStats"
import SnapshotTabs, {
   type SnapshotTab
} from "@/features/admin/components/applicationDetails/profileSnapshotStep/SnapshotTabs"
import ExperienceSection from "@/features/admin/components/applicationDetails/profileSnapshotStep/ExperienceSection"
import EducationSection from "@/features/admin/components/applicationDetails/profileSnapshotStep/EducationSection"
import SkillsSection from "@/features/admin/components/applicationDetails/profileSnapshotStep/SkillsSection"
import ProjectsSection from "@/features/admin/components/applicationDetails/profileSnapshotStep/ProjectsSection"
import CertificatesSection from "@/features/admin/components/applicationDetails/profileSnapshotStep/CertificatesSection"
import LanguagesSection from "@/features/admin/components/applicationDetails/profileSnapshotStep/LanguagesSection"
import { CompanyCandidateProfileSkeleton } from "@/features/company/components/CompanySkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

const CandidateProfilePage = () => {
   const navigate = useNavigate()
   const { userId } = useParams<{ userId: string }>()
   const [activeTab, setActiveTab] = useState<SnapshotTab>("overview")
   const query = useGetCompleteUserProfileQuery(userId ?? "", {
      skip: !userId
   })
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (!userId) {
      return (
         <Box className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <PersonOutlineOutlined className="text-muted!" />
            <Typography className="text-muted text-sm!">
               Select an application to view the candidate profile.
            </Typography>
            <Button
               startIcon={<ArrowBack />}
               onClick={() => navigate("/company/applications")}
               className="normal-case!">
               Back to Applications
            </Button>
         </Box>
      )
   }

   if (isLoading) {
      return <CompanyCandidateProfileSkeleton />
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Typography
               className="text-muted text-sm!"
               role="alert"
               aria-live="assertive">
               {queryPresentation.message}
            </Typography>
            <Button
               onClick={query.refetch}
               className="normal-case!">
               Retry
            </Button>
            <Button
               startIcon={<ArrowBack />}
               onClick={() => navigate("/company/applications")}
               className="normal-case!">
               Back to Applications
            </Button>
         </Box>
      )
   }
   if (queryPresentation.category === "silent" && queryState.status !== "aborted")
      return null
   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }
   if (!response?.data) {
      return (
         <Box className="text-muted py-10 text-center text-sm">
            Candidate profile could not be determined.
         </Box>
      )
   }

   const profile = response.data
   const professionalProfile = profile.professionalProfile
   const fullName = `${profile.firstName} ${profile.lastName}`
   const experiencesList = professionalProfile?.experiences ?? []
   const experiences: ProfileSnapshot["experiences"] = experiencesList.map(
      (experience: (typeof experiencesList)[number]) => ({
         companyName: experience.companyName,
         description: experience.description ?? "",
         position: experience.position,
         startDate: experience.startDate,
         endDate: experience.endDate
      })
   )
   const projectsList = professionalProfile?.projects ?? []
   const projects: ProfileSnapshot["projects"] = projectsList.map(
      (project: (typeof projectsList)[number]) => ({
         title: project.title,
         description: project.description ?? ""
      })
   )
   const profileView: ProfileSnapshot = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone ?? "",
      country: profile.country,
      age: "",
      jobTitle: professionalProfile?.jobTitle ?? "",
      yearsOfExperience: professionalProfile?.yearsOfExperience ?? null,
      educations: professionalProfile?.educations ?? [],
      experiences,
      projects,
      certificates: professionalProfile?.certificates ?? [],
      skills: profile.skills.map(
         (skill: (typeof profile.skills)[number]) => skill.skillName
      ),
      languages: profile.languages.map(
         (language: (typeof profile.languages)[number]) => ({
            language: language.languageName
         })
      )
   }

   return (
      <Box className="w-full space-y-5">
         {queryPresentation.category === "stale_error" && (
            <Box
               className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3"
               role="status"
               aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button
                  onClick={query.refetch}
                  className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}
         <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate("/company/users")}
            variant="outlined"
            color="primary"
            className="my-2! normal-case!">
            Back to Users
         </Button>

         <Box className="bg-surface rounded-xl border p-5 shadow-none">
            <Box className="flex items-center gap-4">
               <Avatar
                  src={profile.profilePicUrl ?? undefined}
                  alt={fullName}
                  className="h-20! w-20! text-2xl!">
                  {profile.firstName.charAt(0)}
               </Avatar>
               <Box className="min-w-0">
                  <Typography className="text-content text-xl! font-bold!">
                     {fullName}
                  </Typography>
                  <Typography className="text-muted mt-1! text-sm!">
                     {professionalProfile?.jobTitle || "Professional Profile"}
                  </Typography>
                  {profile.country && (
                     <Typography className="text-muted mt-1! text-xs!">
                        {profile.country}
                     </Typography>
                  )}
               </Box>
            </Box>
         </Box>

         <SnapshotStats snapshot={profileView} />

         <SnapshotTabs
            activeTab={activeTab}
            onChange={setActiveTab}
         />

         {activeTab === "overview" && (
            <Box className="grid grid-cols-1 gap-4 xl:grid-cols-2">
               <ExperienceSection experiences={profileView.experiences} />
               <Box className="space-y-4">
                  <EducationSection educations={profileView.educations} />
                  <SkillsSection skills={profileView.skills} />
               </Box>
               <Box className="xl:col-span-2">
                  <ProjectsSection projects={profileView.projects} />
               </Box>
               <CertificatesSection certificates={profileView.certificates} />
               <LanguagesSection languages={profileView.languages} />
            </Box>
         )}
         {activeTab === "experience" && (
            <ExperienceSection experiences={profileView.experiences} />
         )}
         {activeTab === "education" && (
            <EducationSection educations={profileView.educations} />
         )}
         {activeTab === "projects" && <ProjectsSection projects={profileView.projects} />}
         {activeTab === "skills" && <SkillsSection skills={profileView.skills} />}
         {activeTab === "certificates" && (
            <CertificatesSection certificates={profileView.certificates} />
         )}
         {activeTab === "languages" && (
            <LanguagesSection languages={profileView.languages} />
         )}
      </Box>
   )
}

export default CandidateProfilePage
