import { Box, Skeleton } from "@mui/material"

export const UserJobListSkeleton = () => (
   <Box className="border-border bg-surface overflow-hidden rounded-xl border">
      {Array.from({ length: 6 }).map((_, index) => (
         <Box
            key={index}
            className="border-border flex min-h-32 items-center gap-5 border-b px-7 py-5 last:border-b-0">
            <Skeleton
               variant="rounded"
               width={96}
               height={96}
               className="shrink-0"
            />
            <Box className="min-w-0 flex-1 space-y-2">
               <Skeleton
                  variant="text"
                  width="46%"
                  height={26}
               />
               <Skeleton
                  variant="text"
                  width="32%"
               />
               <Skeleton
                  variant="text"
                  width="58%"
               />
            </Box>
            <Skeleton
               variant="rounded"
               width={112}
               height={38}
               className="hidden shrink-0 md:block"
            />
         </Box>
      ))}
   </Box>
)

export const UserCompanyListSkeleton = () => (
   <Box className="border-border bg-surface overflow-hidden rounded-xl border">
      {Array.from({ length: 6 }).map((_, index) => (
         <Box
            key={index}
            className="border-border flex min-h-32 items-center gap-4 border-b px-5 py-5 last:border-b-0">
            <Skeleton
               variant="rounded"
               width={56}
               height={56}
               className="shrink-0"
            />
            <Box className="min-w-0 flex-1 space-y-2">
               <Skeleton
                  variant="text"
                  width="35%"
                  height={24}
               />
               <Skeleton
                  variant="text"
                  width="75%"
               />
               <Skeleton
                  variant="text"
                  width="28%"
               />
            </Box>
            <Skeleton
               variant="rounded"
               width={124}
               height={38}
               className="hidden shrink-0 lg:block"
            />
         </Box>
      ))}
   </Box>
)

export const UserJobDetailsSkeleton = () => (
   <Box className="mx-auto max-w-360 space-y-5">
      <Skeleton
         variant="rounded"
         width={120}
         height={38}
      />
      <Box className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_365px]">
         <Box className="space-y-5">
            <Box className="border-border bg-surface flex min-h-56 items-center gap-6 rounded-xl border p-6">
               <Skeleton
                  variant="rounded"
                  width={108}
                  height={108}
                  className="shrink-0"
               />
               <Box className="flex-1 space-y-2">
                  <Skeleton
                     variant="text"
                     width="28%"
                  />
                  <Skeleton
                     variant="text"
                     width="52%"
                     height={36}
                  />
                  <Skeleton
                     variant="text"
                     width="36%"
                  />
               </Box>
            </Box>
            <Skeleton
               variant="rounded"
               height={360}
            />
         </Box>
         <Box className="space-y-5">
            <Skeleton
               variant="rounded"
               height={220}
            />
            <Skeleton
               variant="rounded"
               height={340}
            />
         </Box>
      </Box>
   </Box>
)

export const UserCompanyDetailsSkeleton = () => (
   <Box className="space-y-5">
      <Skeleton
         variant="text"
         width={180}
         height={28}
      />
      <Box className="border-border bg-surface flex min-h-48 items-center gap-5 rounded-xl border p-6">
         <Skeleton
            variant="rounded"
            width={112}
            height={112}
            className="shrink-0"
         />
         <Box className="flex-1 space-y-2">
            <Skeleton
               variant="text"
               width="38%"
               height={34}
            />
            <Skeleton
               variant="text"
               width="72%"
            />
            <Skeleton
               variant="text"
               width="25%"
            />
         </Box>
      </Box>
      <Box className="border-border flex gap-4 border-b py-2">
         <Skeleton
            variant="rounded"
            width={92}
            height={34}
         />
         <Skeleton
            variant="rounded"
            width={92}
            height={34}
         />
      </Box>
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <Skeleton
            variant="rounded"
            height={230}
         />
         <Skeleton
            variant="rounded"
            height={230}
         />
         <Skeleton
            variant="rounded"
            height={180}
         />
         <Skeleton
            variant="rounded"
            height={180}
         />
      </Box>
   </Box>
)

export const UserProfileSkeleton = () => (
   <Box className="space-y-5">
      <Box>
         <Skeleton
            variant="text"
            width={220}
            height={38}
         />
         <Skeleton
            variant="text"
            width={360}
         />
      </Box>
      <Box className="border-border bg-surface flex min-h-40 items-center gap-5 rounded-xl border p-5">
         <Skeleton
            variant="circular"
            width={88}
            height={88}
         />
         <Box className="flex-1 space-y-2">
            <Skeleton
               variant="text"
               width="35%"
               height={30}
            />
            <Skeleton
               variant="text"
               width="48%"
            />
         </Box>
      </Box>
      <Box className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.9fr)]">
         <Box className="space-y-5">
            {[360, 210, 210, 260, 260, 220].map((height, index) => (
               <Skeleton
                  key={index}
                  variant="rounded"
                  height={height}
               />
            ))}
         </Box>
         <Box className="space-y-5">
            <Skeleton
               variant="rounded"
               height={210}
            />
            <Skeleton
               variant="rounded"
               height={260}
            />
         </Box>
      </Box>
   </Box>
)

export const UserSavedJobsSkeleton = () => (
   <Box>
      {Array.from({ length: 5 }).map((_, index) => (
         <Box
            key={index}
            className="border-border grid min-h-26 grid-cols-1 items-center gap-5 border-b px-5 py-4 last:border-b-0 md:grid-cols-[minmax(280px,1.6fr)_150px_135px_145px_90px]">
            <Box className="flex items-center gap-4">
               <Skeleton
                  variant="rounded"
                  width={54}
                  height={54}
               />
               <Box className="flex-1 space-y-2">
                  <Skeleton
                     variant="text"
                     width="50%"
                  />
                  <Skeleton
                     variant="text"
                     width="34%"
                  />
               </Box>
            </Box>
            {[0, 1, 2].map(item => (
               <Skeleton
                  key={item}
                  variant="text"
                  width="65%"
               />
            ))}
            <Skeleton
               variant="circular"
               width={32}
               height={32}
            />
         </Box>
      ))}
   </Box>
)

export const UserCompanyJobsSkeleton = () => (
   <Box className="border-border bg-surface overflow-hidden rounded-xl border">
      {Array.from({ length: 6 }).map((_, index) => (
         <Box
            key={index}
            className="border-border grid min-h-24 grid-cols-1 items-center gap-4 border-b px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_150px_120px]">
            <Box className="space-y-2">
               <Skeleton
                  variant="text"
                  width="52%"
               />
               <Skeleton
                  variant="text"
                  width="35%"
               />
            </Box>
            <Skeleton
               variant="rounded"
               width={126}
               height={30}
            />
            <Skeleton
               variant="rounded"
               width={112}
               height={36}
            />
         </Box>
      ))}
   </Box>
)
