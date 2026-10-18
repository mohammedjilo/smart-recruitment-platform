import { Box, Typography } from "@mui/material"
import type { JobQuestion } from "@/types/admin"

type QuestionTypeInfoProps = {
   question: JobQuestion
}

const questionTypeLabels = {
   YES_NO: "YES / NO",
   TEXT: "TEXT",
   NUMBER: "NUMBER",
   SINGLE_CHOICE: "SINGLE CHOICE",
   MULTIPLE_CHOICE: "MULTIPLE CHOICE"
}

const QuestionTypeInfo = ({ question }: QuestionTypeInfoProps) => {
   const getAdditionalInfo = () => {
      if (
         question.type === "NUMBER" &&
         (question.minNumber !== null || question.maxNumber !== null)
      ) {
         return (
            <Box className="mt-3 flex gap-4 text-xs text-muted">
               <Typography className="text-xs! text-muted">
                  Min: {question.minNumber ?? "—"}
               </Typography>

               <Typography className="text-xs! text-muted">
                  Max: {question.maxNumber ?? "—"}
               </Typography>
            </Box>
         )
      }

      if (
         question.type === "MULTIPLE_CHOICE" &&
         (question.minSelection !== null || question.maxSelection !== null)
      ) {
         return (
            <Box className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
               <Typography className="text-xs! text-muted">
                  Min selection: {question.minSelection ?? "—"}
               </Typography>

               <Typography className="text-xs! text-muted">
                  Max selection: {question.maxSelection ?? "—"}
               </Typography>
            </Box>
         )
      }

      return null
   }

   return (
      <Box>
         <Typography
            className="text-primary! text-[11px]! font-bold!"
            color="textSecondary">
            {questionTypeLabels[question.type]}
         </Typography>

         {getAdditionalInfo()}
      </Box>
   )
}

export default QuestionTypeInfo
