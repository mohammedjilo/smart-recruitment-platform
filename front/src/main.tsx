import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./routes/AppRoutes.tsx"
import { AppThemeProvider } from "./theme/AppThemeProvider.tsx"
import { Provider } from "react-redux"
import { store } from "./redux/store/index.ts"
import RoleTheme from "./theme/RoleTheme.tsx"
import { ToastProvider } from "./components/common/ToastProvider.tsx"
import { AppErrorBoundary } from "./components/common/AppErrorBoundary"
// import { bootstrap } from "./bootstrap.ts"
// await bootstrap()

createRoot(document.getElementById("root")!).render(
   <StrictMode>
      <Provider store={store}>
         <AppThemeProvider>
            <RoleTheme>
               <ToastProvider>
                  <AppErrorBoundary>
                     <App />
                  </AppErrorBoundary>
               </ToastProvider>
            </RoleTheme>
         </AppThemeProvider>
      </Provider>
   </StrictMode>
)
