import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useGetCurrentAdminPermissionsQuery } from "@/features/admin/services/adminApiCalls"
import { authActions } from "@/redux/slices/authSlice"
import type { RootState } from "@/redux/store"

const AdminPermissionSynchronizer = () => {
   const user = useSelector((state: RootState) => state.auth.user)
   const storedPermissions = useSelector(
      (state: RootState) => state.auth.permissions
   )
   const dispatch = useDispatch()
   const adminId = user?.role === "ADMIN" ? user.id : undefined
   const permissionsQuery = useGetCurrentAdminPermissionsQuery(adminId ?? "", {
      skip: !adminId
   })
   const lastAdminId = useRef<string | null>(null)
   const serverPermissions = permissionsQuery.currentData?.data.permissions

   useEffect(() => {
      if (!adminId) {
         lastAdminId.current = null
         return
      }

      if (!serverPermissions) return

      if (lastAdminId.current !== adminId) {
         lastAdminId.current = adminId
         const permissionsForAdmin = serverPermissions
         if (
            storedPermissions.length !== permissionsForAdmin.length ||
            storedPermissions.some(
               (permission, index) => permission !== permissionsForAdmin[index]
            )
         ) {
            dispatch(authActions.setPermissions(permissionsForAdmin))
         }
         return
      }

      if (
         serverPermissions &&
         (storedPermissions.length !== serverPermissions.length ||
            storedPermissions.some(
               (permission, index) => permission !== serverPermissions[index]
            ))
      ) {
         dispatch(authActions.setPermissions(serverPermissions))
      }
   }, [adminId, dispatch, serverPermissions, storedPermissions])

   return null
}

export default AdminPermissionSynchronizer
