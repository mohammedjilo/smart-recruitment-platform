import SupportHelpContent from "@/features/support/components/SupportHelpPage"
import { userSupportConfig } from "../config/support.config"

export default function SupportHelpPage() {
   return <SupportHelpContent config={userSupportConfig} />
}
