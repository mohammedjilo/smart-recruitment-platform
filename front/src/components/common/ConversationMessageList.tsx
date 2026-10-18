import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { Box, Button, CircularProgress, Typography } from "@mui/material"
import ConversationMessagesSkeleton from "@/components/common/ConversationMessagesSkeleton"

import {
   useGetConversationMessagesQuery,
   useLazyGetConversationMessagesQuery,
   type MessageItem
} from "@/services/shared/messageApiCalls"

type Props = {
   conversationId: string
   participant: "user" | "company"
   color: "violet" | "indigo"
}

type ScrollSnapshot = {
   height: number
   top: number
}

const mergeMessages = (current: MessageItem[] = [], incoming: MessageItem[] = []) => {
   const currentMessages = Array.isArray(current) ? current : []
   const incomingMessages = Array.isArray(incoming) ? incoming : []
   const uniqueMessages = new Map(currentMessages.map(message => [message.id, message]))
   incomingMessages.forEach(message => uniqueMessages.set(message.id, message))

   return [...uniqueMessages.values()].sort((left, right) => {
      const dateDifference =
         new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      return dateDifference || left.id.localeCompare(right.id)
   })
}

const formatRelativeTime = (value?: string) => {
   if (!value) return ""
   const date = new Date(value)
   if (Number.isNaN(date.getTime())) return ""
   return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
}

const ConversationMessageList = ({ conversationId, participant, color }: Props) => {
   const scrollContainerRef = useRef<HTMLDivElement>(null)
   const hasLoadedInitialPageRef = useRef(false)
   const isLoadingOlderRef = useRef(false)
   const pendingScrollRestoreRef = useRef<ScrollSnapshot | null>(null)
   const shouldStickToBottomRef = useRef(false)
   const [messages, setMessages] = useState<MessageItem[]>([])
   const [hasMore, setHasMore] = useState(false)
   const [isLoadingOlder, setIsLoadingOlder] = useState(false)
   const [olderMessagesError, setOlderMessagesError] = useState(false)

   const { currentData, isLoading, isError } = useGetConversationMessagesQuery({
      conversationId
   })
   const [fetchOlderMessages] = useLazyGetConversationMessagesQuery()

   useEffect(() => {
      const initialPage = currentData?.data
      if (!initialPage) return

      const container = scrollContainerRef.current
      const isNearBottom =
         !container ||
         container.scrollHeight - container.scrollTop - container.clientHeight < 80

      shouldStickToBottomRef.current = !hasLoadedInitialPageRef.current || isNearBottom
      hasLoadedInitialPageRef.current = true
      setHasMore(initialPage.hasMore)
      setMessages(current => mergeMessages(current, initialPage.messages))
   }, [currentData])

   useLayoutEffect(() => {
      const container = scrollContainerRef.current
      if (!container) return

      const snapshot = pendingScrollRestoreRef.current
      if (snapshot) {
         container.scrollTop = snapshot.top + (container.scrollHeight - snapshot.height)
         pendingScrollRestoreRef.current = null
      } else if (shouldStickToBottomRef.current) {
         container.scrollTop = container.scrollHeight
         shouldStickToBottomRef.current = false
      }
   }, [messages])

   const loadOlderMessages = async () => {
      const oldestMessage = messages[0]
      if (!hasMore || !oldestMessage || isLoadingOlderRef.current) return

      isLoadingOlderRef.current = true
      setIsLoadingOlder(true)
      setOlderMessagesError(false)

      try {
         const response = await fetchOlderMessages({
            conversationId,
            before: oldestMessage.id
         }).unwrap()

         if (response.data.messages.length) {
            const container = scrollContainerRef.current
            if (container) {
               pendingScrollRestoreRef.current = {
                  height: container.scrollHeight,
                  top: container.scrollTop
               }
            }
            setMessages(current => mergeMessages(current, response.data.messages))
         }
         setHasMore(response.data.hasMore)
      } catch {
         setOlderMessagesError(true)
      } finally {
         isLoadingOlderRef.current = false
         setIsLoadingOlder(false)
      }
   }

   const handleScroll = () => {
      const container = scrollContainerRef.current
      if (container && container.scrollTop <= 32) {
         void loadOlderMessages()
      }
   }

   if (isLoading) {
      return <ConversationMessagesSkeleton />
   }

   if (isError) {
      return (
         <Box className="bg-bg flex min-h-0 flex-1 items-center justify-center px-4 text-center">
            <Typography className="text-sm! text-red-600">
               Failed to load conversation messages.
            </Typography>
         </Box>
      )
   }

   return (
      <Box
         ref={scrollContainerRef}
         onScroll={handleScroll}
         className="bg-bg relative flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
         {isLoadingOlder && (
            <Box className="bg-surface pointer-events-none absolute top-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-1.5 shadow-sm">
               <CircularProgress size={15} />
               <Typography
                  className="text-xs!"
                  color="textSecondary">
                  Loading earlier messages
               </Typography>
            </Box>
         )}

         {olderMessagesError && (
            <Box className="sticky top-0 z-10 flex items-center justify-center gap-2 rounded-lg bg-red-50 px-3 py-2">
               <Typography className="text-xs! text-red-700">
                  Could not load earlier messages.
               </Typography>
               <Button
                  size="small"
                  onClick={() => void loadOlderMessages()}
                  className="min-w-0! px-2! py-0! text-xs! normal-case!">
                  Retry
               </Button>
            </Box>
         )}

         {messages.length === 0 ? (
            <Box className="text-muted flex min-h-full items-center justify-center text-sm">
               No messages in this conversation yet.
            </Box>
         ) : (
            messages.map(message => {
               const isMine =
                  participant === "user"
                     ? message.senderUserId !== null
                     : message.senderCompanyId !== null
               const mineBubble =
                  color === "violet"
                     ? "bg-primary text-surface"
                     : "bg-primary-dark text-surface"
               const mineTimestamp = "text-primary-tint!"

               return (
                  <Box
                     key={message.id}
                     className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                     <Box
                        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                           isMine ? mineBubble : "bg-surface text-content"
                        }`}>
                        <Typography className="text-sm! whitespace-pre-wrap!">
                           {message.content}
                        </Typography>
                        <Typography
                           className={`mt-1! text-[10px]! ${
                              isMine ? mineTimestamp : "text-muted"
                           }`}>
                           {formatRelativeTime(message.createdAt)}
                        </Typography>
                     </Box>
                  </Box>
               )
            })
         )}
      </Box>
   )
}

export default ConversationMessageList
