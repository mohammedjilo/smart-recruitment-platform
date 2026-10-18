import { useState } from "react"

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded"
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined"
import { Box, Button, Typography } from "@mui/material"

import type { SupportArticle } from "@/features/support/types"

type Props = {
   article: SupportArticle
   topicTitle: string
   onBack?: () => void
   onCreateRequest?: () => void
}

export default function SupportArticleDetails({
   article,
   topicTitle,
   onBack,
   onCreateRequest
}: Props) {
   const [helpfulState, setHelpfulState] = useState<"yes" | "no" | null>(null)
   const Icon = article.icon ?? HelpOutlineOutlinedIcon

   return (
      <Box className="min-h-screen bg-[#f7fbff] px-4 py-8 sm:px-6 lg:px-8">
         <Box className="mx-auto max-w-245">
            <button
               type="button"
               onClick={onBack}
               className="mb-5 flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-blue-600">
               <ArrowBackRoundedIcon className="text-[19px]" />
               Back to {topicTitle}
            </button>

            <Box className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_35px_rgba(30,64,175,0.05)]">
               <Box className="border-b border-border bg-[#f8fbff] p-6 sm:p-8">
                  <Box className="flex items-start gap-4">
                     <Box className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <Icon className="text-[30px]" />
                     </Box>

                     <Box>
                        <Typography className="text-[11px]! font-semibold! tracking-[0.18em]! text-blue-500! uppercase!">
                           {topicTitle}
                        </Typography>
                        <Typography
                           component="h1"
                           className="text-content! mt-2! text-[26px]! leading-[1.2]! font-bold! tracking-[-0.02em]!">
                           {article.title}
                        </Typography>
                        <Typography className="mt-3! max-w-3xl! text-sm! leading-6! text-muted!">
                           {article.description}
                        </Typography>
                     </Box>
                  </Box>
               </Box>

               <Box className="p-6 sm:p-8">
                  <Box className="space-y-6">
                     {article.content.map((section, sectionIndex) => (
                        <section
                           key={section.id}
                           className="rounded-2xl border border-border bg-bg/60 p-5 sm:p-6">
                           {section.title && (
                              <Typography className="text-lg! font-bold! text-content!">
                                 {sectionIndex + 1}. {section.title}
                              </Typography>
                           )}

                           {section.description && (
                              <Typography className="mt-3! text-sm! leading-6! text-muted!">
                                 {section.description}
                              </Typography>
                           )}

                           {section.steps && section.steps.length > 0 && (
                              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted">
                                 {section.steps.map((step, index) => (
                                    <li key={`${section.id}-step-${index}`}>{step}</li>
                                 ))}
                              </ol>
                           )}

                           {section.note && (
                              <Box className="mt-4 rounded-xl border border-border bg-blue-50/60 px-4 py-3 text-sm text-blue-700">
                                 <Typography className="font-semibold!">Note:</Typography>{" "}
                                 {section.note}
                              </Box>
                           )}

                           {section.tip && (
                              <Box className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                 <Typography className="font-semibold!">Tip:</Typography>{" "}
                                 {section.tip}
                              </Box>
                           )}

                           {section.warning && (
                              <Box className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                 <Typography className="font-semibold!">
                                    Warning:
                                 </Typography>{" "}
                                 {section.warning}
                              </Box>
                           )}
                        </section>
                     ))}
                  </Box>

                  <Box className="mt-8 rounded-2xl border border-border bg-[#f8fbff] p-5">
                     <Typography className="text-sm! font-bold! text-content!">
                        Was this article helpful?
                     </Typography>

                     <Box className="mt-4 flex flex-wrap gap-3">
                        <Button
                           variant={helpfulState === "yes" ? "contained" : "outlined"}
                           onClick={() => setHelpfulState("yes")}
                           className="min-w-27.5! rounded-[10px]! font-semibold! normal-case!">
                           Yes
                        </Button>

                        <Button
                           variant={helpfulState === "no" ? "contained" : "outlined"}
                           onClick={() => setHelpfulState("no")}
                           className="min-w-27.5! rounded-[10px]! font-semibold! normal-case!">
                           No
                        </Button>
                     </Box>

                     <Typography className="mt-4! text-xs! text-muted!">
                        {helpfulState === "yes"
                           ? "Thanks for letting us know this article was helpful."
                           : helpfulState === "no"
                             ? "Thanks for the feedback — you can still create a support request for more help."
                             : "Tell us how we can improve this article."}
                     </Typography>
                  </Box>

                  <Box className="mt-8 rounded-2xl border border-border bg-bg p-5">
                     <Typography className="text-sm! font-bold! text-content!">
                        Still need help?
                     </Typography>

                     <Typography className="mt-2! text-sm! leading-6! text-muted!">
                        If this article did not answer your question, you can create a
                        support request and the team will follow up with you.
                     </Typography>

                     <Button
                        fullWidth
                        variant="contained"
                        onClick={onCreateRequest}
                        className="app-button-primary mt-3! rounded-[10px]! py-[9.6px]! font-bold! normal-case! shadow-none!">
                        Create Support Request
                     </Button>
                  </Box>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}
