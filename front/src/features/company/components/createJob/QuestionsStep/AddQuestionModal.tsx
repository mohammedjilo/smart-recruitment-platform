import React, { useEffect, useState } from "react"

import { Close } from "@mui/icons-material"

import { Button, Dialog, DialogContent, Divider } from "@mui/material"

import QuestionTypeSelector from "./QuestionTypeSelector"
import QuestionBasicFields from "./QuestionBasicFields"
import QuestionTypeFields from "./QuestionTypeFields"
import type { Question, QuestionFormData, QuestionType } from "@/types/question.types"

interface AddQuestionModalProps {
   open: boolean
   onClose: () => void
   onAdd: (question: Question) => void
   editingQuestion?: Question | null
}

const createDefaultOptions = () => ["", "", ""]

const createEmptyForm = (order: number): QuestionFormData => ({
   type: "YES_NO",
   question: "",
   required: true,
   order,

   allowDecimal: false,
   minValue: "",
   maxValue: "",

   options: createDefaultOptions(),

   minSelections: "",
   maxSelections: ""
})

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
   open,
   onClose,
   onAdd,
   editingQuestion
}) => {
   const [form, setForm] = useState<QuestionFormData>(createEmptyForm(1))

   useEffect(() => {
      if (editingQuestion) {
         setForm({
            type: editingQuestion.type,
            question: editingQuestion.question,
            required: editingQuestion.required,
            order: editingQuestion.order,

            allowDecimal: editingQuestion.allowDecimal ?? false,

            minValue: editingQuestion.minValue?.toString() ?? "",

            maxValue: editingQuestion.maxValue?.toString() ?? "",

            options: editingQuestion.options?.length
               ? editingQuestion.options
               : createDefaultOptions(),

            minSelections: editingQuestion.minSelections?.toString() ?? "",

            maxSelections: editingQuestion.maxSelections?.toString() ?? ""
         })
      }
   }, [editingQuestion])

   const updateField = (field: keyof QuestionFormData, value: any) => {
      setForm(previous => ({
         ...previous,
         [field]: value
      }))
   }

   const handleTypeChange = (type: QuestionType) => {
      setForm(previous => ({
         ...previous,
         type,

         options:
            type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE"
               ? createDefaultOptions()
               : [],

         allowDecimal: type === "NUMBER" ? previous.allowDecimal : false,

         minValue: type === "NUMBER" ? previous.minValue : "",

         maxValue: type === "NUMBER" ? previous.maxValue : "",

         minSelections: type === "MULTIPLE_CHOICE" ? previous.minSelections : "",

         maxSelections: type === "MULTIPLE_CHOICE" ? previous.maxSelections : ""
      }))
   }

   const handleSubmit = () => {
      if (!form.question.trim()) {
         return
      }

      if (
         (form.type === "SINGLE_CHOICE" || form.type === "MULTIPLE_CHOICE") &&
         form.options.some(option => !option.trim())
      ) {
         return
      }

      const question: Question = {
         id: editingQuestion?.id ?? crypto.randomUUID(),

         type: form.type,

         question: form.question.trim(),

         required: form.required,

         order: form.order,

         allowDecimal: form.type === "NUMBER" ? form.allowDecimal : undefined,

         minValue:
            form.type === "NUMBER" && form.minValue !== "" ? Number(form.minValue) : null,

         maxValue:
            form.type === "NUMBER" && form.maxValue !== "" ? Number(form.maxValue) : null,

         options:
            form.type === "SINGLE_CHOICE" || form.type === "MULTIPLE_CHOICE"
               ? form.options
               : undefined,

         minSelections:
            form.type === "MULTIPLE_CHOICE" && form.minSelections !== ""
               ? Number(form.minSelections)
               : null,

         maxSelections:
            form.type === "MULTIPLE_CHOICE" && form.maxSelections !== ""
               ? Number(form.maxSelections)
               : null
      }

      onAdd(question)
      handleClose()
   }

   const handleClose = () => {
      setForm(createEmptyForm(1))
      onClose()
   }

   return (
      <Dialog
         open={open}
         onClose={handleClose}
         fullWidth
         maxWidth="md"
         slotProps={{
            paper: {
               sx: {
                  borderRadius: "12px",
                  maxHeight: "92vh"
               }
            }
         }}>
         {/* Header */}
         <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-[17px] font-semibold text-content">
               {editingQuestion ? "Edit Question" : "Add New Question"}
            </h2>

            <button
               type="button"
               onClick={handleClose}
               className="rounded-md p-1 text-muted transition hover:bg-slate-100 hover:text-muted">
               <Close sx={{ fontSize: 19 }} />
            </button>
         </div>

         <Divider />

         <DialogContent className="!px-6 !py-5">
            {/* Question Type */}
            <QuestionTypeSelector
               value={form.type}
               onChange={handleTypeChange}
            />

            {/* Basic */}
            <QuestionBasicFields
               form={form}
               onChange={updateField}
            />

            {/* Dynamic fields */}
            <QuestionTypeFields
               form={form}
               onChange={updateField}
            />
         </DialogContent>

         <Divider />

         {/* Footer */}
         <div className="flex justify-end gap-3 px-6 py-4">
            <Button
               variant="outlined"
               onClick={handleClose}
               className="app-button-secondary"
               sx={cancelButtonStyle}>
               Cancel
            </Button>

            <Button
               variant="contained"
               onClick={handleSubmit}
               className="app-button-primary"
               sx={addButtonStyle}>
               {editingQuestion ? "Save Changes" : "Add Question"}
            </Button>
         </div>
      </Dialog>
   )
}

const cancelButtonStyle = {
   textTransform: "none",
   borderRadius: "7px",
   borderColor: "#dce2ea",
   color: "#475569",
   fontSize: "11px",
   height: "36px",
   px: 2.5
}

const addButtonStyle = {
   textTransform: "none",
   borderRadius: "7px",
   backgroundColor: "#633cff",
   fontSize: "11px",
   height: "36px",
   px: 2.5,
   boxShadow: "none",

   "&:hover": {
      backgroundColor: "#5530e6",
      boxShadow: "none"
   }
}

export default AddQuestionModal
