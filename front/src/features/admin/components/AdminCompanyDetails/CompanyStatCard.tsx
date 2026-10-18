import StatCard from "@/components/common/StatCard"

type Props = {
   title: string
   value: string | number
   subtitle: string
   icon: React.ReactNode
   iconClassName: string
}

const CompanyStatCard = ({ title, value, subtitle, icon, iconClassName }: Props) => {
   return (
      <StatCard
         label={title}
         value={value}
         description={subtitle}
         icon={icon}
         iconClassName={iconClassName}
      />
   )
}

export default CompanyStatCard
