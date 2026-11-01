import { ADMIN_PERMISSIONS, type AdminPermission } from "@/types/adminPermissions"

const demoAdminPaths = [
   /^\/admin$/,
   /^\/admin\/forbidden$/,
   /^\/admin\/about$/,
   /^\/admin\/dashboard$/,
   /^\/admin\/support$/,
   /^\/admin\/operations$/,
   /^\/admin\/company-requests$/,
   /^\/admin\/companies$/,
   /^\/admin\/companies\/[^/]+$/,
   /^\/admin\/users$/,
   /^\/admin\/users\/[^/]+$/,
   /^\/admin\/jobs$/,
   /^\/admin\/jobs\/[^/]+\/[^/]+$/,
   /^\/admin\/applications$/,
   /^\/admin\/applications\/[^/]+$/,
   /^\/admin\/support\/tickets$/,
   /^\/admin\/support\/[^/]+$/,
   /^\/admin\/notifications$/
]

export const isDemoAdminPermissions = (permissions: readonly string[]) =>
   permissions.includes(ADMIN_PERMISSIONS.DEMO_ADMIN_READ_ONLY)

export const hasAdminPermission = (
   permissions: readonly string[],
   permission: AdminPermission
) => {
   return permissions.includes(permission)
}

export const isDemoAdminPathAllowed = (path: string) => {
   const normalizedPath = path.replace(/\/+$/, "") || "/"
   return demoAdminPaths.some((allowedPath) => allowedPath.test(normalizedPath))
}
