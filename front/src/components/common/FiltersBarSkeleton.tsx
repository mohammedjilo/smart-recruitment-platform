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
                     key={index}
                     variant="rounded"
                     width={index % 2 === 0 ? 72 : 94}
                     height={32}
                     className="rounded-lg!"
                  />
               ))}
            </Box>
            {showAction && (
               <Skeleton
                  variant="rounded"
                  width={132}
                  height={36}
                  className="rounded-md!"
               />
            )}
         </Box>
      )
   }

   return (
      <FiltersBar
         layout={layout}
         responsiveAt={responsiveAt}
         className={className}>
         {fields.map((field, index) => (
            <Skeleton
               key={`${field}-${index}`}
               variant="rounded"
               height={field === "search" ? 44 : 40}
               className={
                  layout === "grid"
                     ? "w-full"
                     : field === "search"
                       ? "w-full md:max-w-70 md:flex-1"
                       : "w-full md:w-45"
               }
            />
         ))}
      </FiltersBar>
   )
}

export default FiltersBarSkeleton
