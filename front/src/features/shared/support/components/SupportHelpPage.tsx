import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Alert, Box, Button, Typography } from "@mui/material"
import DataTable from "@/components/common/DataTable"
import { useGetMySupportTicketsQuery } from "@/services/shared/supportApiCalls"
import type {
   SupportTicketListItem
} from "@/types/entities/support"
import type { SupportPortalConfig, SupportTopic } from "../types"
import TopicCard from "./TopicCard"
import Tabs from "./Tabs"
import Header from "./Header"
import Search from "./Search"
import NeedMoreHelpCard from "./NeedMoreHelpCard"
import {
   getSupportRequestColumns,
   type SupportTableTicket
} from "../columns/supportRequestColumns"

type Props = {
   config: SupportPortalConfig
}

export default function SupportHelpPage({ config }: Props) {
   const navigate = useNavigate()
   const [activeTab, setActiveTab] = useState(0)
   const [search, setSearch] = useState("")
   const [ticketsPage, setTicketsPage] = useState(1)

   const {
      data: ticketsData,
      isLoading: isLoadingTickets,
      isFetching: isFetchingTickets,
      isError: isTicketsError,
      refetch: refetchTickets
   } = useGetMySupportTicketsQuery(
      { page: ticketsPage, pageSize: 10 },
      { skip: activeTab !== 1 }
   )

   const filteredTopics = useMemo(() => {
      const query = search.trim().toLowerCase()

      if (!query) {
         return config.topics
      }

      return config.topics.filter(topic => {
         return (
            topic.title.toLowerCase().includes(query) ||
            topic.description.toLowerCase().includes(query)
         )
      })
   }, [search, config.topics])

   const supportRequests: SupportTicketListItem[] = ticketsData?.data ?? []
   const ticketsMeta = ticketsData?.meta
   const hasTicketsResponse = Boolean(ticketsData?.data)

   const supportRequestColumns = getSupportRequestColumns(handleTicketClick)

   const handleTopicClick = (topic: SupportTopic) => {
      if (
         config.portalType === "user" &&
         topic.id === "application-employment-guide"
      ) {
         navigate("/user/support/application-guide")
         return
      }

       if (config.portalType === "company") {
         navigate(`/company/support/${topic.id}`)
         return
      }

      navigate(`/user/support/${topic.id}`)
   }

   const handleCreateRequest = () => {
      if (config.portalType === "company") {
         navigate("/company/support/requests/create")
         return
      }

      navigate("/user/support/requests/create")
   }

   function handleTicketClick(ticketId: string) {
      if (config.portalType === "company") {
         navigate(`/company/support/requests/${ticketId}`)
         return
      }

      navigate(`/user/support/requests/${ticketId}`)
   }

   return (
      <Box className="min-h-screen bg-[#f7fbff] px-4 py-8 sm:px-6 lg:px-8">
         <Box className="mx-auto max-w-295">
            <Box className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_8px_35px_rgba(30,64,175,0.05)]">
               <Box className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <main className="p-6 sm:p-8 lg:p-10">
                     <Header
                        subtitle={config.subtitle}
                        title={config.title}
                     />

                     <Tabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                     />

                     {activeTab === 0 ? (
                        <Box className="contents">
                           <Search
                              value={search}
                              onChange={setSearch}
                           />

                           <Box className="mt-6">
                              <Typography className="text-[14px]! font-bold! text-content!">
                                 Popular Topics
                              </Typography>

                              <Box className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                 {filteredTopics.map(topic => (
                                    <TopicCard
                                       key={topic.id}
                                       topic={topic}
                                       onClick={handleTopicClick}
                                    />
                                 ))}
                              </Box>

                              {filteredTopics.length === 0 && (
                                 <Box className="mt-5 rounded-xl border border-dashed border-border py-12 text-center">
                                    <Typography className="text-sm!" color="textSecondary">
                                       No help articles found.
                                    </Typography>
                                 </Box>
                              )}
                           </Box>
                        </Box>
                     ) : (
                        <Box className="mt-6">
                           {isTicketsError ? (
                              <Box className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                                 <Typography className="text-sm! font-semibold! text-red-700!">
                                    We could not load your support requests.
                                 </Typography>
                                 <Button
                                    className="mt-3! rounded-lg! border-red-300! px-4! py-2! text-xs! font-semibold! text-red-700! normal-case!"
                                    variant="outlined"
                                    onClick={() => refetchTickets()}>
                                    Try again
                                 </Button>
                              </Box>
                           ) : (
                              <DataTable
                                 columns={supportRequestColumns}
                                 emptyState={
                                    <Box className="p-8 text-center">
                                       <Typography className="text-sm! font-semibold! text-content!">
                                          You haven't submitted any support requests yet.
                                       </Typography>
                                       <Button
                                          className="mt-3! rounded-[10px]! font-bold! normal-case! shadow-none!"
                                          variant="contained"
                                          onClick={handleCreateRequest}>
                                          Create one now
                                       </Button>
                                    </Box>
                                 }
                                 getRowKey={ticket => ticket.id}
                                 isFetching={isFetchingTickets}
                                 isLoading={isLoadingTickets && !hasTicketsResponse}
                                 itemLabel="support requests"
                                 pagination={
                                    ticketsMeta ?? {
                                       page: ticketsPage,
                                       pageSize: 10,
                                       totalCount: 0
                                    }
                                 }
                                 rows={supportRequests as SupportTableTicket[]}
                                 onPageChange={setTicketsPage}
                              />
                           )}
                        </Box>
                     )}
                  </main>

                  <aside className="border-t border-border bg-[#f8fbff] p-6 lg:border-t-0 lg:border-l">
                     <NeedMoreHelpCard
                        contactEmail={config.contactEmail}
                        responseTime={config.responseTime}
                        supportHours={config.supportHours}
                        onCreateRequest={handleCreateRequest}
                     />
                  </aside>
               </Box>
            </Box>
         </Box>

         {!activeTab && (
            <Alert
               className="mx-auto mt-3! max-w-295! rounded-xl!"
               severity="info">
               Support request creation is now connected to the backend.
            </Alert>
         )}
      </Box>
   )
}
