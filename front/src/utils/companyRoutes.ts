export const getUserCompanyDetailsPath = (companyId: string, slug: string) => {
   const companyPath = `/companies/${encodeURIComponent(companyId)}`
   const currentSlug = slug.trim()

   if (!currentSlug) {
      return companyPath
   }

   return `${companyPath}/${encodeURIComponent(currentSlug)}`
}

export const getAdminCompanyDetailsPath = (companyId: string) =>
   `/admin/companies/${encodeURIComponent(companyId)}`
