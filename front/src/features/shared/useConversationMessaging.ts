import { useEffect, useRef, useState } from "react"
import {
   useMarkConversationAsReadMutation,
   useSendApplicationMessageMutation
} from "@/services/shared/messageApiCalls"
import { getMutationErrorState, getMutationState } from "@/utils/mutationState"
import { getMutationPresentation } from "@/utils/presentationPolicy"
import { showAlert } from "@/utils/swal"

type Conversation = {
   id: string
   applicationId: string
   userId: string
}

const useConversationMessaging = (selectedConversation: Conversation | null) => {
   const [draft, setDraft] = useState("")
   const [sendMessage, sendResult] = useSendApplicationMessageMutation()
   const sendState = getMutationState(sendResult)
   const sendPresentation = getMutationPresentation(sendState, {
      surface: "action",
      importance: "routine"
   })
   const isSending = sendPresentation.category === "loading"
   const [markRead, markReadResult] = useMarkConversationAsReadMutation()
   const markReadState = getMutationState(markReadResult)
   const markReadPresentation = getMutationPresentation(markReadState, {
      surface: "action",
      importance: "routine"
   })
   const lastMarkReadConversation = useRef<string | null>(null)

   useEffect(() => {
      const selectedId = selectedConversation?.id
      if (
         !selectedId ||
         markReadPresentation.category === "loading" ||
         lastMarkReadConversation.current === selectedId
      ) {
         return
      }
      lastMarkReadConversation.current = selectedId
      void markRead(selectedId)
         .unwrap()
         .catch(async (error: unknown) => {
            const errorPresentation = getMutationPresentation(
               getMutationErrorState(error),
               { surface: "action", importance: "routine" }
            )
            if (errorPresentation.category !== "silent") {
               await showAlert({
                  type: "error",
                  title: "Could not mark conversation as read",
                  text: errorPresentation.message
               })
            }
         })
   }, [markRead, markReadPresentation.category, selectedConversation?.id])

   const handleSend = async () => {
      if (!selectedConversation || !draft.trim() || isSending) return
      try {
         await sendMessage({
            applicationId: selectedConversation.applicationId,
            userId: selectedConversation.userId,
            content: draft.trim()
         }).unwrap()
         setDraft("")
      } catch (error) {
         const errorPresentation = getMutationPresentation(
            getMutationErrorState(error),
            { surface: "action", importance: "routine" }
         )
         if (errorPresentation.category !== "silent") {
            await showAlert({
               type: "error",
               title: "Message failed",
               text: errorPresentation.message
            })
         }
      }
   }

   return { draft, setDraft, isSending, handleSend }
}

export default useConversationMessaging
