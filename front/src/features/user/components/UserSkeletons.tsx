import { Box, Skeleton } from "@mui/material"

export const UserJobListSkeleton = () => (
   <Box className="border-border bg-surface overflow-hidden rounded-xl border">
      {Array.from({ length: 6 }).map((_, index) => (
         <Box
            className="border-border flex min-h-32 items-center gap-5 border-b px-7 py-5 last:border-b-0"
            key={index}>
            <Skeleton
               className="shrink-0"
               height={96}
               variant="rounded"
               width={96}
            />
            <Box className="min-w-0 flex-1 space-y-2">
               <Skeleton
                  height={26}
                  variant="text"
                  width="46%"
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
               className="hidden shrink-0 md:block"
               height={38}
               variant="rounded"
               width={112}
            />
         </Box>
      ))}
   </Box>
)

export const UserCompanyListSkeleton = () => (
   <Box className="border-border bg-surface overflow-hidden rounded-xl border">
      {Array.from({ length: 6 }).map((_, index) => (
         <Box
            className="border-border flex min-h-32 items-center gap-4 border-b px-5 py-5 last:border-b-0"
            key={index}>
            <Skeleton
               className="shrink-0"
               height={56}
               variant="rounded"
               width={56}
            />
            <Box className="min-w-0 flex-1 space-y-2">
               <Skeleton
                  height={24}
                  variant="text"
                  width="35%"
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
               className="hidden shrink-0 lg:block"
               height={38}
               variant="rounded"
               width={124}
            />
         </Box>
      ))}
   </Box>
)

export const UserJobDetailsSkeleton = () => (
   <Box className="mx-auto max-w-360 space-y-5">
      <Skeleton
         height={38}
         variant="rounded"
         width={120}
      />
      <Box className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_365px]">
         <Box className="space-y-5">
            <Box className="border-border bg-surface flex min-h-56 items-center gap-6 rounded-xl border p-6">
               <Skeleton
                  className="shrink-0"
                  height={108}
                  variant="rounded"
                  width={108}
               />
               <Box className="flex-1 space-y-2">
                  <Skeleton
                     variant="text"
                     width="28%"
                  />
                  <Skeleton
                     height={36}
                     variant="text"
                     width="52%"
                  />
                  <Skeleton
                     variant="text"
                     width="36%"
                  />
               </Box>
            </Box>
            <Skeleton
               height={360}
               variant="rounded"
            />
         </Box>
         <Box className="space-y-5">
            <Skeleton
               height={220}
               variant="rounded"
            />
            <Skeleton
               height={340}
               variant="rounded"
            />
         </Box>
      </Box>
   </Box>
)

export const UserCompanyDetailsSkeleton = () => (
   <Box className="space-y-5">
      <Skeleton
         height={28}
         variant="text"
         width={180}
      />
      <Box className="border-border bg-surface flex min-h-48 items-center gap-5 rounded-xl border p-6">
         <Skeleton
            className="shrink-0"
            height={112}
            variant="rounded"
            width={112}
         />
         <Box className="flex-1 space-y-2">
            <Skeleton
               height={34}
               variant="text"
               width="38%"
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
            height={34}
            variant="rounded"
            width={92}
         />
         <Skeleton
            height={34}
            variant="rounded"
            width={92}
         />
      </Box>
      <Box className="grid grid-cols-1 gap-5 xl:grid-cols-2">
         <Skeleton
            height={230}
            variant="rounded"
         />
         <Skeleton
            height={230}
            variant="rounded"
         />
         <Skeleton
            height={180}
            variant="rounded"
         />
         <Skeleton
            height={180}
            variant="rounded"
         />
      </Box>
   </Box>
)

export const UserProfileSkeleton = () => (
   <Box className="space-y-5">
      <Box>
         <Skeleton
            height={38}
            variant="text"
            width={220}
         />
         <Skeleton
            variant="text"
            width={360}
         />
      </Box>
      <Box className="border-border bg-surface flex min-h-40 items-center gap-5 rounded-xl border p-5">
         <Skeleton
            height={88}
            variant="circular"
            width={88}
         />
         <Box className="flex-1 space-y-2">
            <Skeleton
               height={30}
               variant="text"
               width="35%"
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
                  height={height}
                  variant="rounded"
               />
            ))}
         </Box>
         <Box className="space-y-5">
            <Skeleton
               height={210}
               variant="rounded"
            />
            <Skeleton
               height={260}
               variant="rounded"
            />
         </Box>
      </Box>
   </Box>
)

export const UserSavedJobsSkeleton = () => (
   <Box>
      {Array.from({ length: 5 }).map((_, index) => (
         <Box
            className="border-border grid min-h-26 grid-cols-1 items-center gap-5 border-b px-5 py-4 last:border-b-0 md:grid-cols-[minmax(280px,1.6fr)_150px_135px_145px_90px]"
            key={index}>
            <Box className="flex items-center gap-4">
               <Skeleton
                  height={54}
                  variant="rounded"
                  width={54}
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
               height={32}
               variant="circular"
               width={32}
            />
         </Box>
      ))}
   </Box>
)
