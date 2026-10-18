import React from "react"
import { Avatar, Box, Button, LinearProgress, Typography } from "@mui/material"

import { LocationOnOutlined, AttachMoneyOutlined, StarBorder } from "@mui/icons-material"
import formatCreatedAt from "@/utils/formatDate"
import { useNavigate } from "react-router-dom"
import { getMatchScoreColor } from "@/theme/tokens"

export interface JobCardData {
   id: string
   title: string
   slug: string
   salary: number
   createdAt: string
   skills: string[]
   company: {
      id: string
      companyName: string
      logoUrl: string
      location: string
   }
   matchScore: number
   recommendation: string
}

interface JobCardProps {
   job: JobCardData
}

const RecommendedJobItem: React.FC<JobCardProps> = ({ job }) => {
   const navigate = useNavigate()

   const matchColor = getMatchScoreColor(job.matchScore)

   const matchMessage =
      job.matchScore >= 80
         ? "Excellent match"
         : job.matchScore >= 60
           ? "Good match"
           : "Needs improvement"

   const formattedSalary = job.salary > 0 ? `$${job.salary}` : "Salary not specified"

   return (
      <Box className="border-border bg-surface w-full rounded-2xl border p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
         {/* ================= HEADER ================= */}
         <Box className="flex items-start justify-between gap-4">
            {/* Company + Job info */}
            <Box className="flex min-w-0 items-start gap-4">
               {/* Logo */}
               <Box className="border-border bg-surface flex h-17 w-17 shrink-0 items-center justify-center overflow-hidden rounded-2xl border">
                  {job.company.logoUrl ? (
                     <Avatar
                        className="h-full! w-full! object-cover!"
                        variant="square"
                        src={job.company.logoUrl}
                        alt={job.company.companyName}
                     />
                  ) : (
                     <Typography
                        sx={{
                           fontSize: "28px",
                           fontWeight: 700,
                           color: "primary.main"
                        }}>
                        {job.company.companyName?.charAt(0)?.toUpperCase()}
                     </Typography>
                  )}
               </Box>

               {/* Job information */}
               <Box className="min-w-0">
                  <Typography className="truncate text-[16px]! font-bold!">
                     {job.title}
                  </Typography>

                  <Typography className="mt-1! text-sm! font-medium!">
                     {job.company.companyName}
                  </Typography>

                  {/* Location + Salary */}
                  <Box className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                     <Box className="flex items-center gap-1.5">
                        <LocationOnOutlined
                           sx={{
                              fontSize: 21,
                              color: "text.secondary"
                           }}
                        />

                        <Typography className="text-xs!" color="textSecondary">
                           {job.company.location}
                        </Typography>
                     </Box>

                     <Box className="flex items-center gap-1.5">
                        <AttachMoneyOutlined
                           sx={{
                              fontSize: 21,
                              color: "text.secondary"
                           }}
                        />

                        <Typography className="text-[12px]!" color="textSecondary">
                           {formattedSalary}
                        </Typography>
                     </Box>
                  </Box>
               </Box>
            </Box>

            {/* New badge + bookmark */}
            <Box className="flex shrink-0 items-center gap-3">
               <Box className="rounded-xl bg-[#ECFDF3] px-4 py-2">
                  <Typography className="text-[12px]! font-semibold! text-[#16A34A]!">
                     New
                  </Typography>
               </Box>
            </Box>
         </Box>

         {/* ================= SKILLS ================= */}
         <Box className="mt-7 flex flex-wrap gap-3">
            {job.skills.slice(0, 5).map(skill => (
               <Box
                  key={skill}
                  className="bg-primary-tint rounded-xl px-4 py-2">
                  <Typography className="text-[12px]! font-medium!" color="textSecondary">
                     {skill}
                  </Typography>
               </Box>
            ))}
         </Box>

         {/* Divider */}
         <Box className="border-border my-7 border-t border-dashed" />

         {/* ================= MATCH SCORE ================= */}
         <Box>
            <Box className="flex items-center justify-between">
               <Typography className="text-content! text-[20px]! font-bold!">
                  Match Score
               </Typography>

               <Typography
                  sx={{
                     fontSize: "32px",
                     fontWeight: 700,
                     color: matchColor
                  }}>
                  {job.matchScore}%
               </Typography>
            </Box>

            {/* Progress */}
            <Box className="mt-3">
               <LinearProgress
                  variant="determinate"
                  value={Math.min(Math.max(job.matchScore, 0), 100)}
                  sx={{
                     height: 10,
                     borderRadius: 999,
                     backgroundColor: "divider",
                     "& .MuiLinearProgress-bar": {
                        borderRadius: 999,
                        backgroundColor: matchColor
                     }
                  }}
               />
            </Box>

            {/* Recommendation */}
            <Box className="mt-5 flex items-center gap-4">
               <Box
                  className="flex items-center gap-2"
                  sx={{
                     color: matchColor
                  }}>
                  <StarBorder
                     sx={{
                        fontSize: 24
                     }}
                  />

                  <Typography
                     sx={{
                        color: matchColor,
                        fontSize: "12px",
                        fontWeight: 500
                     }}>
                     {matchMessage}
                  </Typography>
               </Box>

               <Box className="bg-border h-5 w-px" />

               <Typography className="line-clamp-1 text-xs!" color="textSecondary">
                  {job.recommendation}
               </Typography>
            </Box>
         </Box>

         {/* Divider */}
         <Box className="border-border my-7 border-t border-dashed" />

         {/* ================= FOOTER ================= */}
         <Box className="flex items-center justify-between">
            <Typography className="text-xs!" color="textSecondary">
               {formatCreatedAt(job.createdAt)}
            </Typography>

            <Box className="flex gap-3">
               <Button
                  variant="contained"
                  onClick={() => navigate(`/jobs/${job.id}/${job.slug}`)}
                  className="bg-primary-tint! text-primary! hover:bg-primary-dark! rounded-xl! px-4! py-2! text-[14px]! font-semibold! normal-case! shadow-none! hover:text-white!">
                  View Job
               </Button>
            </Box>
         </Box>
      </Box>
   )
}

export default RecommendedJobItem
