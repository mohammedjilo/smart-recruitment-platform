import {
   FormControl,
   InputLabel,
   MenuItem,
   Select,
   Skeleton,
   TextField
} from "@mui/material"
import FiltersBar from "@/components/common/FiltersBar"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"
import type { SupportPriority, SupportTicketStatus } from "@/types/entities/support"

export type SupportAudience = "USER" | "COMPANY" | "ALL"

export type SupportFilterValues = {
   search: string
   status: SupportTicketStatus | "ALL"
   priority: SupportPriority | "ALL"
   audience: SupportAudience
   categoryId: string
   assignedAdminId: string
}

type SupportFiltersProps = SupportFilterValues & {
   admins: Array<{ id: string; firstName: string; lastName: string }>
   categories: Array<{ id: string; name: string }>
   isLoadingAdmins: boolean
   isLoadingCategories: boolean
   currentAdminId?: string
   onSearchChange: (value: string) => void
   onStatusChange: (value: SupportTicketStatus | "ALL") => void
   onPriorityChange: (value: SupportPriority | "ALL") => void
   onAudienceChange: (value: SupportAudience) => void
   onCategoryChange: (value: string) => void
   onAssignedAdminChange: (value: string) => void
}

const statuses: Array<SupportTicketStatus | "ALL"> = [
   "ALL",
   "OPEN",
   "IN_PROGRESS",
   "WAITING_FOR_USER",
   "RESOLVED",
   "CLOSED"
]

const priorities: Array<SupportPriority | "ALL"> = [
   "ALL",
   "LOW",
   "MEDIUM",
   "HIGH",
   "URGENT"
]

const SupportFilters = ({
   search,
   status,
   priority,
   audience,
   categoryId,
   assignedAdminId,
   admins,
   categories,
   isLoadingAdmins,
   isLoadingCategories,
   currentAdminId,
   onSearchChange,
   onStatusChange,
   onPriorityChange,
   onAudienceChange,
   onCategoryChange,
   onAssignedAdminChange
}: SupportFiltersProps) => {
   const searchInput = useSubmittedSearch(search, onSearchChange)
   return (
      <FiltersBar layout="grid">
         <TextField
            size="small"
            label="Search"
            value={searchInput.value}
            onChange={searchInput.onChange}
            onKeyDown={searchInput.onKeyDown}
            slotProps={{
               input: {
                  startAdornment: (
                     <SearchSubmitAdornment onSearch={searchInput.submit} />
                  )
               }
            }}
         />
      <FormControl size="small">
         <InputLabel>Status</InputLabel>
         <Select
            label="Status"
            value={status}
            onChange={event =>
               onStatusChange(event.target.value as SupportTicketStatus | "ALL")
            }>
            {statuses.map(value => (
               <MenuItem
                  key={value}
                  value={value}>
                  {value}
               </MenuItem>
            ))}
         </Select>
      </FormControl>
      <FormControl size="small">
         <InputLabel>Audience</InputLabel>
         <Select
            label="Audience"
            value={audience}
            onChange={event => onAudienceChange(event.target.value as SupportAudience)}>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="USER">User</MenuItem>
            <MenuItem value="COMPANY">Company</MenuItem>
         </Select>
      </FormControl>
      <FormControl size="small">
         <InputLabel>Priority</InputLabel>
         <Select
            label="Priority"
            value={priority}
            onChange={event =>
               onPriorityChange(event.target.value as SupportPriority | "ALL")
            }>
            {priorities.map(value => (
               <MenuItem
                  key={value}
                  value={value}>
                  {value}
               </MenuItem>
            ))}
         </Select>
      </FormControl>
      <FormControl size="small">
         <InputLabel>Category</InputLabel>
         <Select
            label="Category"
            value={categoryId}
            disabled={isLoadingCategories}
            onChange={event => onCategoryChange(event.target.value)}>
            <MenuItem value="ALL">All</MenuItem>
            {isLoadingCategories ? (
               <MenuItem
                  value="LOADING"
                  disabled>
                  <Skeleton
                     variant="text"
                     width={120}
                  />
               </MenuItem>
            ) : (
               categories.map(category => (
                  <MenuItem
                     key={category.id}
                     value={category.id}>
                     {category.name}
                  </MenuItem>
               ))
            )}
         </Select>
      </FormControl>
      <FormControl size="small">
         <InputLabel>Assigned Admin</InputLabel>
         <Select
            label="Assigned Admin"
            value={assignedAdminId}
            disabled={isLoadingAdmins}
            onChange={event => onAssignedAdminChange(event.target.value)}>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem
               value={currentAdminId ?? "MY_ASSIGNED"}
               disabled={!currentAdminId}>
               My Assigned
            </MenuItem>
            <MenuItem value="UNASSIGNED">Unassigned</MenuItem>
            {isLoadingAdmins ? (
               <MenuItem
                  value="LOADING"
                  disabled>
                  <Skeleton
                     variant="text"
                     width={120}
                  />
               </MenuItem>
            ) : (
               admins.map(admin => (
                  <MenuItem
                     key={admin.id}
                     value={admin.id}>
                     {admin.firstName} {admin.lastName}
                  </MenuItem>
               ))
            )}
         </Select>
      </FormControl>
      </FiltersBar>
   )
}

export default SupportFilters
