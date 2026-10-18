import { useGetAdminUserProfessionalProfileQuery } from "@/features/admin/services/adminApiCalls"
import type { AdminUserProfessionalProfile } from "@/types/admin"
import { formatDate } from "@/utils/formatDate"
import {
   AccountTreeOutlined,
   BusinessCenterOutlined,
   DescriptionOutlined,
   OpenInNewOutlined,
   SchoolOutlined,
   WorkspacePremiumOutlined,
   WorkOutlined
} from "@mui/icons-material"
import { Box, Button, Chip, Skeleton, Typography } from "@mui/material"
import type { ReactNode } from "react"
import { getQueryState } from "@/utils/queryState"
import { getQueryPresentation } from "@/utils/presentationPolicy"

type Props = {
   userId: string
}

const ProfileSection = ({
   title,
   icon,
   children
}: {
   title: string
   icon: ReactNode
   children: ReactNode
}) => (
   <Box className="flex gap-3 border-t py-4 first:border-0 first:pt-0">
      <Box className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
         {icon}
      </Box>
      <Box className="min-w-0 flex-1">
         <Typography className="text-content mb-3! text-sm! font-semibold!">
            {title}
         </Typography>
         {children}
      </Box>
   </Box>
)

const dateRange = (startDate: string, endDate: string | null) =>
   `${formatDate(startDate)} - ${endDate ? formatDate(endDate) : "Present"}`

const ProfessionalProfile = ({ userId }: Props) => {
   const query = useGetAdminUserProfessionalProfileQuery(userId, {
      skip: !userId
   })
   const queryState = getQueryState(query)
   const queryPresentation = getQueryPresentation(queryState, "section")
   const response = "data" in queryState ? queryState.data : undefined
   const profile = response?.data
   const isLoading = queryPresentation.category === "loading"

   return (
      <Box className="bg-surface rounded-xl border p-5 shadow-sm">
         <Box className="border-border border-b pb-4">
            <Box className="flex items-center gap-3">
               <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                  <BusinessCenterOutlined fontSize="small" />
               </Box>

               <Box>
                  <Typography className="text-content text-[16px]! font-semibold!">
                     Professional Profile
                  </Typography>

                  <Typography className="text-muted mt-1! text-sm!">
                     Education, experience, skills, and projects.
                  </Typography>
               </Box>
            </Box>
         </Box>

         {queryPresentation.category === "stale_error" && (
            <Box className="flex items-center justify-between gap-3 border-b border-amber-200 bg-amber-50 px-4 py-3" role="status" aria-live="polite">
               <Typography className="text-sm! text-amber-900!">
                  {queryPresentation.message}
               </Typography>
               <Button
                  onClick={() => void query.refetch()}
                  className="normal-case!">
                  Retry
               </Button>
            </Box>
         )}

         {isLoading ? (
            <Box className="space-y-4 pt-5">
               <Skeleton
                  variant="text"
                  width="42%"
                  height={30}
               />
               <Skeleton
                  variant="text"
                  width="30%"
               />
               {[0, 1, 2, 3].map(item => (
                  <Box
                     key={item}
                     className="border-border flex gap-3 border-t pt-4">
                     <Skeleton
                        variant="rounded"
                        width={36}
                        height={36}
                     />
                     <Box className="flex-1 space-y-2">
                        <Skeleton
                           variant="text"
                           width="28%"
                        />
                        <Skeleton
                           variant="text"
                           width="75%"
                        />
                     </Box>
                  </Box>
               ))}
            </Box>
         ) : queryPresentation.category === "section_error" ||
           queryPresentation.category === "access_denied" ||
           queryPresentation.category === "authentication_notice" ||
           queryPresentation.category === "resource_not_found" ? (
            <Box className="flex min-h-64 items-center justify-center px-6 text-center" role="alert" aria-live="assertive">
               <Typography className="text-sm! text-red-600">
                  {queryPresentation.message}
               </Typography>
               <Button
                  onClick={() => void query.refetch()}
                  className="ml-3! normal-case!">
                  Retry
               </Button>
            </Box>
         ) : queryPresentation.category === "silent" ? null : queryState.status === "idle" ? (
            <Box className="flex min-h-64 items-center justify-center px-6 text-center">
               <Typography className="text-sm! text-muted!">
                  No professional profile query has started.
               </Typography>
            </Box>
         ) : !profile ? (
            <Box className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
               <Typography className="text-content font-semibold!">
                  No professional profile
               </Typography>
               <Typography className="text-muted mt-2! text-sm!">
                  This user has not created a professional profile yet.
               </Typography>
            </Box>
         ) : (
            <ProfileContent profile={profile} />
         )}
      </Box>
   )
}

const ProfileContent = ({ profile }: { profile: AdminUserProfessionalProfile }) => (
   <Box className="pt-4">
      <Box className="mb-4 flex flex-wrap items-start justify-between gap-4">
         <Box>
            <Typography className="text-base! font-bold!">
               {profile.jobTitle || "Professional profile"}
            </Typography>
            <Typography
               className="mt-1! text-sm!"
               color="textSecondary">
               {profile.yearsOfExperience === null
                  ? "Years of experience not provided"
                  : `${profile.yearsOfExperience} years of experience`}
            </Typography>
         </Box>
         {profile.cvPath && /^https?:\/\//i.test(profile.cvPath) && (
            <Button
               component="a"
               href={profile.cvPath}
               target="_blank"
               rel="noreferrer"
               size="small"
               endIcon={<OpenInNewOutlined />}
               className="border-border! bg-surface! text-content! rounded-lg! normal-case!">
               Open CV
            </Button>
         )}
      </Box>

      <ProfileSection
         title="Summary"
         icon={<DescriptionOutlined fontSize="small" />}>
         <Typography className="text-sm! whitespace-pre-wrap!">
            {profile.summary || "No summary provided."}
         </Typography>
      </ProfileSection>

      <ProfileSection
         title="Skills"
         icon={<BusinessCenterOutlined fontSize="small" />}>
         {profile.skills.length ? (
            <Box className="flex flex-wrap gap-2">
               {profile.skills.map(skill => (
                  <Chip
                     key={skill.id}
                     label={skill.skillName}
                     size="small"
                     className="border! border-violet-100! bg-violet-50! text-violet-700!"
                  />
               ))}
            </Box>
         ) : (
            <Typography className="text-muted text-sm!">No skills added.</Typography>
         )}
      </ProfileSection>

      <ProfileSection
         title="Experience"
         icon={<WorkOutlined fontSize="small" />}>
         {profile.experiences.length ? (
            <Box className="divide-border divide-y">
               {profile.experiences.map(experience => (
                  <Box
                     key={experience.id}
                     className="py-3 first:pt-0 last:pb-0">
                     <Typography className="text-sm! font-semibold!">
                        {experience.position} · {experience.companyName}
                     </Typography>
                     {experience.description && (
                        <Typography
                           className="mt-2! text-sm! whitespace-pre-wrap!"
                           color="textSecondary">
                           {experience.description}
                        </Typography>
                     )}
                     <Typography
                        className="mt-1! text-xs!"
                        color="textSecondary">
                        {dateRange(experience.startDate, experience.endDate)}
                     </Typography>
                  </Box>
               ))}
            </Box>
         ) : (
            <Typography className="text-muted text-sm!">No experience added.</Typography>
         )}
      </ProfileSection>

      <ProfileSection
         title="Education"
         icon={<SchoolOutlined fontSize="small" />}>
         {profile.educations.length ? (
            <Box className="divide-border divide-y">
               {profile.educations.map(education => (
                  <Box
                     key={education.id}
                     className="py-3 first:pt-0 last:pb-0">
                     <Typography className="text-sm! font-semibold!">
                        {education.degree} in {education.major}
                     </Typography>
                     <Typography
                        className="mt-1! text-sm!"
                        color="textSecondary">
                        {education.university}
                     </Typography>
                     <Typography
                        className="mt-1! text-xs!"
                        color="textSecondary">
                        {dateRange(education.startDate, education.endDate)}
                     </Typography>
                  </Box>
               ))}
            </Box>
         ) : (
            <Typography className="text-muted text-sm!">No education added.</Typography>
         )}
      </ProfileSection>

      <ProfileSection
         title="Projects"
         icon={<AccountTreeOutlined fontSize="small" />}>
         {profile.projects.length ? (
            <Box className="divide-border divide-y">
               {profile.projects.map(project => (
                  <Box
                     key={project.id}
                     className="py-3 first:pt-0 last:pb-0">
                     <Typography className="text-sm! font-semibold!">
                        {project.title}
                     </Typography>
                     {project.description && (
                        <Typography
                           className="mt-1! text-sm! whitespace-pre-wrap!"
                           color="textSecondary">
                           {project.description}
                        </Typography>
                     )}
                  </Box>
               ))}
            </Box>
         ) : (
            <Typography className="text-muted text-sm!">No projects added.</Typography>
         )}
      </ProfileSection>

      <ProfileSection
         title="Certificates"
         icon={<WorkspacePremiumOutlined fontSize="small" />}>
         {profile.certificates.length ? (
            <Box className="divide-border divide-y">
               {profile.certificates.map(certificate => (
                  <Box
                     key={certificate.id}
                     className="py-3 first:pt-0 last:pb-0">
                     <Typography className="text-sm! font-semibold!">
                        {certificate.certificateName}
                     </Typography>
                     <Typography
                        className="mt-1! text-sm!"
                        color="textSecondary">
                        {certificate.organization}
                     </Typography>
                  </Box>
               ))}
            </Box>
         ) : (
            <Typography className="text-muted text-sm!">
               No certificates added.
            </Typography>
         )}
      </ProfileSection>
   </Box>
)

export default ProfessionalProfile
