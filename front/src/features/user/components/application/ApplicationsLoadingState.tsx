import { Box, Skeleton } from "@mui/material"

const ApplicationsLoadingState = () => {
   return (
      <Box className="min-h-full bg-[#FAFBFF] p-6">
         <Skeleton
            variant="text"
            width={260}
            height={45}
         />

         <Skeleton
            variant="text"
            width={380}
            height={30}
         />

         <Box className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
               <Skeleton
                  key={index}
                  variant="rounded"
                  height={90}
               />
            ))}
         </Box>

         <Skeleton
            className="mt-6!"
            variant="rounded"
            height={500}
         />
      </Box>
   )
}

export default ApplicationsLoadingState
