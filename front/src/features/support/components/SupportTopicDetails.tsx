import { useMemo, useState } from "react"
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import { Box, Button, TextField, Typography } from "@mui/material"
import SearchSubmitAdornment from "@/components/common/SearchSubmitAdornment"
import { useSubmittedSearch } from "@/components/common/useSubmittedSearch"
import type {
   SupportArticle,
   SupportTopicDetailsData
} from "@/features/support/types"

type Props = {
   data: SupportTopicDetailsData
   onBack?: () => void
   onCreateRequest?: () => void
   onArticleClick?: (article: SupportArticle) => void
}

export default function SupportTopicDetails({
   data,
   onBack,
   onCreateRequest,
   onArticleClick
}: Props) {
   const [search, setSearch] = useState("")
   const searchInput = useSubmittedSearch(search, setSearch)
   const TopicIcon = data.icon

   const filteredArticles = useMemo(() => {
      const query = search.trim().toLowerCase()

      if (!query) {
         return data.articles
      }

      return data.articles.filter(article => {
         return (
            article.title.toLowerCase().includes(query) ||
            article.description.toLowerCase().includes(query)
         )
      })
   }, [search, data.articles])

   return (
      <Box className="min-h-screen bg-[#f7fbff] px-4 py-8 sm:px-6 lg:px-8">
         <Box className="mx-auto max-w-262.5">
            <button
               type="button"
               onClick={onBack}
               className="mb-5 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-blue-600">
               <ArrowBackRoundedIcon className="text-[19px]" />
               Back to Support & Help
            </button>

            <Box className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_35px_rgba(30,64,175,0.05)]">
               <Box className="border-b border-border bg-[#f8fbff] p-6 sm:p-8">
                  <Box className="flex items-start gap-4">
                     <Box className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <TopicIcon />
                     </Box>

                     <Box>
                        <Typography
                           component="h1"
                           className="text-content! text-[26px]! leading-[1.2]! font-bold! tracking-[-0.02em]!">
                           {data.title}
                        </Typography>
                        <Typography className="mt-1.5! text-sm! text-muted!">
                           {data.description}
                        </Typography>
                     </Box>
                  </Box>
               </Box>

               <Box className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_280px]">
                  <Box>
                     <Typography className="text-[15px]! font-bold! text-content!">
                        Popular Articles
                     </Typography>

                     <Typography className="mt-1! text-xs! text-muted!">
                        Find answers and learn how to use this part of the platform.
                     </Typography>

                     <TextField
                        fullWidth
                        size="small"
                        value={searchInput.value}
                        onChange={searchInput.onChange}
                        onKeyDown={searchInput.onKeyDown}
                        placeholder="Search articles"
                        className="mt-4"
                        slotProps={{
                           input: {
                              startAdornment: (
                                 <SearchSubmitAdornment onSearch={searchInput.submit} />
                              )
                           }
                        }}
                     />

                     {filteredArticles.length > 0 ? (
                        <Box className="mt-5 space-y-3">
                           {filteredArticles.map(article => (
                              <Box
                                 key={article.id}
                                 className="rounded-xl border border-border bg-bg p-4 transition hover:border-blue-200 hover:bg-blue-50/30">
                                 <button
                                    type="button"
                                    onClick={() => onArticleClick?.(article)}
                                    className="w-full text-left">
                                    <Typography className="text-sm! font-semibold! text-content!">
                                       {article.title}
                                    </Typography>
                                    <Typography className="mt-1! text-xs! text-muted!">
                                       {article.description}
                                    </Typography>
                                 </button>
                              </Box>
                           ))}
                        </Box>
                     ) : (
                        <Box className="mt-5 rounded-xl border border-dashed border-border bg-bg p-6 text-center">
                           <Typography className="text-sm! text-muted!">
                              No articles match your search.
                           </Typography>
                        </Box>
                     )}
                  </Box>

                  <Box className="rounded-2xl border border-border bg-[#f8fbff] p-5">
                     <Typography className="text-xs! font-semibold! tracking-[0.18em]! text-blue-600! uppercase!">
                        Need help?
                     </Typography>

                     <Typography className="mt-3! text-sm! text-muted!">
                        Response time: Within 24 hours
                     </Typography>

                     <Typography className="mt-2! text-sm! text-muted!">
                        Support hours: Sun - Thu, 9:00 AM - 6:00 PM
                     </Typography>

                     <Button
                        variant="contained"
                        size="small"
                        onClick={onCreateRequest}
                        className="mt-5! w-full! rounded-lg! normal-case!">
                        Create Support Request
                     </Button>
                  </Box>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}
