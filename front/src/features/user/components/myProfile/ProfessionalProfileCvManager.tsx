import { useState } from "react"
import { Box, Button } from "@mui/material"
import CvDownloadButton from "@/components/common/CvDownloadButton"
import { useUploadProfessionalProfileCvMutation } from "@/features/user/services/professionalProfileApiCalls"
import { showAlert } from "@/utils/swal"

type Props = {
   userId: string
   hasCv: boolean
}

const ProfessionalProfileCvManager = ({ userId, hasCv }: Props) => {
   const [uploadCv, { isLoading }] = useUploadProfessionalProfileCvMutation()
   const [selectedFile, setSelectedFile] = useState<File | null>(null)

   const upload = async () => {
      if (!selectedFile) return
      try {
         await uploadCv({ userId, file: selectedFile }).unwrap()
         setSelectedFile(null)
         await showAlert({
            type: "success",
            title: "CV uploaded",
            text: "Your CV is stored with restricted access."
         })
      } catch {
         await showAlert({
            type: "error",
            title: "CV upload failed",
            text: "The CV could not be stored securely. Please try again."
         })
      }
   }

   return (
      <Box className="flex flex-wrap items-center gap-3">
         {hasCv && (
            <CvDownloadButton
               label="Open my CV"
               target={{ scope: "candidate-profile", id: userId }}
            />
         )}
         <input
            type="file"
            aria-label="Choose a PDF CV"
            accept="application/pdf,.pdf"
            onChange={event => setSelectedFile(event.currentTarget.files?.[0] ?? null)}
         />
         {selectedFile && (
            <Button
               type="button"
               disabled={isLoading}
               size="small"
               variant="contained"
               onClick={() => void upload()}>
               {isLoading ? "Uploading..." : "Upload CV"}
            </Button>
         )}
      </Box>
   )
}

export default ProfessionalProfileCvManager
