import { configureStore } from "@reduxjs/toolkit"
import { useDispatch } from "react-redux"
import { authReducer } from "@/redux/slices/authSlice"
import { smartApi } from "@/services/api/baseApi"
import { supportOnlyApi } from "@/services/api/supportOnlyApi"

export const store = configureStore({
   reducer: {
      [smartApi.reducerPath]: smartApi.reducer,
      [supportOnlyApi.reducerPath]: supportOnlyApi.reducer,
      auth: authReducer
   },
   middleware: getDefaultMiddleware =>
      getDefaultMiddleware().concat(smartApi.middleware, supportOnlyApi.middleware)
})

export type RootState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
