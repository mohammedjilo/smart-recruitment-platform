import { Box, Typography } from "@mui/material"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"

import type { Company } from "@/types/user"
import { UserCompanyListSkeleton } from "@/features/user/components/UserSkeletons"

import CompanyRow from "./CompanyRow"

type Props = {
   companies: Company[]
   isSearching: boolean
   isLoading: boolean
}

const CompaniesList = ({ companies, isSearching, isLoading }: Props) => {
   return (
      <Box>
         <Box className="mb-4">
            <Typography className="text-content text-base! font-bold!">
               All Companies
            </Typography>
         </Box>

         <Box className="border-border bg-surface overflow-hidden rounded-xl border shadow-sm">
            {isLoading ? (
               <UserCompanyListSkeleton />
            ) : companies.length === 0 ? (
               <Box className="flex min-h-75 flex-col items-center justify-center px-6 text-center">
                  <BusinessOutlinedIcon className="text-muted mb-3 text-[42px]!" />

                  <Typography className="text-content text-base! font-semibold!">
                     {isSearching ? "No companies found" : "No companies available"}
                  </Typography>

                  <Typography
                     className="mt-1! text-sm!"
                     color="textSecondary">
                     {isSearching
                        ? "Try searching for a different company or keyword."
                        : "There are currently no companies to display."}
                  </Typography>
               </Box>
            ) : (
               companies.map((company, index) => (
                  <CompanyRow
                     key={company.id}
                     company={company}
                     isLast={index === companies.length - 1}
                  />
               ))
            )}
         </Box>
      </Box>
   )
}

export default CompaniesList
