import { Box } from "@mui/material"

import CompanyCard from "./CompanyCard"
import type { AdminCompany } from "@/types/admin"

type Props = {
   companies: AdminCompany[]
}

const CompaniesGrid = ({ companies }: Props) => {
   return (
      <Box className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
         {companies.map(company => (
            <CompanyCard
               key={company.id}
               company={company}
            />
         ))}
      </Box>
   )
}

export default CompaniesGrid
