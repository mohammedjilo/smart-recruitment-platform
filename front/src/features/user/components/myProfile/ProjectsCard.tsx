import { Box, Card, CardContent, Divider, Typography } from "@mui/material"

import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined"
import type { Project } from "@/types/user"
import ProfileCardMenu from "./ProfileCardMenu"

type Props = {
   projects: Project[]
}

const ProjectsCard = ({ projects }: Props) => {
   return (
      <Card className="rounded-xl! border! shadow-none!">
         <CardContent>
            <Box className="mb-3 flex items-center justify-between">
               <Box className="flex items-center gap-1">
                  <FolderOutlinedIcon
                     className="text-violet-600"
                     fontSize="small"
                  />

                  <Typography className="text-content text-sm!">Projects</Typography>
               </Box>

               <ProfileCardMenu
                  createLabel="Create Project"
                  formType="project"
               />
            </Box>

            {projects.length === 0 ? (
               <Typography
                  className="text-sm!"
                  color="textSecondary">
                  No projects added yet.
               </Typography>
            ) : (
               <Box>
                  {projects.map((project, index) => (
                     <Box key={project.id}>
                        <Box className="relative pl-3">
                           <Box className="absolute top-2.5 left-0 h-2 w-2 -translate-y-1/2 rounded-full bg-violet-600" />

                           <Box className="flex items-start justify-between gap-2">
                              <Typography className="text-sm!">
                                 {project.title}
                              </Typography>

                              <Box className="flex items-center gap-1">
                                 <Typography className="text-xs!">
                                    {new Date(project.createdAt).getFullYear()}
                                 </Typography>

                                 <ProfileCardMenu
                                    editData={project}
                                    formType="project"
                                 />
                              </Box>
                           </Box>

                           {project.description && (
                              <Typography
                                 className="text-xs! leading-[1.7]!"
                                 color="textSecondary">
                                 {project.description}
                              </Typography>
                           )}
                        </Box>

                        {index !== projects.length - 1 && (
                           <Divider className="my-2! ml-3!" />
                        )}
                     </Box>
                  ))}
               </Box>
            )}
         </CardContent>
      </Card>
   )
}

export default ProjectsCard
