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
         <PeopleOutlineOutlinedIcon className="text-muted mb-4 text-[48px]!" />

         <Typography className="text-base! font-semibold!">
            {hasFilters ? "No matching users found" : "No users found"}
         </Typography>

         <Typography
            className="mt-2! text-sm!"
            color="textSecondary">
            {hasFilters
               ? "Try changing your search or experience filter."
               : "There are no users available at the moment."}
         </Typography>
      </Box>
   )

   return (
      <DataTable
         columns={getCompanyUsersColumns()}
         containerClassName="shadow-none!"
         emptyState={emptyState}
         getRowKey={user => user.id}
         isFetching={isFetching}
         isLoading={isLoading}
         queryState={queryState}
         rows={users}
         onRetry={onRetry}
      />
   )
}

export default UsersTable
