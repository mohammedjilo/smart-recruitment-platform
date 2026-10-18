import React, { useState, useEffect } from "react"
import {
   Box,
   Button,
   FormControl,
   FormControlLabel,
   Radio,
   RadioGroup,
   Skeleton,
   TextField,
   Typography
} from "@mui/material"
import { Close, CloudUpload, InsertDriveFile } from "@mui/icons-material"
import { calculateAge } from "@/utils/formatDate"
import { useGetBasicInformationsQuery } from "@/services/shared/jobApiCalls"

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
            fullWidth
            size="small"
            value={value || ""}
            onChange={e => onChange(e.target.value)}
            sx={{
               "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "13px",
                  color: "#64b5f6"
               }
            }}
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
      return (
         <Box>
            <Skeleton
               variant="text"
               width={170}
               height={28}
            />
            <Box className="mt-4 grid grid-cols-2 gap-5">
               {Array.from({ length: 6 }).map((_, index) => (
                  <Box
                     key={index}
                     className="space-y-2">
                     <Skeleton
                        variant="text"
                        width="42%"
                     />
                     <Skeleton
                        variant="rounded"
                        height={40}
                     />
                  </Box>
               ))}
            </Box>
            <Skeleton
               variant="rounded"
               height={90}
               className="mt-6"
            />
         </Box>
      )
   }

   return (
      <Box>
         <h3 className="mb-5 text-[13px] font-semibold">Your Information</h3>

         <Box className="grid grid-cols-2 gap-5">
            <InputField
               label="Full Name *"
               value={formData.fullName}
               onChange={val => updateField("fullName", val)}
            />
            <InputField
               label="Email Address *"
               value={formData.email}
               onChange={val => updateField("email", val)}
            />
            <InputField
               label="Job Title"
               value={formData.jobTitle}
               onChange={val => updateField("jobTitle", val)}
            />
            <InputField
               label="Phone Number *"
               value={formData.phone}
               onChange={val => updateField("phone", val)}
            />
            <InputField
               label="Current Location *"
               value={formData.country}
               onChange={val => updateField("country", val)}
            />
            <InputField
               label="Age"
               value={formData.age}
               onChange={val => updateField("age", val)}
            />
         </Box>

         {/* ============================================================ */}
         {/* ============================================================ */}
         <Box className="mt-6">
            <FormControl component="fieldset">
               <RadioGroup
                  value={selectedOption}
                  onChange={handleRadioChange}
                  sx={{ gap: 1 }}>
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
                           <InsertDriveFile sx={{ color: "#5421e8" }} />
                           <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}>
                              {formData.cv.name}
                           </Typography>
                           <Typography
                              variant="caption"
                              color="text.secondary">
                              ({(formData.cv.size / 1024).toFixed(1)} KB)
                           </Typography>
                        </Box>

                        <Button
                           size="small"
                           color="error"
                           startIcon={<Close />}
                           onClick={handleRemoveFile}>
                           Remove
                        </Button>
                     </Box>
                  ) : (
                     <Box>
                        <Button
                           className="bg-surface!"
                           component="label"
                           variant="outlined"
                           startIcon={<CloudUpload />}
                           sx={{
                              borderColor: "#5421e8",
                              color: "#5421e8",
                              "&:hover": {
                                 borderColor: "#3a17b0",
                                 backgroundColor: "rgba(84, 33, 232, 0.04)"
                              }
                           }}>
                           Choose PDF File
                           <input
                              type="file"
                              accept=".pdf"
                              hidden
                              onChange={handleFileUpload}
                           />
                        </Button>

                        <Typography
                           variant="caption"
                           color="text.secondary"
                           sx={{ mt: 1, display: "block" }}>
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
