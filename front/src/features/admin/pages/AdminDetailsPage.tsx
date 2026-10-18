import { Box, Button, Typography } from "@mui/material"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import { useNavigate, useParams } from "react-router-dom"
import { useGetAdminAuthorizationQuery } from "@/features/admin/services/adminApiCalls"
import { formatDate } from "@/utils/formatDate"
import { AdminAuthorizationDetailsSkeleton } from "@/features/admin/components/AdminSkeletons"

export default function AdminDetailsPage() {
   const navigate = useNavigate()
   const { userId } = useParams()
   const { data, isLoading, isError } = useGetAdminAuthorizationQuery(userId ?? "", {
      skip: !userId
   })
   const admin = data?.data

   if (isLoading) {
      return <AdminAuthorizationDetailsSkeleton />
   }

   if (isError || !admin) {
      return (
         <Box className="rounded-xl border border-red-200 bg-red-50 p-8">
            <Typography className="text-sm! text-red-700!">
               Admin details could not be loaded.
            </Typography>
         </Box>
      )
   }

   return (
      <Box className="max-w-3xl space-y-5">
         <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/admin/admins")}
            className="normal-case!">
            Back to Admin Management
         </Button>
         <Box className="border-border bg-surface rounded-xl border p-6">
            <Typography className="text-content! text-2xl! font-bold!">
               {admin.firstName} {admin.lastName}
            </Typography>
            <Typography className="text-muted! mt-1! text-sm!">{admin.email}</Typography>
            <Box className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
               <Box>
                  <Typography className="text-muted! text-xs!">Role</Typography>
                  <Typography className="text-content! mt-1! text-sm! font-semibold!">
                     {admin.adminRoleAssignments[0]?.adminRole.name ?? "Unassigned"}
                  </Typography>
               </Box>
               <Box>
                  <Typography className="text-muted! text-xs!">Status</Typography>
                  <Typography className="text-content! mt-1! text-sm! font-semibold!">
                     {admin.accountStatus}
                  </Typography>
               </Box>
               <Box>
                  <Typography className="text-muted! text-xs!">Created</Typography>
                  <Typography className="text-content! mt-1! text-sm!">
                     {formatDate(admin.createdAt)}
                  </Typography>
               </Box>
            </Box>
            <Box className="bg-bg mt-6 rounded-lg p-4">
               <Typography className="text-muted! text-xs! font-semibold! uppercase!">
                  Permissions
               </Typography>
               <Typography className="text-content! mt-2! text-sm! leading-6!">
                  {admin.permissions.join(", ") || "No permissions assigned"}
               </Typography>
            </Box>
         </Box>
      </Box>
   )
}
