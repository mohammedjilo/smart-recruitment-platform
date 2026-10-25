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
            action={
               isSupportGuide ? (
                  <Button
                     className="text-primary! normal-case!"
                     startIcon={<ArrowBackOutlinedIcon />}
                     onClick={() => navigate("/user/support")}>
                     Back to Support & Help
                  </Button>
               ) : undefined
            }
            description="Learn more about application statuses and employment types used throughout the platform."
            title="Application & Employment Guide"
         />

         {/* Application Statuses */}
         <AboutSection
            description="These statuses show you the current stage of your application for a specific job."
            icon={<DescriptionOutlinedIcon className="text-[24px]!" />}
            title="Application Statuses">
            <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
               {applicationStatuses.map(status => (
                  <StatusCard
                     key={status.title}
                     description={status.description}
                     icon={status.icon}
                     iconClass={status.iconClass}
                     title={status.title}
                  />
               ))}
            </Box>
         </AboutSection>

         {/* Employment Types */}
         <Box className="mt-6">
            <AboutSection
               description="These types describe the nature of the job and how it is structured."
               icon={<WorkOutlineOutlinedIcon className="text-[24px]!" />}
               title="Employment Types">
               <Box className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {employmentTypes.map(type => (
                     <EmploymentTypeCard
                        className={type.className}
                        key={type.title}
                        description={type.description}
                        title={type.title}
                     />
                  ))}
               </Box>
            </AboutSection>
         </Box>
      </Box>
   )
}

export default AboutPage
