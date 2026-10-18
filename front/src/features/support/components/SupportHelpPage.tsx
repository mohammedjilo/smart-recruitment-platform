import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Alert, Box, Button, Typography } from "@mui/material"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"
import DataTable, { type DataTableColumn } from "@/components/common/DataTable"
import { useGetMySupportTicketsQuery } from "@/services/shared/supportApiCalls"
import type {
   SupportTicketListItem
} from "@/types/entities/support"
import type { SupportPortalConfig, SupportTopic } from "@/features/support/types"
import { formatCreatedAt } from "@/utils/formatDate"
import SupportChip from "@/features/support/components/SupportChip"
import PriorityChip from "@/features/support/components/PriorityChip"
import TopicCard from "./TopicCard"
import Tabs from "./Tabs"
import Header from "./Header"
import Search from "./Search"
import NeedMoreHelpCard from "./NeedMoreHelpCard"

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

   type SupportTableTicket = SupportTicketListItem & Record<string, unknown>

   const supportRequestColumns: DataTableColumn<SupportTableTicket>[] = [
      {
         id: "id",
         header: "Ticket ID",
         render: ticket => (
            <Typography className="max-w-35! truncate! text-sm! text-muted!">
               {ticket.id}
            </Typography>
         )
      },
      {
         id: "subject",
         header: "Subject",
         render: ticket => (
            <Typography className="min-w-40! text-sm! font-semibold! text-content!">
               {ticket.subject}
            </Typography>
         )
      },
      {
         id: "category",
         header: "Category",
         render: ticket => (
            <Typography className="text-sm! text-muted!">
               {ticket.category?.name ?? "General"}
            </Typography>
         )
      },
      {
         id: "priority",
         header: "Priority",
         render: ticket => <PriorityChip priority={ticket.priority} />
      },
      {
         id: "status",
         header: "Status",
         render: ticket => (
            <SupportChip
               kind="status"
               value={ticket.status}
            />
         )
      },
      {
         id: "created-at",
         header: "Created",
         render: ticket => (
            <Typography className="text-sm! whitespace-nowrap! text-muted!">
               {formatCreatedAt(ticket.createdAt)}
            </Typography>
         )
      },
      {
         id: "updated-at",
         header: "Last Updated",
         render: ticket => (
            <Typography className="text-sm! whitespace-nowrap! text-muted!">
               {formatCreatedAt(ticket.updatedAt)}
            </Typography>
         )
      },
      {
         id: "view",
         header: "Action",
         align: "center",
         render: ticket => (
            <Button
               size="small"
               variant="outlined"
               startIcon={<VisibilityOutlinedIcon className="text-[16px]!" />}
               onClick={event => {
                  event.stopPropagation()
                  handleTicketClick(ticket.id)
               }}
               className="rounded-lg! px-3! py-1! text-xs! font-semibold! normal-case!">
               View
            </Button>
         )
      }
   ]

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

   const handleTicketClick = (ticketId: string) => {
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
                        title={config.title}
                        subtitle={config.subtitle}
                     />

                     <Tabs
                        activeTab={activeTab}
                        onChange={setActiveTab}
                     />

                     {activeTab === 0 ? (
                        <>
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
                                    <Typography className="text-sm! text-muted!">
                                       No help articles found.
                                    </Typography>
                                 </Box>
                              )}
                           </Box>
                        </>
                     ) : (
                        <Box className="mt-6">
                           {isTicketsError ? (
                              <Box className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
                                 <Typography className="text-sm! font-semibold! text-red-700!">
                                    We could not load your support requests.
                                 </Typography>
                                 <Button
                                    variant="outlined"
                                    onClick={() => refetchTickets()}
                                    className="mt-3! rounded-lg! border-red-300! px-4! py-2! text-xs! font-semibold! text-red-700! normal-case!">
                                    Try again
                                 </Button>
                              </Box>
                           ) : (
                              <DataTable
                                 rows={supportRequests as SupportTableTicket[]}
                                 columns={supportRequestColumns}
                                 getRowKey={ticket => ticket.id}
                                 isLoading={isLoadingTickets && !hasTicketsResponse}
                                 isFetching={isFetchingTickets}
                                 emptyState={
                                    <Box className="p-8 text-center">
                                       <Typography className="text-sm! font-semibold! text-content!">
                                          You haven't submitted any support requests yet.
                                       </Typography>
                                       <Button
                                          variant="contained"
                                          onClick={handleCreateRequest}
                                          className="app-button-primary mt-3! rounded-[10px]! font-bold! normal-case! shadow-none!">
                                          Create one now
                                       </Button>
                                    </Box>
                                 }
                                 itemLabel="support requests"
                                 pagination={
                                    ticketsMeta ?? {
                                       page: ticketsPage,
                                       pageSize: 10,
                                       totalCount: 0
                                    }
                                 }
                                 onPageChange={setTicketsPage}
                              />
                           )}
                        </Box>
                     )}
                  </main>

                  <aside className="border-t border-border bg-[#f8fbff] p-6 lg:border-t-0 lg:border-l">
                     <NeedMoreHelpCard
                        responseTime={config.responseTime}
                        supportHours={config.supportHours}
                        contactEmail={config.contactEmail}
                        onCreateRequest={handleCreateRequest}
                     />
                  </aside>
               </Box>
            </Box>
         </Box>

         {!activeTab && (
            <Alert
               severity="info"
               className="mx-auto mt-3! max-w-295! rounded-xl!">
               Support request creation is now connected to the backend.
            </Alert>
         )}
      </Box>
   )
}
