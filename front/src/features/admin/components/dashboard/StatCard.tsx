import type { ElementType } from "react"
import CommonStatCard from "@/components/common/StatCard"

interface StatCardProps {
   title: string
   value: number
   icon: ElementType
   iconColor: string
   iconBackground: string
}

export default function StatCard({
   title,
   value,
   icon: Icon,
   iconColor,
   iconBackground
}: StatCardProps) {
   return (
      <CommonStatCard
         className="min-h-29 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
         value={value}
         icon={
            <Icon
               className="text-[27px]!"
               sx={{
                  color: iconColor
               }}
            />
         }
         iconSx={{ backgroundColor: iconBackground }}
         label={title}
      />
   )
}
