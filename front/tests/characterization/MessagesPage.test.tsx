import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import UserMessages from "@/features/user/pages/MessagesPage"
import CompanyMessages from "@/features/company/pages/MessagesPage"

const { conversations, sendMessage, markRead } = vi.hoisted(() => ({
   conversations: { user: [] as unknown[], company: [] as unknown[] },
   sendMessage: vi.fn(),
   markRead: vi.fn()
}))

vi.mock("@/services/shared/messageApiCalls", () => ({
   useGetUserConversationsQuery: () => ({
      data: { data: conversations.user },
      isLoading: false
   }),
   useGetCompanyConversationsQuery: () => ({
      data: { data: conversations.company },
      isLoading: false
   }),
   useSendApplicationMessageMutation: () => [
      sendMessage,
      { isLoading: false, isUninitialized: true }
   ],
   useMarkConversationAsReadMutation: () => [
      markRead,
      { isLoading: false, isUninitialized: true }
   ]
}))

vi.mock("@/components/common/ConversationMessageList", () => ({
   default: ({ conversationId }: { conversationId: string }) => (
      <div>Messages for {conversationId}</div>
   )
}))
vi.mock("@/components/common/ConversationWorkspaceSkeleton", () => ({
   default: () => <div>Loading conversations</div>
}))
vi.mock("@/utils/swal", () => ({ showAlert: vi.fn() }))

const conversation = {
   id: "conversation-1",
   applicationId: "application-1",
   userId: "user-1",
   unreadCount: 2,
   user: { firstName: "Ada", lastName: "Lovelace" },
   company: { companyName: "Analytical Engines" },
   application: { job: { title: "Engineer" } },
   messages: [{ content: "Previous message" }]
}

const resolvedMutation = () => ({ unwrap: () => Promise.resolve({}) })

const RouterControls = () => {
   const navigate = useNavigate()
   const location = useLocation()

   return (
      <>
         <output>Current path: {location.pathname}</output>
         <button onClick={() => navigate(-1)}>History back</button>
         <button onClick={() => navigate(1)}>History forward</button>
      </>
   )
}

const renderAt = (path: string, page: ReactNode) =>
   render(
      <MemoryRouter initialEntries={[path]}>
         <Routes>
            <Route
               element={page}
               path="/messages"
            />
            <Route
               element={page}
               path="/messages/:conversationId"
            />
            <Route
               element={page}
               path="/company/messages"
            />
            <Route
               element={page}
               path="/company/messages/:conversationId"
            />
         </Routes>
         <RouterControls />
      </MemoryRouter>
   )

describe("Messages page characterization", () => {
   beforeEach(() => {
      conversations.user = [conversation]
      conversations.company = [conversation]
      sendMessage.mockReturnValue(resolvedMutation())
      markRead.mockReturnValue(resolvedMutation())
   })

   it("selects the user conversation from the route and marks it read", async () => {
      renderAt("/messages/conversation-1", <UserMessages />)

      expect(await screen.findAllByText("Analytical Engines")).toHaveLength(2)
      expect(
         screen.getByRole("button", { name: /Analytical Engines/ })
      ).toHaveAttribute("aria-current", "page")
      expect(screen.getByText("Messages for conversation-1")).toBeInTheDocument()
      await waitFor(() => expect(markRead).toHaveBeenCalledWith("conversation-1"))
   })

   it("sends a trimmed user message with the selected application and recipient", async () => {
      renderAt("/messages/conversation-1", <UserMessages />)

      const input = await screen.findByPlaceholderText("Write a message...")
      fireEvent.change(input, { target: { value: "  Hello from candidate  " } })
      const sendButton = screen.getByRole("button", { name: "Send" })
      expect(sendButton).toBeEnabled()
      fireEvent.click(sendButton)

      await waitFor(() =>
         expect(sendMessage).toHaveBeenCalledWith({
            applicationId: "application-1",
            userId: "user-1",
            content: "Hello from candidate"
         })
      )
      expect(input).toHaveValue("")
   })

   it("selects and marks the company conversation from its role-specific route", async () => {
      renderAt("/company/messages/conversation-1", <CompanyMessages />)

      expect(await screen.findAllByText("Ada Lovelace")).toHaveLength(2)
      expect(screen.getByText("Messages for conversation-1")).toBeInTheDocument()
      await waitFor(() => expect(markRead).toHaveBeenCalledWith("conversation-1"))
   })

   it("sends a trimmed company message to the selected candidate", async () => {
      renderAt("/company/messages/conversation-1", <CompanyMessages />)

      const input = await screen.findByPlaceholderText("Write a message...")
      fireEvent.change(input, { target: { value: "  Interview details  " } })
      const sendButton = screen.getByRole("button", { name: "Send" })
      expect(sendButton).toBeEnabled()
      fireEvent.click(sendButton)

      await waitFor(() =>
         expect(sendMessage).toHaveBeenCalledWith({
            applicationId: "application-1",
            userId: "user-1",
            content: "Interview details"
         })
      )
      expect(input).toHaveValue("")
   })

   it("selects a user conversation from the keyboard and follows browser history", async () => {
      const user = userEvent.setup()
      renderAt("/messages", <UserMessages />)

      const conversationButton = await screen.findByRole("button", {
         name: /Analytical Engines/
      })
      await user.tab()
      expect(conversationButton).toHaveFocus()

      await user.keyboard("{Enter}")
      expect(screen.getByText("Current path: /messages/conversation-1")).toBeInTheDocument()
      expect(screen.getByText("Messages for conversation-1")).toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: "History back" }))
      expect(screen.getByText("Current path: /messages")).toBeInTheDocument()
      expect(screen.getByText("Select a conversation to start messaging.")).toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: "History forward" }))
      expect(screen.getByText("Current path: /messages/conversation-1")).toBeInTheDocument()
   })

   it("selects a company conversation with Space and preserves its role-specific route", async () => {
      const user = userEvent.setup()
      renderAt("/company/messages", <CompanyMessages />)

      const conversationButton = await screen.findByRole("button", {
         name: /Ada Lovelace/
      })
      await user.tab()
      expect(conversationButton).toHaveFocus()
      await user.keyboard(" ")

      expect(
         screen.getByText("Current path: /company/messages/conversation-1")
      ).toBeInTheDocument()
      expect(screen.getByText("Messages for conversation-1")).toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: "History back" }))
      expect(screen.getByText("Current path: /company/messages")).toBeInTheDocument()
      expect(screen.getByText("Select a conversation to start messaging.")).toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: "History forward" }))
      expect(
         screen.getByText("Current path: /company/messages/conversation-1")
      ).toBeInTheDocument()
   })
})
