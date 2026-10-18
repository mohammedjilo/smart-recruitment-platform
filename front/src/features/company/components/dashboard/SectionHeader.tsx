import { Link } from "react-router-dom"

interface SectionHeaderProps {
   title: string
   href?: string
}

const SectionHeader = ({ title, href }: SectionHeaderProps) => {
   return (
      <div className="flex items-center justify-between px-5 pt-4">
         <h2 className="text-[16px] font-semibold text-[#101828]">{title}</h2>

         {href && (
            <Link
               to={href}
               className="text-link hover:text-link-hover text-[13px] font-medium transition">
               View all
            </Link>
         )}
      </div>
   )
}
export default SectionHeader
