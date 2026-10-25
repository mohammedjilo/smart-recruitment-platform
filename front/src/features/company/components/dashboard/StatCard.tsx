import CommonStatCard from "@/components/common/StatCard"

interface StatCardProps {
   title: string
   value: number
   description: string
   icon: React.ReactNode
}

const StatCard = ({ title, value, description, icon }: StatCardProps) => {
   return (
      <CommonStatCard
         className="min-h-32.5 shadow-[0_1px_2px_rgba(16,24,40,0.03)]"
         value={value}
         description={description}
         icon={icon}
         iconClassName="bg-[#F0EAFF] text-[#5B35D5]"
         label={title}
      />
   )
}
export default StatCard
