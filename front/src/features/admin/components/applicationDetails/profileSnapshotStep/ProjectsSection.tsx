import { Box, Typography } from "@mui/material"

import CodeOutlinedIcon from "@mui/icons-material/CodeOutlined"
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined"

import { EmptyText, SectionTitle } from "./ExperienceSection"
import type { ProfileSnapshot } from "@/types/admin"

type ProjectsSectionProps = {
   projects?: ProfileSnapshot["projects"]
}

const ProjectsSection = ({ projects = [] }: ProjectsSectionProps) => {
   return (
      <Box className="rounded-xl border bg-surface p-5">
         <SectionTitle
            icon={<FolderOutlinedIcon />}
            title="Projects"
            count={projects?.length ?? 0}
         />

         {(projects?.length ?? 0) === 0 ? (
            <EmptyText text="No projects available." />
         ) : (
            <Box className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
               {projects.map((project, index) => (
                  <Box
                     key={`${project.title}-${index}`}
                     className="rounded-lg border p-4">
                     <Box className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <CodeOutlinedIcon />
                     </Box>

                     <Typography className="mt-4! text-sm! font-semibold!">
                        {project.title}
                     </Typography>

                     <Typography
                        className="mt-2! text-xs! leading-6!"
                        color="textSecondary">
                        {project.description || "No description provided."}
                     </Typography>
                  </Box>
               ))}
            </Box>
         )}
      </Box>
   )
}

export default ProjectsSection
