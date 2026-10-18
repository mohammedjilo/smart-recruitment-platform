import { Dialog, DialogTitle, IconButton, Menu, MenuItem } from "@mui/material"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { useState } from "react"
import BasicInformationForm from "../complete/BasicInformationForm"
import CertificateForm from "../complete/CertificateForm"
import EducationForm from "../complete/EducationForm"
import ExperienceForm from "../complete/ExperienceForm"
import ProjectForm from "../complete/ProjectForm"
import SkillForm from "../complete/SkillForm"
import LanguageForm from "./LanguageForm"
import ProfileEditForm from "./ProfileEditForm"
import type { ProfileEditFormType, ProfileEditDataByType } from "./profileEditForm.types"

type Props<TFormType extends ProfileEditFormType> = {
   createLabel?: string
   formType: TFormType
   editData?: ProfileEditDataByType[TFormType]
}

const ProfileCardMenu = <TFormType extends ProfileEditFormType>({
   createLabel,
   formType,
   editData
}: Props<TFormType>) => {
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

   return (
      <>
         <IconButton
            size="small"
            onClick={event => setMenuAnchor(event.currentTarget)}
            aria-label={`${createLabel || "Edit"} menu`}>
            <MoreVertIcon fontSize="small" />
         </IconButton>

         <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleCloseMenu}>
            {createLabel && <MenuItem onClick={handleOpenForm}>{createLabel}</MenuItem>}
            {isEditMenu && <MenuItem onClick={handleOpenEditForm}>Edit Info</MenuItem>}
         </Menu>

         <Dialog
            open={isDialogOpen}
            onClose={handleCloseDialog}
            fullWidth
            maxWidth="sm">
            <DialogTitle>{isEditMenu ? "Edit Info" : createLabel}</DialogTitle>
            {isEditMenu && editData ? (
               <ProfileEditForm
                  formType={formType}
                  data={editData}
                  onSave={handleCloseDialog}
                  onCancel={handleCloseDialog}
               />
            ) : (
               renderForm()
            )}
         </Dialog>
      </>
   )
}

export default ProfileCardMenu
