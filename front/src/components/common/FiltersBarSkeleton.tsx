import { Box, Skeleton } from "@mui/material"
import FiltersBar from "./FiltersBar"

export type FilterSkeletonField = "search" | "control"

type FiltersBarSkeletonProps = {
   fields?: FilterSkeletonField[]
   layout?: "row" | "grid"
   responsiveAt?: "sm" | "md" | "lg" | "xl"
   className?: string
   pillCount?: number
   showAction?: boolean
}

const FiltersBarSkeleton = ({
   fields = ["search", "control", "control"],
   layout = "row",
   responsiveAt = "md",
   className,
   pillCount,
   showAction = false
}: FiltersBarSkeletonProps) => {
   if (pillCount !== undefined) {
      return (
         <Box className={`flex flex-wrap items-center justify-between gap-2 ${className ?? ""}`}>
            <Box className="flex flex-wrap items-center gap-2 rounded-xl border border-[#E3EAF4] bg-[#F8FAFD] p-1">
               {Array.from({ length: pillCount }).map((_, index) => (
                  <Skeleton
                     className="rounded-lg!"
                     key={index}
                     height={32}
                     variant="rounded"
                     width={index % 2 === 0 ? 72 : 94}
                  />
               ))}
            </Box>
            {showAction && (
               <Skeleton
                  className="rounded-md!"
                  height={36}
                  variant="rounded"
                  width={132}
               />
            )}
         </Box>
      )
   }

   return (
      <FiltersBar
         className={className}
         layout={layout}
         responsiveAt={responsiveAt}>
         {fields.map((field, index) => (
            <Skeleton
               className={
                  layout === "grid"
                     ? "w-full"
                     : field === "search"
                       ? "w-full md:max-w-70 md:flex-1"
                       : "w-full md:w-45"
               }
               key={`${field}-${index}`}
               height={field === "search" ? 44 : 40}
               variant="rounded"
            />
         ))}
      </FiltersBar>
   )
}

export default FiltersBarSkeleton
