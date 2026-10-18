import React from "react"

import { SaveOutlined } from "@mui/icons-material"

import { Button } from "@mui/material"

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
      <div className="flex items-center gap-3">
         <Button
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
            className="app-button-secondary"
            sx={{
               textTransform: "none",
               borderColor: "#e2e8f0",
               minWidth: 82,
               height: 38,
               fontSize: "11px"
            }}>
            Cancel
         </Button>

         <Button
            variant="contained"
            onClick={onSave}
            disabled={disabled || isLoading}
            startIcon={<SaveOutlined />}
            className="app-button-primary"
            sx={{
               textTransform: "none",
               minWidth: 130,
               height: 38,
               fontSize: "11px",
               backgroundColor: "#5b35d5",
               boxShadow: "none",

               "&:hover": {
                  backgroundColor: "#4c2bb8",
                  boxShadow: "none"
               }
            }}>
            {isLoading ? "Saving..." : "Save Changes"}
         </Button>
      </div>
   )
}

export default EditProfileActions
