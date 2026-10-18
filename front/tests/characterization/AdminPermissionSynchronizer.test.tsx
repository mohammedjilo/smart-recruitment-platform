import { configureStore } from "@reduxjs/toolkit"
import { act, render, waitFor } from "@testing-library/react"
import { Provider } from "react-redux"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AdminPermissionSynchronizer from "@/features/admin/authorization/AdminPermissionSynchronizer"
import { authActions, authReducer } from "@/redux/slices/authSlice"
import { ADMIN_PERMISSIONS, type AdminPermission } from "@/types/adminPermissions"

const { permissionsQuery } = vi.hoisted(() => ({
   permissionsQuery: {
      requestedAdminId: "",
      currentData: undefined as
         | { data: { permissions: AdminPermission[] } }
         | undefined
   }
}))

vi.mock("@/features/admin/services/adminApiCalls", () => ({
   useGetCurrentAdminPermissionsQuery: (
      adminId: string,
      _options: { skip: boolean }
   ) => {
      permissionsQuery.requestedAdminId = adminId
      return permissionsQuery
   }
}))

const makeAdmin = (id: string, permissions: AdminPermission[] = []) => ({
   user: {
      id,
      firstName: "Admin",
      lastName: id,
      email: `${id}@example.test`,
      profilePicUrl: "",
      role: "ADMIN" as const,
      permissions
   },
   company: null,
   token: "token",
   permissions
})

const createStore = (permissions: AdminPermission[] = []) =>
   configureStore({
      reducer: { auth: authReducer },
      preloadedState: { auth: makeAdmin("admin-1", permissions) }
   })

const renderSync = (store: ReturnType<typeof createStore>) =>
   render(
      <Provider store={store}>
         <AdminPermissionSynchronizer />
      </Provider>
   )

describe("AdminPermissionSynchronizer", () => {
   beforeEach(() => {
      permissionsQuery.requestedAdminId = ""
      permissionsQuery.currentData = undefined
   })

   it("synchronizes empty, single, multiple, and updated permission responses", async () => {
      permissionsQuery.currentData = { data: { permissions: [] } }
      const store = createStore([ADMIN_PERMISSIONS.VIEW_USERS])
      const { rerender } = renderSync(store)

      await waitFor(() => expect(store.getState().auth.permissions).toEqual([]))

      permissionsQuery.currentData = {
         data: { permissions: [ADMIN_PERMISSIONS.VIEW_USERS] }
      }
      rerender(
         <Provider store={store}>
            <AdminPermissionSynchronizer />
         </Provider>
      )
      await waitFor(() =>
         expect(store.getState().auth.permissions).toEqual([
            ADMIN_PERMISSIONS.VIEW_USERS
         ])
      )

      const updatedPermissions = [
         ADMIN_PERMISSIONS.VIEW_USERS,
         ADMIN_PERMISSIONS.EDIT_USERS
      ]
      permissionsQuery.currentData = {
         data: { permissions: updatedPermissions }
      }
      rerender(
         <Provider store={store}>
            <AdminPermissionSynchronizer />
         </Provider>
      )
      await waitFor(() =>
         expect(store.getState().auth.permissions).toEqual(updatedPermissions)
      )
   })

   it("clears old permissions during admin switch and logout", async () => {
      const originalPermission = ADMIN_PERMISSIONS.VIEW_USERS
      permissionsQuery.currentData = {
         data: { permissions: [originalPermission] }
      }
      const store = createStore([originalPermission])
      const { rerender } = renderSync(store)

      await waitFor(() =>
         expect(store.getState().auth.permissions).toEqual([originalPermission])
      )

      permissionsQuery.currentData = undefined
      act(() => {
         store.dispatch(authActions.login({ ...makeAdmin("admin-2", [originalPermission]), token: "new-token" }))
      })
      rerender(
         <Provider store={store}>
            <AdminPermissionSynchronizer />
         </Provider>
      )

      await waitFor(() => expect(store.getState().auth.permissions).toEqual([]))
      expect(permissionsQuery.requestedAdminId).toBe("admin-2")

      const newPermissions = [ADMIN_PERMISSIONS.VIEW_COMPANIES]
      permissionsQuery.currentData = { data: { permissions: newPermissions } }
      rerender(
         <Provider store={store}>
            <AdminPermissionSynchronizer />
         </Provider>
      )
      await waitFor(() =>
         expect(store.getState().auth.permissions).toEqual(newPermissions)
      )

      act(() => store.dispatch(authActions.logout()))
      rerender(
         <Provider store={store}>
            <AdminPermissionSynchronizer />
         </Provider>
      )
      expect(store.getState().auth.permissions).toEqual([])
   })
})
