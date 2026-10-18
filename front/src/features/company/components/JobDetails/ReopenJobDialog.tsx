import { useEffect, useState } from "react"
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   TextField
} from "@mui/material"
import {
   currentDateOnlyKey,
   isDateOnOrAfterToday,
   toDateOnlyKey
} from "@smart-recruitment/validation"

type Props = {
   open: boolean
   jobTitle: string
   currentDeadline?: Date | string
   requireNewDate?: boolean
   onClose: () => void
   onSubmit: (deadline: string) => Promise<void>
}

const ReopenJobDialog = ({
   open,
   jobTitle,
   currentDeadline,
   requireNewDate = false,
   onClose,
   onSubmit
}: Props) => {
   const [deadline, setDeadline] = useState("")
   const [isSubmitting, setIsSubmitting] = useState(false)

   useEffect(() => {
      if (open) setDeadline("")
   }, [open])

   const submit = async () => {
      if (!isValidDeadline()) return
      setIsSubmitting(true)
      try {
         await onSubmit(deadline)
      } finally {
         setIsSubmitting(false)
      }
   }

   const isValidDeadline = () =>
      isDateOnOrAfterToday(deadline) &&
      (!requireNewDate || toDateOnlyKey(currentDeadline ?? "") !== deadline)

   return (
      <Dialog
         open={open}
         onClose={isSubmitting ? undefined : onClose}
         fullWidth
         maxWidth="xs">
         <DialogTitle>Reopen job</DialogTitle>
         <DialogContent className="space-y-3!">
            <p className="text-muted text-sm">
               Set a new application deadline for {jobTitle}.
            </p>
            <TextField
               autoFocus
               fullWidth
               required
               type="date"
               value={deadline}
               onChange={event => setDeadline(event.target.value)}
               slotProps={{ htmlInput: { min: currentDateOnlyKey() } }}
            />
         </DialogContent>
         <DialogActions>
            <Button
               onClick={onClose}
               disabled={isSubmitting}
               className="normal-case!">
               Cancel
            </Button>
            <Button
               variant="contained"
               onClick={() => void submit()}
               disabled={isSubmitting || !isValidDeadline()}
               className="normal-case!">
               Reopen job
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default ReopenJobDialog
