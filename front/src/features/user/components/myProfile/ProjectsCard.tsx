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
                     className="text-mui-purple"
                     fontSize="small"
                  />

                  <Typography className="text-sm! text-content">Projects</Typography>
               </Box>

               <ProfileCardMenu
                  createLabel="Create Project"
                  formType="project"
               />
            </Box>

            {projects.length === 0 ? (
               <Typography className="text-sm!" color="textSecondary">
                  No projects added yet.
               </Typography>
            ) : (
               <Box>
                  {projects.map((project, index) => (
                     <Box key={project.id}>
                        <Box
                           className={
                              index === 0 ? "relative pl-3" : "relative py-2.5 pl-3"
                           }>
                           <Box
                              className={
                                 index === 0
                                    ? "absolute top-1 left-px h-2 w-2 rounded-full bg-violet-600"
                                    : "absolute top-6 left-px h-2 w-2 rounded-full bg-violet-600"
                              }
                           />

                           <Box className="flex items-start justify-between gap-2">
                              <Typography className="text-sm!">
                                 {project.title}
                              </Typography>

                              <Box className="flex items-center gap-1">
                                 <Typography className="text-xs!">
                                    {new Date(project.createdAt).getFullYear()}
                                 </Typography>

                                 <ProfileCardMenu
                                    formType="project"
                                    editData={project}
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

                        {index !== projects.length - 1 && <Divider className="ml-3!" />}
                     </Box>
                  ))}
               </Box>
            )}
         </CardContent>
      </Card>
   )
}

export default ProjectsCard
