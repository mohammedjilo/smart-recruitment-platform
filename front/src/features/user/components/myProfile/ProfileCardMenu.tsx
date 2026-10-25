import { Box, Dialog, DialogTitle, IconButton, Menu, MenuItem } from "@mui/material"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "@/redux/store"
import BasicInformationForm from "../complete/BasicInformationForm"
import CertificateForm from "../complete/CertificateForm"
import EducationForm from "../complete/EducationForm"
import ExperienceForm from "../complete/ExperienceForm"
import ProjectForm from "../complete/ProjectForm"
import SkillForm from "../complete/SkillForm"
import LanguageForm from "./LanguageForm"
import ProfileEditForm from "./ProfileEditForm"
import PersonalInformationEditForm from "./PersonalInformationEditForm"
import type {
   EditableProfileFormType,
   ProfileEditFormType,
   ProfileEditDataByType
} from "./profileEditForm.types"

type Props = {
   [TFormType in ProfileEditFormType]: {
      createLabel?: string
      formType: TFormType
      editData?: ProfileEditDataByType[TFormType]
   }
}[ProfileEditFormType]

const ProfileCardMenu = ({
   createLabel,
   formType,
   editData
}: Props) => {
   const userId = useSelector((state: RootState) => state.auth.user?.id)
   const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
   const [isDialogOpen, setIsDialogOpen] = useState(false)
   const isEditMenu = Boolean(editData)

   const handleCloseMenu = () => {
      setMenuAnchor(null)
   }

   const handleOpenForm = () => {
      handleCloseMenu()
      setIsDialogOpen(true)
   }

   const handleOpenEditForm = () => {
      handleCloseMenu()
      setIsDialogOpen(true)
   }

   const handleCloseDialog = () => {
      setIsDialogOpen(false)
   }

   const formProps = {
      onSave: handleCloseDialog,
      onCancel: handleCloseDialog
   }

   const renderForm = () => {
      switch (formType) {
         case "personalInformation":
            return null
         case "professionalProfile":
            return <BasicInformationForm {...formProps} />
         case "skill":
            return <SkillForm {...formProps} />
         case "language":
            return <LanguageForm {...formProps} />
         case "education":
            return <EducationForm {...formProps} />
         case "experience":
            return <ExperienceForm {...formProps} />
         case "project":
            return <ProjectForm {...formProps} />
         case "certificate":
            return <CertificateForm {...formProps} />
      }
   }

   const renderEditForm = () => {
      if (!editData) return null

      const renderProfileEditForm = <TFormType extends EditableProfileFormType>(
         type: TFormType,
         data: ProfileEditDataByType[TFormType]
      ) => (
         <ProfileEditForm
            data={data}
            formType={type}
            onCancel={handleCloseDialog}
            onSave={handleCloseDialog}
         />
      )

      switch (formType) {
         case "personalInformation":
            return userId ? (
               <PersonalInformationEditForm
                  data={editData}
                  userId={userId}
                  onCancel={handleCloseDialog}
                  onSave={handleCloseDialog}
               />
            ) : null
         case "professionalProfile":
            return renderProfileEditForm("professionalProfile", editData)
         case "skill":
            return renderProfileEditForm("skill", editData)
         case "language":
            return renderProfileEditForm("language", editData)
         case "education":
            return renderProfileEditForm("education", editData)
         case "experience":
            return renderProfileEditForm("experience", editData)
         case "project":
            return renderProfileEditForm("project", editData)
         case "certificate":
            return renderProfileEditForm("certificate", editData)
      }
   }

   return (
      <Box className="contents">
         <IconButton
            aria-label={`${createLabel || "Edit"} menu`}
            size="small"
            onClick={event => setMenuAnchor(event.currentTarget)}>
            <MoreVertIcon fontSize="small" />
         </IconButton>

         <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleCloseMenu}>
            {createLabel && formType !== "professionalProfile" && (
               <MenuItem onClick={handleOpenForm}>{createLabel}</MenuItem>
            )}
            {isEditMenu && <MenuItem onClick={handleOpenEditForm}>Edit Info</MenuItem>}
         </Menu>

         <Dialog
            fullWidth
            maxWidth="sm"
            open={isDialogOpen}
            onClose={handleCloseDialog}>
            <DialogTitle>{isEditMenu ? "Edit Info" : createLabel}</DialogTitle>
            {isEditMenu ? renderEditForm() : renderForm()}
         </Dialog>
      </Box>
   )
}

export default ProfileCardMenu
