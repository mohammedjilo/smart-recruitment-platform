import { Box, Typography } from "@mui/material"
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined"

import DataTable from "@/components/common/DataTable"
import type { CompanyUser } from "@/types/company"
import { getCompanyUsersColumns } from "@/features/company/columns/usersColumns"
import type { SemanticQueryState } from "@/utils/queryState"

type Props = {
   users: CompanyUser[]
   hasFilters: boolean
   isLoading: boolean
   isFetching: boolean
   queryState?: SemanticQueryState<unknown>
   onRetry?: () => void
}

const UsersTable = ({
   users,
   hasFilters,
   isLoading,
   isFetching,
   queryState,
   onRetry
}: Props) => {
   const emptyState = (
      <Box className="flex min-h-100 flex-col items-center justify-center px-6 text-center">
         <PeopleOutlineOutlinedIcon
            className="text-muted mb-4"
            sx={{ fontSize: 48 }}
         />

         <Typography className="text-content text-base! font-semibold!">
            {hasFilters ? "No matching users found" : "No users found"}
         </Typography>

         <Typography className="text-muted mt-2! text-sm!">
            {hasFilters
               ? "Try changing your search or experience filter."
               : "There are no users available at the moment."}
         </Typography>
      </Box>
   )

   return (
      <DataTable
         rows={users}
         columns={getCompanyUsersColumns()}
         getRowKey={user => user.id}
         isLoading={isLoading}
         isFetching={isFetching}
         queryState={queryState}
         onRetry={onRetry}
         emptyState={emptyState}
         minWidth={1200}
         containerClassName="shadow-none!"
      />
   )
}

export default UsersTable
