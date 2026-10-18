import type { SvgIconComponent } from "@mui/icons-material"

export type SupportTopic = {
   id: string
   title: string
   description: string
   icon: SvgIconComponent
}

export type SupportPortalConfig = {
   portalType: "company" | "user"
   title: string
   subtitle: string
   topics: SupportTopic[]
   contactEmail: string
   supportHours: string
   responseTime: string
}

export type SupportArticleSection = {
   id: string
   title?: string
   description?: string
   steps?: string[]
   note?: string
   tip?: string
   warning?: string
}

export type SupportArticle = {
   id: string
   title: string
   description: string
   icon?: SvgIconComponent
   category?: string
   content: SupportArticleSection[]
}

export type SupportTopicDetailsData = {
   title: string
   description: string
   icon: SvgIconComponent
   articles: SupportArticle[]
}
