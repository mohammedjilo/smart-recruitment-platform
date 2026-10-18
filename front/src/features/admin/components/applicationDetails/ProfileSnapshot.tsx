import { Box, Typography } from "@mui/material"

type ProfileSnapshotProps = {
   profileSnapshot: unknown
}

const ProfileSnapshot = ({ profileSnapshot }: ProfileSnapshotProps) => {
   if (profileSnapshot === null || profileSnapshot === undefined) {
      return (
         <Box className="flex min-h-62.5 items-center justify-center rounded-xl border border-border bg-surface p-6">
            <Typography className="text-sm text-muted">
               No profile snapshot available.
            </Typography>
         </Box>
      )
   }

   return (
      <Box className="rounded-xl border border-border bg-surface p-6">
         <Typography className="text-sm font-bold text-content">
            Profile Snapshot
         </Typography>

         <Box
            component="pre"
            className="mt-5 max-h-150 overflow-auto rounded-lg bg-bg p-5 text-xs leading-6 text-muted">
            {JSON.stringify(profileSnapshot, null, 2)}
         </Box>
      </Box>
   )
}

export default ProfileSnapshot
