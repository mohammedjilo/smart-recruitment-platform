import { Box, Card, CardContent, Typography } from "@mui/material"

import { Link, useNavigate } from "react-router-dom"
import CustomCard from "@/components/common/CustomCard"
import { Business } from "@mui/icons-material"
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1"
const Register: React.FC = () => {
   const navigate = useNavigate()
   return (
      <Box className="flex min-h-screen items-center justify-center">
         <CustomCard>
            <Typography
               align="center"
               className="text-3xl! font-bold!">
               Join us today!
            </Typography>
            <Typography
               color="textSecondary"
               align="center"
               className="mt-2! text-base!">
               Create an account to get started
            </Typography>

            <Box className="mt-6 grid grid-cols-1 gap-4">
               <Card
                  className="bg-mui-blue-50! cursor-pointer p-4 transition-all duration-200 hover:shadow-md!"
                  variant="outlined"
                  onClick={() => navigate("/register/user")}>
                  <CardContent className="flex items-center">
                     <PersonAddAlt1Icon className="text-mui-blue-50 bg-mui-blue-300 mb-2 h-20! w-20! rounded-full p-2 text-4xl" />
                     <Box className="ml-2 flex flex-col">
                        <Typography className="text-lg! font-semibold!">
                           I'm a User
                        </Typography>
                        <Typography
                           color="textSecondary"
                           className="mt-1! text-sm!">
                           Find jobs, apply, and grow your career
                        </Typography>
                     </Box>
                  </CardContent>
               </Card>

               <Card
                  className="bg-mui-blue-50! cursor-pointer p-4 transition-all duration-200 hover:shadow-md!"
                  variant="outlined"
                  onClick={() => navigate("/register/company")}>
                  <CardContent className="flex items-center">
                     <Business className="text-mui-blue-50 bg-mui-blue-300 mb-2 h-20! w-20! rounded-full p-2 text-4xl" />
                     <Box className="ml-2 flex flex-col">
                        <Typography className="text-lg! font-semibold!">
                           I'm a Company
                        </Typography>
                        <Typography
                           color="textSecondary"
                           className="mt-1! text-sm!">
                           Post jobs, find talent, and grow your team
                        </Typography>
                     </Box>
                  </CardContent>
               </Card>
            </Box>

            <Box className="mt-4 text-center">
               <Typography className="text-sm!">
                  Already have an account?{" "}
                  {/* <a
                     href="#"
                     className="text-primary-blue font-medium hover:underline">
                     
                  </a> */}
                  <Link
                     to="/login"
                     className="hover:text-mui-blue-800 text-mui-blue-600 underline">
                     Login
                  </Link>
               </Typography>
            </Box>
         </CustomCard>
      </Box>
   )
}

export default Register
