import { Box, Typography } from "@mui/material"
import { Suspense, type ReactNode } from "react"

const RouteLoadingFallback = () => (
   <Box className="text-muted flex min-h-40 items-center justify-center p-6">
      <Typography role="status">Loading page...</Typography>
   </Box>
)

const RoutePage = ({ children }: { children: ReactNode }) => (
   <Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense>
)

export default RoutePage
