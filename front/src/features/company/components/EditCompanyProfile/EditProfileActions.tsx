import React from "react"

import { SaveOutlined } from "@mui/icons-material"

import { Box, Button } from "@mui/material"

interface EditProfileActionsProps {
   isLoading: boolean
   disabled: boolean

   onCancel: () => void
   onSave: () => void
}

const EditProfileActions: React.FC<EditProfileActionsProps> = ({
   isLoading,
   disabled,
   onCancel,
   onSave
}) => {
   return (
      <Box className="flex items-center gap-3">
         <Button
            className="h-9.5! min-w-20.5! border-[#e2e8f0]! text-[11px]! normal-case!"
            disabled={isLoading}
            variant="outlined"
            onClick={onCancel}>
            Cancel
         </Button>

         <Button
            className="h-9.5! min-w-32.5! text-[11px]! normal-case! shadow-none!"
            disabled={disabled || isLoading}
            startIcon={<SaveOutlined />}
            sx={{ "&:hover": { boxShadow: "none" } }}
            variant="contained"
            onClick={onSave}>
            {isLoading ? "Saving..." : "Save Changes"}
         </Button>
      </Box>
   )
}

export default EditProfileActions
