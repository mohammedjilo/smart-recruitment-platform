import { useEffect, useState } from "react"
import type {
   ChangeEventHandler,
   KeyboardEventHandler
} from "react"

export function useSubmittedSearch(
   value: string,
   onSubmit: (value: string) => void
) {
   const [draft, setDraft] = useState(value)

   useEffect(() => {
      setDraft(value)
   }, [value])

   const handleChange: ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = event => {
      setDraft(event.target.value)
   }

   const handleKeyDown: KeyboardEventHandler<HTMLElement> = event => {
      if (event.key !== "Enter" || event.nativeEvent.isComposing) return
      event.preventDefault()
      onSubmit(draft)
   }

   return {
      value: draft,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      submit: () => onSubmit(draft)
   }
}
