import { Box, Button, Typography } from "@mui/material"

import { useState } from "react"

import SnapshotPersonalInfo from "./SnapshotPersonalInfo"
import SnapshotStats from "./SnapshotStats"
import SnapshotTabs, { type SnapshotTab } from "./SnapshotTabs"

import ExperienceSection from "./ExperienceSection"
import EducationSection from "./EducationSection"
import SkillsSection from "./SkillsSection"
import ProjectsSection from "./ProjectsSection"
import CertificatesSection from "./CertificatesSection"
import LanguagesSection from "./LanguagesSection"
import SnapshotEmptyState from "./SnapshotEmptyState"
import { useGetProfileSnapshotByAdminQuery } from "@/features/admin/services/adminApiCalls"
import { AdminProfileSnapshotSkeleton } from "@/features/admin/components/AdminSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

type ProfileSnapshotStepProps = {
   applicationId: string
}

const ProfileSnapshotStep = ({ applicationId }: ProfileSnapshotStepProps) => {
   const [activeTab, setActiveTab] = useState<SnapshotTab>("overview")

   const query = useGetProfileSnapshotByAdminQuery(applicationId)
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "section")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (isLoading) return <AdminProfileSnapshotSkeleton />

   if (
      queryPresentation.category === "section_error" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-64 flex-col items-center justify-center gap-3">
            <Typography className="text-sm! text-red-600!" role="alert" aria-live="assertive">
               {queryPresentation.message}
            </Typography>
            <Button onClick={query.refetch} className="normal-case!">
               Retry
            </Button>
         </Box>
      )
   }

   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }

   if (
      queryPresentation.category === "silent" &&
      (queryState.status !== "aborted" || queryState.data === undefined)
   )
      return null

   if (queryState.status === "inconsistent" || !response) {
      return (
         <Box className="flex flex-col items-center gap-3 py-10 text-center" role="alert" aria-live="assertive">
            <Typography className="text-sm! text-muted!">
               {queryPresentation.message ?? "Profile snapshot could not be determined."}
            </Typography>
            <Button onClick={query.refetch} className="normal-case!">
               Retry
            </Button>
         </Box>
      )
   }

   const snapshot = response.data.profileSnapshot

   if (!snapshot) {
      if (queryPresentation.category === "stale_error") {
         return (
            <Box className="flex flex-col items-center gap-3 py-10 text-center">
               <Typography className="text-sm! text-amber-900!" role="status" aria-live="polite">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="normal-case!">
                  Retry
               </Button>
            </Box>
         )
      }
      return <SnapshotEmptyState />
   }

   return (
      <Box className="space-y-4">
         {queryPresentation.category === "stale_error" && (
            <Box className="flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" role="status" aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button onClick={query.refetch} className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}
         {/* Personal Information */}
         <SnapshotPersonalInfo snapshot={snapshot} />

         {/* Statistics */}
         <SnapshotStats snapshot={snapshot} />

         {/* Navigation */}
         <SnapshotTabs
            activeTab={activeTab}
            onChange={setActiveTab}
         />

         {/* Overview */}
         {activeTab === "overview" && (
            <Box className="grid grid-cols-1 gap-4 xl:grid-cols-2">
               <Box>
                  <ExperienceSection experiences={snapshot.experiences} />
               </Box>

               <Box className="space-y-4">
                  <EducationSection educations={snapshot.educations} />

                  <SkillsSection skills={snapshot.skills} />
               </Box>

               <Box className="xl:col-span-2">
                  <ProjectsSection projects={snapshot.projects} />
               </Box>

               <CertificatesSection certificates={snapshot.certificates} />

               <LanguagesSection languages={snapshot.languages} />
            </Box>
         )}

         {/* Experience */}
         {activeTab === "experience" && (
            <ExperienceSection experiences={snapshot.experiences} />
         )}

         {/* Education */}
         {activeTab === "education" && (
            <EducationSection educations={snapshot.educations} />
         )}

         {/* Projects */}
         {activeTab === "projects" && <ProjectsSection projects={snapshot.projects} />}

         {/* Skills */}
         {activeTab === "skills" && <SkillsSection skills={snapshot.skills} />}

         {/* Certificates */}
         {activeTab === "certificates" && (
            <CertificatesSection certificates={snapshot.certificates} />
         )}

         {/* Languages */}
         {activeTab === "languages" && (
            <LanguagesSection languages={snapshot.languages} />
         )}
      </Box>
   )
}

export default ProfileSnapshotStep
