import { useNavigate } from "react-router-dom"
import { Box, Button, Typography } from "@mui/material"
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined"

import type { Company } from "@/types/user"
import { getUserCompanyDetailsPath } from "@/utils/companyRoutes"

import CompanyLogo from "./CompanyLogo"

type Props = {
   company: Company
   isLast: boolean
}

const CompanyRow = ({ company, isLast }: Props) => {
   const navigate = useNavigate()

   const handleViewDetails = () => {
      navigate(getUserCompanyDetailsPath(company.id, company.slug))
   }

   return (
      <Box
         className={`hover:bg-bg/70 flex flex-col gap-5 px-5 py-5 transition-colors lg:flex-row lg:items-center lg:justify-between ${
            !isLast ? "border-border border-b" : ""
         } `}>
         {/* Company Information */}
         <Box className="flex min-w-0 flex-1 items-start gap-4">
            <CompanyLogo company={company} />

            <Box className="min-w-0 flex-1">
               <Typography className="truncate! text-[15px]! font-bold!">
                  {company.companyName}
               </Typography>

               <Typography
                  className="mt-1! line-clamp-2! text-sm! leading-6!"
                  color="textSecondary">
                  {company.description || "No company description available."}
               </Typography>

               {(company.location || company.website) && (
                  <Box className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
                     {company.location && (
                        <Box className="flex items-center gap-1.5">
                           <LocationOnOutlinedIcon
                              className="text-muted"
                              sx={{ fontSize: 16 }}
                           />

                           <Typography
                              className="text-xs!"
                              color="textSecondary">
                              {company.location}
                           </Typography>
                        </Box>
                     )}

                     {company.website && (
                        <a
                           href={company.website}
                           target="_blank"
                           rel="noreferrer"
                           className="text-link hover:text-link-hover flex items-center gap-1.5 text-xs font-medium transition-colors">
                           <LanguageOutlinedIcon sx={{ fontSize: 16 }} />

                           <Typography className="text-xs! font-medium!">
                              Visit Website
                           </Typography>
                        </a>
                     )}
                  </Box>
               )}
            </Box>
         </Box>

         {/* Actions */}
         <Box className="flex shrink-0 items-center gap-2 self-end lg:self-auto">
            <Button
               onClick={handleViewDetails}
               variant="outlined"
               color="primary"
               className="min-w-31.25! px-5! py-2! text-sm! font-semibold! normal-case!">
               View Details
            </Button>

            {/* <IconButton
               aria-label={`More options for ${company.companyName}`}
               className="text-muted hover:bg-slate-100">
               <MoreVertIcon />
            </IconButton> */}
         </Box>
      </Box>
   )
}

export default CompanyRow
