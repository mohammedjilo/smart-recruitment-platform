import { Box, Skeleton } from "@mui/material"

const ApplicationsLoadingState = () => {
   return (
      <Box className="min-h-full bg-[#FAFBFF] p-6">
         <Skeleton
            height={45}
            variant="text"
            width={260}
         />

         <Skeleton
            height={30}
            variant="text"
            width={380}
         />

         <Box className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
               <Skeleton
                  key={index}
                  height={90}
                  variant="rounded"
               />
            ))}
         </Box>

         <Skeleton
            className="mt-6!"
            height={500}
            variant="rounded"
         />
      </Box>
   )
}

export default ApplicationsLoadingState
