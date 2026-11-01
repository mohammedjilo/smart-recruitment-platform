import { useState } from "react"
import { Button } from "@mui/material"
import { useRequestCvDownloadMutation } from "@/services/shared/cvAccessApiCalls"
import type { CvAccessTarget } from "@/services/shared/cvAccessApiCalls"
import { showAlert } from "@/utils/swal"

type Props = {
   target: CvAccessTarget
   label?: string
}

const CvDownloadButton = ({ target, label = "View CV" }: Props) => {
   const [requestDownload] = useRequestCvDownloadMutation()
   const [isLoading, setIsLoading] = useState(false)

   const openCv = async () => {
      const tab = window.open("about:blank", "_blank")
      if (!tab) {
         await showAlert({
            type: "error",
            title: "Unable to open CV",
            text: "Allow pop-ups to view this file."
         })
         return
      }

      setIsLoading(true)
      try {
         const response = await requestDownload(target).unwrap()
         tab.opener = null
         tab.location.replace(response.data.url)
      } catch {
         tab.close()
         await showAlert({
            type: "error",
            title: "CV unavailable",
            text: "You may not be authorized to view this CV, or it may require secure migration."
         })
      } finally {
         setIsLoading(false)
      }
   }

   return (
      <Button
         className="normal-case!"
         type="button"
         disabled={isLoading}
         size="small"
         variant="outlined"
         onClick={() => void openCv()}>
         {isLoading ? "Preparing CV..." : label}
      </Button>
   )
}

export default CvDownloadButton
