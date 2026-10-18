import { Box, Button } from "@mui/material"

import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import { useLocation, useNavigate } from "react-router-dom"
import AboutSection from "@/features/shared/components/about/AboutSection"
import {
   applicationStatuses,
   employmentTypes
} from "@/features/shared/components/about/aboutData"
import StatusCard from "@/features/shared/components/about/StatusCard"
import EmploymentTypeCard from "@/features/shared/components/about/EmploymentTypeCard"
import PageHeader from "@/features/user/components/PageHeader"

const AboutPage = () => {
   const location = useLocation()
   const navigate = useNavigate()
   const isSupportGuide = location.pathname.startsWith("/user/support/")

   return (
      <Box className="w-full">
         <PageHeader
            title="Application & Employment Guide"
            description="Learn more about application statuses and employment types used throughout the platform."
            action={
               isSupportGuide ? (
                  <Button
                     startIcon={<ArrowBackOutlinedIcon />}
                     onClick={() => navigate("/user/support")}
                     className="text-primary! normal-case!">
                     Back to Support & Help
                  </Button>
               ) : undefined
            }
         />

         {/* Application Statuses */}
         <AboutSection
            title="Application Statuses"
            description="These statuses show you the current stage of your application for a specific job."
            icon={<DescriptionOutlinedIcon sx={{ fontSize: 24 }} />}>
            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
               {applicationStatuses.map(status => (
                  <StatusCard
                     key={status.title}
                     title={status.title}
                     description={status.description}
                     icon={status.icon}
                     iconClass={status.iconClass}
                  />
               ))}
            </Box>
         </AboutSection>

         {/* Employment Types */}
         <Box className="mt-6">
            <AboutSection
               title="Employment Types"
               description="These types describe the nature of the job and how it is structured."
               icon={<WorkOutlineOutlinedIcon sx={{ fontSize: 24 }} />}>
               <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {employmentTypes.map(type => (
                     <EmploymentTypeCard
                        key={type.title}
                        title={type.title}
                        description={type.description}
                        className={type.className}
                     />
                  ))}
               </Box>
            </AboutSection>
         </Box>
      </Box>
   )
}

export default AboutPage
