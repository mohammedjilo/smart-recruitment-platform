import { Box, Button, Typography } from "@mui/material"
import { useSelector } from "react-redux"
import { useGetCompleteUserProfileQuery } from "@/features/user/services/userApiCalls"
import type { RootState } from "@/redux/store"
import ProfileHeader from "@/features/user/components/myProfile/ProfileHeader"
import ProfessionalProfileCard from "@/features/user/components/myProfile/ProfessionalProfileCard"
import SkillsCard from "@/features/user/components/myProfile/SkillsCard"
import LanguagesCard from "@/features/user/components/myProfile/LanguagesCard"
import EducationCard from "@/features/user/components/myProfile/EducationCard"
import ExperienceCard from "@/features/user/components/myProfile/ExperienceCard"
import ProjectsCard from "@/features/user/components/myProfile/ProjectsCard"
import ProfileOverviewCard from "@/features/user/components/myProfile/ProfileOverviewCard"
import CertificatesCard from "@/features/user/components/myProfile/CertificatesCard"
import { UserProfileSkeleton } from "@/features/user/components/UserSkeletons"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"
import PageHeader from "@/features/user/components/PageHeader"

const MyProfilePage = () => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const query = useGetCompleteUserProfileQuery(userId ?? "", {
      skip: !userId
   })
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "page")
   const response = "data" in queryState ? queryState.data : undefined
   const isLoading = queryPresentation.category === "loading"

   if (isLoading) {
      return <UserProfileSkeleton />
   }

   if (
      queryPresentation.category === "page_error" ||
      queryPresentation.category === "authentication_notice" ||
      queryPresentation.category === "access_denied" ||
      queryPresentation.category === "resource_not_found"
   ) {
      return (
         <Box className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
            <Typography aria-live="assertive" color="error" role="alert">
               {queryPresentation.message}
            </Typography>
            <Button className="normal-case!" onClick={query.refetch}>
               Retry
            </Button>
         </Box>
      )
   }
   if (queryPresentation.category === "silent" && queryState.status !== "aborted") return null
   if (
      queryState.status === "idle" ||
      (queryState.status === "aborted" && queryState.data === undefined)
   ) {
      return null
   }
   if (!response?.data) {
      return (
         <Box className="py-10 text-center">
            <Typography className="text-sm!" color="textSecondary">
               Profile data could not be determined.
            </Typography>
         </Box>
      )
   }

   const profile = response.data
   const professionalProfile = profile.professionalProfile

   return (
      <Box className="w-full">
         {queryPresentation.category === "stale_error" && (
            <Box className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3" aria-live="polite" role="status">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button className="normal-case!" onClick={query.refetch}>
                  Retry
               </Button>
            </Box>
         )}
         <PageHeader
            description="View and manage your personal and professional information."
            title="My Profile"
         />

         {/* Personal Information */}
         <ProfileHeader profile={profile} />

         <Box className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
            {/* LEFT COLUMN */}
            <Box className="flex flex-col gap-5">
               <ProfessionalProfileCard professionalProfile={professionalProfile} />

               <SkillsCard skills={profile.skills} />

               <LanguagesCard languages={profile.languages} />

               <EducationCard educations={professionalProfile?.educations ?? []} />

               <ExperienceCard experiences={professionalProfile?.experiences ?? []} />

               <ProjectsCard projects={professionalProfile?.projects ?? []} />
            </Box>

            {/* RIGHT COLUMN */}
            <Box className="flex flex-col gap-5">
               <ProfileOverviewCard stats={profile.stats} />

               <CertificatesCard certificates={professionalProfile?.certificates ?? []} />
            </Box>
         </Box>
      </Box>
   )
}

export default MyProfilePage
