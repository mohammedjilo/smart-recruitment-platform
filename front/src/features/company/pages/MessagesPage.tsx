import { useMemo } from "react"
import {
   Box,
   Avatar,
   Button,
   Divider,
   List,
   ListItem,
   ListItemButton,
   Paper,
   Stack,
   TextField,
   Typography
} from "@mui/material"
import { ArrowBack, SendOutlined } from "@mui/icons-material"
import { useNavigate, useParams } from "react-router-dom"
import ConversationMessageList from "@/components/common/ConversationMessageList"
import { useGetCompanyConversationsQuery } from "@/services/shared/messageApiCalls"
import ConversationWorkspaceSkeleton from "@/components/common/ConversationWorkspaceSkeleton"
import useConversationMessaging from "@/features/shared/useConversationMessaging"

const MessagesPage = () => {
   const navigate = useNavigate()
   const { conversationId } = useParams<{ conversationId?: string }>()

   const { data: conversationsData, isLoading: isLoadingConversations } =
      useGetCompanyConversationsQuery(undefined)

   const conversations = conversationsData?.data ?? []

   const selectedConversation = useMemo(
      () => conversations.find(item => item.id === conversationId) ?? null,
      [conversationId, conversations]
   )
   const isConversationMissing = Boolean(
      conversationId && !isLoadingConversations && !selectedConversation
   )

   const { draft, setDraft, isSending, handleSend } =
      useConversationMessaging(selectedConversation)

   if (isLoadingConversations) {
      return <ConversationWorkspaceSkeleton />
   }

   return (
      <Box className="min-h-full">
         <Box className="mb-4 flex items-center justify-between gap-3">
            <Typography className="text-content text-2xl! font-bold!">
               Messages
            </Typography>
            {conversationId && (
               <Button
                  startIcon={<ArrowBack />}
                  onClick={() => navigate("/company/messages")}
                  className="app-button-secondary normal-case!">
                  Back
               </Button>
            )}
         </Box>

         <Box className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
            <Paper
               className={`${selectedConversation ? "hidden lg:block" : "block"} border-border bg-surface overflow-hidden rounded-xl border`}>
               <Box className="border-border border-b px-4 py-3">
                  <Typography className="text-content text-sm! font-semibold!">
                     Conversations
                  </Typography>
               </Box>

               <List disablePadding>
                  {conversations.length === 0 ? (
                     <ListItem className="text-muted px-4 py-6 text-sm">
                        No conversations yet.
                     </ListItem>
                  ) : (
                     conversations.map(conversation => {
                        const userName =
                           `${conversation.user?.firstName ?? ""} ${conversation.user?.lastName ?? ""}`.trim() ||
                           "Candidate"
                        const lastMessage = conversation.messages?.[0]
                        const isSelected = conversation.id === selectedConversation?.id

                        return (
                           <ListItem
                              key={conversation.id}
                              disablePadding
                              className="px-2 py-1">
                              <ListItemButton
                                 onClick={() =>
                                    navigate(`/company/messages/${conversation.id}`)
                                 }
                                 aria-current={isSelected ? "page" : undefined}
                                 className={`focus-visible:outline-primary flex! w-full! flex-col! items-stretch! rounded-xl! border-l-4! px-3! py-3! text-left! transition-colors! focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] ${
                                    isSelected
                                       ? "border-indigo-600! bg-indigo-50!"
                                       : "border-transparent! bg-surface! hover:bg-slate-50!"
                                 }`}>
                                 <Box className="flex min-w-0 w-full items-center gap-3">
                                    <Avatar
                                       src={conversation.user?.profilePicUrl ?? undefined}
                                       alt={userName}
                                       className="h-10! w-10! shrink-0! bg-indigo-100! text-sm! font-semibold! text-indigo-700!">
                                       {userName
                                          .split(/\s+/)
                                          .map(part => part[0])
                                          .join("")
                                          .slice(0, 2)
                                          .toUpperCase()}
                                    </Avatar>
                                    <Box className="min-w-0 flex-1">
                                       <Box className="flex items-center justify-between gap-2">
                                          <Typography className="text-content! truncate! text-sm! font-semibold!">
                                             {userName}
                                          </Typography>
                                          {conversation.unreadCount ? (
                                             <Box className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[10px] font-bold text-white">
                                                {conversation.unreadCount}
                                             </Box>
                                          ) : null}
                                       </Box>
                                       <Typography className="mt-0.5! truncate! text-xs! text-muted!">
                                          {conversation.application?.job?.title ??
                                             "Application discussion"}
                                       </Typography>
                                    </Box>
                                 </Box>
                                 <Typography className="mt-2! line-clamp-1! w-full! pl-[52px]! text-xs! text-muted!">
                                    {lastMessage?.content ?? "Start the conversation"}
                                 </Typography>
                              </ListItemButton>
                           </ListItem>
                        )
                     })
                  )}
               </List>
            </Paper>

            <Paper
               className={`${selectedConversation ? "flex" : "hidden lg:flex"} border-border bg-surface h-[70vh] max-h-180 min-h-105 flex-col overflow-hidden rounded-xl border`}>
               {!selectedConversation ? (
                  <Box className="text-muted flex flex-1 items-center justify-center text-sm">
                     {isConversationMissing
                        ? "Conversation not found."
                        : "Select a conversation to start messaging."}
                  </Box>
               ) : (
                  <>
                     <Box className="border-border border-b px-4 py-3">
                        <Typography className="text-content text-base! font-semibold!">
                           {`${selectedConversation.user?.firstName ?? ""} ${selectedConversation.user?.lastName ?? ""}`.trim() ||
                              "Candidate"}
                        </Typography>
                        <Typography className="text-muted text-xs">
                           {selectedConversation.application?.job?.title ?? "Application"}
                        </Typography>
                     </Box>

                     <ConversationMessageList
                        key={selectedConversation.id}
                        conversationId={selectedConversation.id}
                        participant="company"
                        color="indigo"
                     />

                     <Divider />

                     <Box className="p-3">
                        <Stack
                           direction={{ xs: "column", sm: "row" }}
                           spacing={1.5}>
                           <TextField
                              fullWidth
                              multiline
                              minRows={2}
                              maxRows={4}
                              value={draft}
                              onChange={event => setDraft(event.target.value)}
                              placeholder="Write a message..."
                           />
                           <Button
                              variant="contained"
                              startIcon={<SendOutlined />}
                              onClick={handleSend}
                              disabled={!draft.trim() || isSending}
                              className="app-button-primary px-4! py-2! normal-case!">
                              {isSending ? "Sending..." : "Send"}
                           </Button>
                        </Stack>
                     </Box>
                  </>
               )}
            </Paper>
         </Box>
      </Box>
   )
}

export default MessagesPage
