import { Box, Typography } from "@mui/material"

import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined"

import { EmptyText, SectionTitle } from "./ExperienceSection"
import type { ProfileSnapshot } from "@/types/profileSnapshot"

type CertificatesSectionProps = {
   certificates?: ProfileSnapshot["certificates"]
}

const CertificatesSection = ({ certificates = [] }: CertificatesSectionProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-5">
         <SectionTitle
            count={certificates?.length ?? 0}
            icon={<WorkspacePremiumOutlinedIcon />}
            title="Certificates"
         />

         {(certificates?.length ?? 0) === 0 ? (
            <EmptyText text="No certificates available." />
         ) : (
            <Box className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
               {certificates.map((certificate, index) => (
                  <Box
                     className="flex items-center gap-4 rounded-lg border p-4"
                     key={`${certificate.certificateName}-${index}`}>
                     <Box className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <WorkspacePremiumOutlinedIcon />
                     </Box>

                     <Box>
                        <Typography className="text-xs! font-semibold!">
                           {certificate.certificateName}
                        </Typography>

                        <Typography
                           className="mt-1 text-[11px]"
                           color="textSecondary">
                           {certificate.organization}
                        </Typography>
                     </Box>
                  </Box>
               ))}
            </Box>
         )}
      </Box>
   )
}

export default CertificatesSection
