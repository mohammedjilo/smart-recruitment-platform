import PageHeader from "@/components/common/PageHeader"
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"

import { Box, Button } from "@mui/material"

type CompanyProfileHeaderProps = {
   onEdit: () => void
}

const CompanyProfileHeader = ({ onEdit }: CompanyProfileHeaderProps) => {
   return (
      <Box className="border-border flex flex-col items-center gap-4 border-b px-6 pt-5 pb-4 sm:flex-row sm:items-end sm:justify-between">
         <PageHeader
            description="Manage and update your company information."
            title="Company Profile"
         />
         <Button
            className="my-auto! rounded-lg! bg-[#5425d4]! normal-case! shadow-none!"
            startIcon={<EditOutlinedIcon />}
            sx={{
               "&:hover": {
                  backgroundColor: "#4317b5",
                  boxShadow: "none"
               }
            }}
            variant="contained"
            onClick={onEdit}>
            Edit Profile
         </Button>
      </Box>
   )
}

export default CompanyProfileHeader
