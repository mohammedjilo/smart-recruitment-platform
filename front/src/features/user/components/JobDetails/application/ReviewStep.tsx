import React from "react"
import {
   CheckCircle,
   DescriptionOutlined,
   EmailOutlined,
   LocationOnOutlined,
   PersonOutlined,
   PhoneOutlined,
   WorkOutlined
} from "@mui/icons-material"

import type { BasicInformationData } from "./BasicInformationStep"
import type { AnswerItem } from "./applicationTypes"
import { Box, Typography } from "@mui/material"

// ============================================================
// Props
// ============================================================

interface ReviewStepProps {
   basicInformationsData: BasicInformationData
   answers: AnswerItem[]
}

// ============================================================
// Main Component
// ============================================================

const ReviewStep: React.FC<ReviewStepProps> = ({ basicInformationsData, answers }) => {
   const { fullName, email, phone, country, age, jobTitle, useProfessionalProfile, cv } =
      basicInformationsData
   return (
      <Box className="w-full">
         {/* ================================================= */}
         {/* Header */}
         {/* ================================================= */}

         <Box className="mb-6">
            <Typography className="text-[16px]! font-bold!">
               Review Your Application
            </Typography>

            <Typography
               className="mt-1! text-sm! leading-5!"
               color="textSecondary">
               Please review your information and answers before submitting your
               application.
            </Typography>
         </Box>

         {/* ================================================= */}
         {/* Basic Information */}
         {/* ================================================= */}

         <ReviewSection
            icon={<PersonOutlined className="text-lg!" />}
            title="Basic Information">
            <Box className="grid grid-cols-2 gap-x-5 gap-y-5">
               <InfoItem
                  value={fullName}
                  icon={<PersonOutlined />}
                  label="Full Name"
               />

               <InfoItem
                  value={email}
                  icon={<EmailOutlined />}
                  label="Email Address"
               />

               <InfoItem
                  value={phone}
                  icon={<PhoneOutlined />}
                  label="Phone Number"
               />

               <InfoItem
                  value={country}
                  icon={<LocationOnOutlined />}
                  label="Country"
               />

               <InfoItem
                  value={age}
                  icon={<PersonOutlined />}
                  label="Age"
               />

               <InfoItem
                  value={jobTitle}
                  icon={<WorkOutlined />}
                  label="Current Job Title"
               />
            </Box>
         </ReviewSection>

         {/* ================================================= */}
         {/* Resume */}
         {/* ================================================= */}

         <ReviewSection
            icon={<DescriptionOutlined className="text-lg!" />}
            title="Resume">
            {useProfessionalProfile ? (
               <Box className="flex items-center gap-3 rounded-lg border border-[#ddd8f8] bg-[#faf9ff] p-3">
                  <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eeeafd]">
                     <CheckCircle className="text-[21px]! text-[#5421e8]!" />
                  </Box>

                  <Box className="min-w-0">
                     <Typography className="text-[13px]! font-semibold! text-[#20253d]!">
                        Use Professional Profile
                     </Typography>

                     <Typography className="mt-1! text-[11px]! leading-4! text-[#737b91]!">
                        Your professional profile will be shared with the company.
                     </Typography>
                  </Box>
               </Box>
            ) : (
               <Box className="bg-surface flex items-center gap-3 rounded-lg border border-[#e4e7ef] p-3">
                  <Box className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f3f4f7]">
                     <DescriptionOutlined className="text-[21px]! text-[#5421e8]!" />
                  </Box>

                  <Box className="min-w-0 flex-1">
                     <Typography className="truncate! text-[13px]! font-semibold!">
                        {cv?.name || "Uploaded Resume"}
                     </Typography>

                     {cv?.size && (
                        <Typography
                           className="mt-1! text-[11px]!"
                           color="textSecondary">
                           {formatFileSize(cv.size)}
                        </Typography>
                     )}
                  </Box>

                  <CheckCircle className="text-xl! text-[#5421e8]!" />
               </Box>
            )}
         </ReviewSection>

         {/* ================================================= */}
         {/* Questions & Answers */}
         {/* ================================================= */}

         <ReviewSection
            icon={<WorkOutlined className="text-lg!" />}
            title="Questions & Answers">
            {answers.length === 0 ? (
               <Box className="rounded-lg border border-dashed border-[#dfe2ea] bg-[#fafbfc] px-4 py-5 text-center">
                  <Typography className="text-xs! text-[12px] text-[#7a8194]!">
                     No questions were answered.
                  </Typography>
               </Box>
            ) : (
               <Box className="space-y-4">
                  {answers
                     .slice()
                     .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                     .map((item, index) => (
                        <AnswerCard
                           key={item.questionId}
                           answer={item.answer}
                           number={index + 1}
                           question={item.question}
                        />
                     ))}
               </Box>
            )}
         </ReviewSection>

         {/* ================================================= */}
         {/* Final Notice */}
         {/* ================================================= */}

         <Box className="mt-5 rounded-lg border border-[#e0dafa] bg-[#faf9ff] px-4 py-3">
            <Box className="flex gap-3">
               <CheckCircle className="mt-px! text-lg! text-[#5421e8]!" />

               <Box>
                  <Typography className="text-xs! font-semibold! text-[#31256b]!">
                     Almost there!
                  </Typography>
                  <Typography className="text-mui-blue-900! mt-1! text-[11px]! leading-4!">
                     Please make sure all the information above is correct before
                     submitting your application.
                  </Typography>
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

export default ReviewStep

// ============================================================
// Review Section
// ============================================================

interface ReviewSectionProps {
   title: string
   icon: React.ReactNode
   children: React.ReactNode
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ title, icon, children }) => {
   return (
      <Box className="bg-surface mb-5 rounded-xl border border-[#e4e7ef]">
         {/* Section Header */}

         <Box className="flex items-center gap-2 border-b border-[#eef0f4] px-4 py-3">
            <Box className="flex h-7 w-7 items-center justify-center rounded-md bg-[#f0edff] text-[#5421e8]">
               {icon}
            </Box>

            <Typography className="text-[13px]! font-semibold! text-[#20253d]!">
               {title}
            </Typography>
         </Box>

         {/* Section Body */}

         <Box className="p-4">{children}</Box>
      </Box>
   )
}

// ============================================================
// Information Item
// ============================================================

interface InfoItemProps {
   label: string
   value: string
   icon: React.ReactElement
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => {
   return (
      <Box className="min-w-0">
         <Typography className="mb-1.5! text-[13px]! font-medium! tracking-[0.02em]! uppercase!">
            {label}
         </Typography>

         <Box className="flex min-w-0 items-center gap-2">
            <Box className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#f5f5f8] text-[#687087]">
               {React.cloneElement(icon as React.ReactElement<{ sx?: object }>, {
                  sx: {
                     fontSize: 16
                  }
               })}
            </Box>

            <Typography
               className="truncate! text-xs! font-medium!"
               color="textSecondary">
               {value || "Not provided"}
            </Typography>
         </Box>
      </Box>
   )
}

// ============================================================
// Answer Card
// ============================================================

interface AnswerCardProps {
   number: number
   question: string
   answer: string | string[]
}

const AnswerCard: React.FC<AnswerCardProps> = ({ number, question, answer }) => {
   const normalizedAnswer = Array.isArray(answer) ? answer : [answer]

   return (
      <Box className="rounded-lg border border-[#e5e7ed] bg-[#fcfcfd] p-3.5">
         <Box className="flex gap-3">
            {/* Number */}

            <Box className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#5421e8] text-[10px] font-semibold text-white">
               {number}
            </Box>

            {/* Content */}

            <Box className="min-w-0 flex-1">
               <Typography className="text-xs! leading-5! font-semibold!">
                  {question}
               </Typography>

               <Box className="mt-2.5">
                  {Array.isArray(answer) ? (
                     <Box className="flex flex-wrap gap-1.5">
                        {normalizedAnswer.map((item, index) => (
                           <Typography
                              className="rounded-md! bg-[#f0edff]! px-2.5! py-1! text-[11px]! font-medium! text-[#5421e8]!"
                              key={`${item}-${index}`}>
                              {item}
                           </Typography>
                        ))}
                     </Box>
                  ) : (
                     <Box className="rounded-md bg-[#f7f7f9] px-3 py-2.5">
                        <Typography
                           className="text-xs! leading-5 whitespace-pre-wrap!"
                           color="textSecondary">
                           {answer || "No answer provided"}
                        </Typography>
                     </Box>
                  )}
               </Box>
            </Box>
         </Box>
      </Box>
   )
}

// ============================================================
// Helpers
// ============================================================

const formatFileSize = (bytes: number) => {
   if (bytes === 0) return "0 Bytes"

   const units = ["Bytes", "KB", "MB", "GB"]

   const i = Math.floor(Math.log(bytes) / Math.log(1024))

   return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`
}
