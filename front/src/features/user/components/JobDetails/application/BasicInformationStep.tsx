import React, { useState, useEffect } from "react"
import {
   Box,
   Button,
   FormControl,
   FormControlLabel,
   Radio,
   RadioGroup,
   TextField,
   Typography
} from "@mui/material"
import { Close, CloudUpload, InsertDriveFile } from "@mui/icons-material"
import { calculateAge } from "@/utils/formatDate"
import { useGetBasicInformationsQuery } from "@/services/shared/jobApiCalls"
import BasicInformationStepSkeleton from "./BasicInformationStepSkeleton"

// ============================================================
// ============================================================
export interface BasicInformationData {
   fullName: string
   email: string
   phone: string
   country: string
   age: string
   jobTitle: string
   useProfessionalProfile: boolean
   cv: File | null
}

// ============================================================
// ============================================================
interface BasicInformationStepProps {
   formData: BasicInformationData
   setFormData: React.Dispatch<React.SetStateAction<BasicInformationData>>
}

// ============================================================
// ============================================================
interface InputFieldProps {
   label: string
   value: string | undefined
   onChange: (value: string) => void
}

function InputField({ label, value, onChange }: InputFieldProps) {
   return (
      <Box>
         <Typography className="mb-2! text-xs!">{label}</Typography>
         <TextField
            value={value || ""}
            fullWidth
            size="small"
            sx={{
               "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#64748B"
               }
            }}
            onChange={e => onChange(e.target.value)}
         />
      </Box>
   )
}

// ============================================================
// ============================================================
const BasicInformationStep: React.FC<BasicInformationStepProps> = ({
   formData,
   setFormData
}) => {
   const {
      data: userData,
      isLoading,
      isSuccess
   } = useGetBasicInformationsQuery(undefined)
   const safeFormData = formData ?? {
      fullName: "",
      email: "",
      phone: "",
      country: "",
      age: "",
      jobTitle: "",
      useProfessionalProfile: true,
      cv: null
   }
   const [selectedOption, setSelectedOption] = useState<"profile" | "upload">(
      safeFormData.useProfessionalProfile ? "profile" : "upload"
   )

   // ============================================================
   // ============================================================
   useEffect(() => {
      if (isSuccess && userData?.data) {
         const { firstName, lastName, email, phone, country, birthdate, profile } =
            userData.data

         setFormData(prev => ({
            fullName: prev.fullName || `${firstName || ""} ${lastName || ""}`.trim(),
            email: prev.email || email || "",
            phone: prev.phone || phone || "",
            country: prev.country || country || "",
            age: prev.age || calculateAge(birthdate).toString(),
            jobTitle: prev.jobTitle || profile?.jobTitle || "",
            useProfessionalProfile: prev.useProfessionalProfile ?? true,
            cv: prev.cv ?? null
         }))
      }
   }, [isSuccess, userData, setFormData])

   // ============================================================
   // ============================================================
   const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value as "profile" | "upload"
      setSelectedOption(value)
      setFormData(prev => ({
         ...prev,
         useProfessionalProfile: value === "profile",
         cv: value === "profile" ? null : prev.cv
      }))
   }

   // ============================================================
   // ============================================================
   const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file && file.type === "application/pdf") {
         setFormData(prev => ({
            ...prev,
            cv: file,
            useProfessionalProfile: false
         }))
         setSelectedOption("upload")
      } else {
         alert("Please upload a valid PDF file.")
      }
      event.target.value = ""
   }

   // ============================================================
   // ============================================================
   const handleRemoveFile = () => {
      setFormData(prev => ({
         ...prev,
         cv: null
      }))
   }

   // ============================================================
   // ============================================================
   const updateField = (field: keyof BasicInformationData, value: any) => {
      setFormData(prev => ({ ...prev, [field]: value }))
   }

   if (isLoading) {
      return <BasicInformationStepSkeleton />
   }

   return (
      <Box>
         <Typography
            className="mb-5! text-[13px]! font-semibold!"
            variant="h3">
            Your Information
         </Typography>

         <Box className="grid grid-cols-2 gap-5">
            <InputField
               value={formData.fullName}
               label="Full Name *"
               onChange={val => updateField("fullName", val)}
            />
            <InputField
               value={formData.email}
               label="Email Address *"
               onChange={val => updateField("email", val)}
            />
            <InputField
               value={formData.jobTitle}
               label="Job Title"
               onChange={val => updateField("jobTitle", val)}
            />
            <InputField
               value={formData.phone}
               label="Phone Number *"
               onChange={val => updateField("phone", val)}
            />
            <InputField
               value={formData.country}
               label="Current Location *"
               onChange={val => updateField("country", val)}
            />
            <InputField
               value={formData.age}
               label="Age"
               onChange={val => updateField("age", val)}
            />
         </Box>

         {/* ============================================================ */}
         {/* ============================================================ */}
         <Box className="mt-6">
            <FormControl component="fieldset">
               <RadioGroup
                  className="gap-2!"
                  value={selectedOption}
                  onChange={handleRadioChange}>
                  <FormControlLabel
                     value="profile"
                     control={<Radio />}
                     label="Use my professional profile"
                     sx={{
                        "& .MuiFormControlLabel-label": {
                           fontSize: "14px",
                           fontWeight: 500
                        }
                     }}
                  />

                  <FormControlLabel
                     value="upload"
                     control={<Radio />}
                     label="Upload CV.pdf"
                     sx={{
                        "& .MuiFormControlLabel-label": {
                           fontSize: "14px",
                           fontWeight: 500
                        }
                     }}
                  />
               </RadioGroup>
            </FormControl>

            {selectedOption === "upload" && (
               <Box className="mt-2 ml-2 rounded-md border border-dashed border-gray-300 p-2">
                  {formData.cv ? (
                     <Box className="flex items-center justify-between gap-4">
                        <Box className="flex items-center gap-2">
                           <InsertDriveFile className="text-[#5421e8]!" />
                           <Typography
                              className="font-medium!"
                              variant="body2">
                              {formData.cv.name}
                           </Typography>
                           <Typography
                              color="text.secondary"
                              variant="caption">
                              ({(formData.cv.size / 1024).toFixed(1)} KB)
                           </Typography>
                        </Box>

                        <Button
                           color="error"
                           size="small"
                           startIcon={<Close />}
                           onClick={handleRemoveFile}>
                           Remove
                        </Button>
                     </Box>
                  ) : (
                     <Box>
                        <Button
                           className="bg-surface! border-[#5421e8]! text-[#5421e8]!"
                           component="label"
                           startIcon={<CloudUpload />}
                           sx={{
                              "&:hover": {
                                 borderColor: "#3a17b0",
                                 backgroundColor: "rgba(84, 33, 232, 0.04)"
                              }
                           }}
                           variant="outlined">
                           Choose PDF File
                           <input
                              type="file"
                              accept=".pdf"
                              hidden
                              onChange={handleFileUpload}
                           />
                        </Button>

                        <Typography
                           className="mt-2! block!"
                           color="text.secondary"
                           variant="caption">
                           Maximum file size: 5MB
                        </Typography>
                     </Box>
                  )}
               </Box>
            )}
         </Box>
      </Box>
   )
}

export default BasicInformationStep
