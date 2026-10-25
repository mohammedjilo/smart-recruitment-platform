import { useEffect, useState } from "react"
import {
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   TextField,
   Typography
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
         fullWidth
         maxWidth="xs"
         open={open}
         onClose={isSubmitting ? undefined : onClose}>
         <DialogTitle>Reopen job</DialogTitle>
         <DialogContent className="space-y-3!">
            <Typography className="text-sm!" color="textSecondary">
               Set a new application deadline for {jobTitle}.
            </Typography>
            <TextField
               type="date"
               required
               value={deadline}
               autoFocus
               fullWidth
               slotProps={{ htmlInput: { min: currentDateOnlyKey() } }}
               onChange={event => setDeadline(event.target.value)}
            />
         </DialogContent>
         <DialogActions>
            <Button
               className="normal-case!"
               disabled={isSubmitting}
               onClick={onClose}>
               Cancel
            </Button>
            <Button
               className="normal-case!"
               disabled={isSubmitting || !isValidDeadline()}
               variant="contained"
               onClick={() => void submit()}>
               Reopen job
            </Button>
         </DialogActions>
      </Dialog>
   )
}

export default ReopenJobDialog
