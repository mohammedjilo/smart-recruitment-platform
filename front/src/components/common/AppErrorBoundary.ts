import { Box, Button, Stack, Typography } from "@mui/material"
import React, { Component, type ErrorInfo, type ReactNode } from "react"

interface AppErrorBoundaryProps {
   children: ReactNode
   fallback?: ReactNode
}

interface AppErrorBoundaryState {
   hasError: boolean
   error?: Error
}

export class AppErrorBoundary extends Component<
   AppErrorBoundaryProps,
   AppErrorBoundaryState
> {
   state: AppErrorBoundaryState = {
      hasError: false,
      error: undefined
   }

   static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
      return { hasError: true, error }
   }

   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
      console.error("Application runtime error", {
         message: error.message,
         name: error.name,
         stack: error.stack,
         componentStack: errorInfo.componentStack
      })
   }

   reset = () => {
      this.setState({ hasError: false, error: undefined })
   }

   render() {
      if (this.state.hasError) {
         if (this.props.fallback) {
            return this.props.fallback
         }

         return React.createElement(
            Box,
            {
               role: "alert",
               "aria-live": "assertive",
               sx: {
                  minHeight: "100vh",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "background.default",
                  px: 3,
                  py: 6
               }
            },
            React.createElement(
               Box,
               {
                  sx: {
                     maxWidth: 560,
                     width: "100%",
                     borderRadius: 3,
                     border: "1px solid",
                     borderColor: "divider",
                     p: 4,
                     backgroundColor: "background.paper",
                     boxShadow: 2
                  }
               },
               React.createElement(
                  Stack,
                  { spacing: 2 },
                  React.createElement(
                     Typography,
                     { variant: "h5", sx: { fontWeight: 700 } },
                     "Something went wrong"
                  ),
                  React.createElement(
                     Typography,
                     { color: "text.secondary" },
                     "This part of the app could not render safely. Please try again."
                  ),
                  React.createElement(
                     Stack,
                     { direction: "row", spacing: 2, sx: { pt: 1 } },
                     React.createElement(
                        Button,
                        { variant: "contained", onClick: this.reset },
                        "Try again"
                     ),
                     React.createElement(
                        Button,
                        {
                           variant: "outlined",
                           onClick: () => {
                              if (typeof window !== "undefined") {
                                 window.location.reload()
                              }
                           }
                        },
                        "Reload page"
                     )
                  )
               )
            )
         )
      }

      return this.props.children
   }
}
