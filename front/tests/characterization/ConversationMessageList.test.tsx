import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ConversationMessageList from "@/components/common/ConversationMessageList"
import type { MessageItem } from "@/services/shared/messageApiCalls"

const { page, fetchOlder } = vi.hoisted(() => ({
   page: {
      currentData: undefined as
         | { data: { messages: MessageItem[]; hasMore: boolean } }
         | undefined,
      isLoading: false,
      isError: false
   },
   fetchOlder: vi.fn()
}))

vi.mock("@/services/shared/messageApiCalls", () => ({
   useGetConversationMessagesQuery: () => page,
   useLazyGetConversationMessagesQuery: () => [fetchOlder]
}))

vi.mock("@/components/common/ConversationMessagesSkeleton", () => ({
   default: () => <div>Loading messages</div>
}))

const message = (
   id: string,
   content: string,
   createdAt: string,
   senderUserId: string | null = null
): MessageItem => ({
   id,
   content,
   isRead: true,
   readByUser: true,
   readByCompany: true,
   createdAt,
   updatedAt: createdAt,
   conversationId: "conversation-1",
   senderUserId,
   senderCompanyId: senderUserId ? null : "company-1"
})

describe("ConversationMessageList characterization", () => {
   beforeEach(() => {
      page.currentData = undefined
      page.isLoading = false
      page.isError = false
      fetchOlder.mockReturnValue({
         unwrap: () =>
            Promise.resolve({
               data: {
                  messages: [message("older", "Earlier message", "2024-01-01T10:00:00Z")],
                  hasMore: false
               }
            })
      })
   })

   it("renders server messages in chronological order with sender-relative alignment", async () => {
      page.currentData = {
         data: {
            messages: [
               message("later", "Later message", "2024-01-02T10:00:00Z", "user-1"),
               message("earlier", "Earlier message", "2024-01-01T10:00:00Z")
            ],
            hasMore: false
         }
      }
      render(
         <ConversationMessageList
            color="violet"
            conversationId="conversation-1"
            participant="user"
         />
      )

      const earlier = await screen.findByText("Earlier message")
      const later = screen.getByText("Later message")
      expect(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
      expect(later.closest(".justify-end")).toBeInTheDocument()
      expect(earlier.closest(".justify-start")).toBeInTheDocument()
   })

   it("requests and merges the older page when the list is scrolled to its top", async () => {
      page.currentData = {
         data: {
            messages: [
               message("newer", "Newer message", "2024-01-02T10:00:00Z"),
               message("oldest", "Oldest loaded message", "2024-01-02T09:00:00Z")
            ],
            hasMore: true
         }
      }
      const { container } = render(
         <ConversationMessageList
            color="indigo"
            conversationId="conversation-1"
            participant="company"
         />
      )
      const scrollContainer = container.querySelector(".overflow-y-auto")
      expect(scrollContainer).not.toBeNull()
      fireEvent.scroll(scrollContainer!, { target: { scrollTop: 0 } })

      await waitFor(() =>
         expect(fetchOlder).toHaveBeenCalledWith({
            conversationId: "conversation-1",
            before: "oldest"
         })
      )
      expect(await screen.findByText("Earlier message")).toBeInTheDocument()
      expect(screen.getByText("Oldest loaded message")).toBeInTheDocument()
   })

   it("renders the existing failed-load message for a query error", () => {
      page.isError = true
      render(
         <ConversationMessageList
            color="violet"
            conversationId="conversation-1"
            participant="user"
         />
      )

      expect(screen.getByText("Failed to load conversation messages.")).toBeInTheDocument()
   })
})
