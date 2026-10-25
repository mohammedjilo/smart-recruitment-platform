export const userTopicCategoryMap: Record<string, string> = {
   applications: "Applications",
   "job-search": "Job Search",
   profile: "Profile",
   security: "Account & Security",
   technical: "Technical Issue",
   other: "Other"
}

export const companyTopicCategoryMap: Record<string, string> = {
   jobs: "Jobs",
   applications: "Applications",
   users: "Users / Candidates",
   "company-account": "Company Account",
   technical: "Technical Issue",
   other: "Other"
}

export const getCategoryNameForTopic = (
   portalType: "user" | "company",
   topicId?: string
): string | undefined => {
   if (!topicId) {
      return undefined
   }

   if (portalType === "company") {
      return companyTopicCategoryMap[topicId]
   }

   return userTopicCategoryMap[topicId]
}
