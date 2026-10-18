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
         label={title}
         value={value}
         icon={
            <Icon
               sx={{
                  fontSize: 27,
                  color: iconColor
               }}
            />
         }
         iconSx={{ backgroundColor: iconBackground }}
         className="min-h-29 shadow-[0_2px_12px_rgba(15,23,42,0.04)]"
      />
   )
}
