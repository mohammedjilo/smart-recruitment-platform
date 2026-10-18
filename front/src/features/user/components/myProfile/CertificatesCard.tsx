import { Box, Card, CardContent, Divider, Typography } from "@mui/material"

import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined"
import type { Certificate } from "@/types/user"
import ProfileCardMenu from "./ProfileCardMenu"
import { formatDate } from "@/utils/formatDate"

type Props = {
   certificates: Certificate[]
}

const CertificatesCard = ({ certificates }: Props) => {
   return (
      <Card className="rounded-xl! border! shadow-none!">
         <CardContent>
            <Box className="mb-2.5 flex items-center justify-between">
               <Box className="flex items-center gap-1">
                  <WorkspacePremiumOutlinedIcon
                     className="text-mui-purple"
                     fontSize="small"
                  />

                  <Typography className="text-content">Certificates</Typography>
               </Box>

               <ProfileCardMenu
                  createLabel="Create Certificate"
                  formType="certificate"
               />
            </Box>

            {certificates.length === 0 ? (
               <Typography className="text-sm!" color="textSecondary">
                  No certificates added yet.
               </Typography>
            ) : (
               <Box>
                  {certificates.map((certificate, index) => (
                     <Box key={certificate.id}>
                        <Box
                           className={
                              index === 0
                                 ? "relative flex flex-col pl-3"
                                 : "relative flex flex-col py-2.5 pl-3"
                           }>
                           <Box
                              className={
                                 index === 0
                                    ? "absolute top-1 left-px h-2 w-2 rounded-full bg-violet-600"
                                    : "absolute top-6 left-px h-2 w-2 rounded-full bg-violet-600"
                              }
                           />

                           <Box className="flex items-start justify-between gap-2">
                              <Typography className="text-sm!">
                                 {certificate.certificateName}
                              </Typography>

                              <ProfileCardMenu
                                 formType="certificate"
                                 editData={certificate}
                              />
                           </Box>

                           <Typography className="text-xs!" color="textSecondary">
                              {certificate.organization}
                           </Typography>

                           <Typography className="text-xs!" color="textSecondary">
                              Issued{" "}
                              {formatDate(certificate.createdAt, { format: "monthYear" })}
                           </Typography>
                        </Box>

                        {index !== certificates.length - 1 && (
                           <Divider className="ml-3!" />
                        )}
                     </Box>
                  ))}
               </Box>
            )}
         </CardContent>
      </Card>
   )
}

export default CertificatesCard
