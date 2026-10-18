import EditOutlinedIcon from "@mui/icons-material/EditOutlined"

import { Box, Button, Typography } from "@mui/material"

type CompanyProfileHeaderProps = {
   onEdit: () => void
}

const CompanyProfileHeader = ({ onEdit }: CompanyProfileHeaderProps) => {
   return (
      <Box className="flex flex-col gap-4 border-b border-border px-6 pt-5 pb-4 sm:flex-row sm:items-end sm:justify-between">
         <Box>
            <Typography className="text-[26px] font-bold text-content">
               Company Profile
            </Typography>

            <Typography
               variant="body2"
               className="mt-1 text-sm text-muted">
               Manage and update your company information.
            </Typography>
         </Box>

         <Button
            variant="contained"
            startIcon={<EditOutlinedIcon />}
            onClick={onEdit}
            sx={{
               textTransform: "none",
               borderRadius: "8px",
               boxShadow: "none",
               backgroundColor: "#5425d4",
               "&:hover": {
                  backgroundColor: "#4317b5",
                  boxShadow: "none"
               }
            }}>
            Edit Profile
         </Button>
      </Box>
   )
}

export default CompanyProfileHeader
