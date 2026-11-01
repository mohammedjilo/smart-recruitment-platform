import { useState } from "react"
import { Box, Button, IconButton, Typography } from "@mui/material"
import {
   CloudUploadOutlined,
   DescriptionOutlined,
   DeleteOutlined
} from "@mui/icons-material"
import { useUploadProfessionalProfileCvMutation } from "@/features/user/services/professionalProfileApiCalls"
import { showAlert } from "@/utils/swal"

type Props = {
   userId: string
   hasCv: boolean
}

const ProfessionalProfileCvManager = ({ userId, hasCv }: Props) => {
   const [uploadCv, { isLoading }] = useUploadProfessionalProfileCvMutation()
   const [selectedFile, setSelectedFile] = useState<File | null>(null)
   const [isDragging, setIsDragging] = useState(false)

   const selectPdf = (file?: File) => {
      if (!file) return
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
         void showAlert({
            type: "error",
            title: "PDF file required",
            text: "Choose a PDF file for your CV."
         })
         return
      }
      setSelectedFile(file)
   }

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
      <Box className="space-y-4">
         <Box
            className={`rounded-xl border-2 border-dashed px-5 py-7 text-center transition-colors ${
               isDragging
                  ? "border-primary bg-primary-tint"
                  : "border-border bg-surface hover:border-primary"
            }`}
            onDragLeave={() => setIsDragging(false)}
            onDragOver={event => {
               event.preventDefault()
               setIsDragging(true)
            }}
            onDrop={event => {
               event.preventDefault()
               setIsDragging(false)
               selectPdf(event.dataTransfer.files[0])
            }}>
            <Box className="bg-primary-tint text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-xl">
               <CloudUploadOutlined />
            </Box>
            <Typography className="text-content mt-3! text-sm! font-semibold!">
               {hasCv ? "Replace your CV" : "Add your CV"}
            </Typography>
            <Typography className="text-muted mt-1! text-xs!">
               PDF document · Choose a file or drag it here
            </Typography>
            <Button
               className="mt-4! normal-case!"
               component="label"
               size="small"
               variant="outlined">
               Choose PDF
               <input
                  className="sr-only"
                  type="file"
                  aria-label="Choose a PDF CV"
                  accept="application/pdf,.pdf"
                  onChange={event => {
                     selectPdf(event.currentTarget.files?.[0])
                     event.currentTarget.value = ""
                  }}
               />
            </Button>
         </Box>

         {selectedFile && (
            <Box className="border-border bg-surface flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3">
               <Box className="flex min-w-0 items-center gap-3">
                  <Box className="bg-success-tint text-success flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                     <DescriptionOutlined fontSize="small" />
                  </Box>
                  <Box className="min-w-0">
                     <Typography className="text-content truncate! text-sm! font-semibold!">
                        {selectedFile.name}
                     </Typography>
                     <Typography className="text-muted text-xs!">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready to
                        upload
                     </Typography>
                  </Box>
               </Box>
               <Box className="flex items-center gap-2">
                  <IconButton
                     aria-label="Remove selected file"
                     disabled={isLoading}
                     size="small"
                     onClick={() => setSelectedFile(null)}>
                     <DeleteOutlined fontSize="small" />
                  </IconButton>
                  <Button
                     disabled={isLoading}
                     size="small"
                     variant="contained"
                     onClick={() => void upload()}>
                     {isLoading ? "Uploading..." : "Upload CV"}
                  </Button>
               </Box>
            </Box>
         )}
      </Box>
   )
}

export default ProfessionalProfileCvManager
