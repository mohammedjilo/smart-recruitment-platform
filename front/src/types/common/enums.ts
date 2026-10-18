export type JobStatus = "OPEN" | "CLOSED" | "DRAFT" | "EXPIRED"

export type EmploymentType =
   "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE" | "REMOTE"

export type ApplicationStatus =
   | "PENDING"
   | "REVIEWING"
   | "SHORTLISTED"
   | "INTERVIEW"
   | "ACCEPTED"
   | "REJECTED"
   | "WITHDRAWN"

export type QuestionType =
   "YES_NO" | "TEXT" | "NUMBER" | "SINGLE_CHOICE" | "MULTIPLE_CHOICE"

export type UserRole = "USER" | "ADMIN"
export type AccountStatus = "ACTIVE" | "DEACTIVATED"
export type UserStatus = AccountStatus
export type CompanyStatus = AccountStatus
export type CompanyApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"
export type LanguageLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "FLUENT" | "NATIVE"
export type NotificationType =
   | "APPLICATION"
   | "MESSAGE"
   | "INTERVIEW"
   | "JOB"
   | "SUPPORT"
   | "COMPANY_REQUEST"
   | "SYSTEM"
export type ResumeType = "PROFILE" | "UPLOAD"
export type ExperienceFilter = "ALL" | "0-2" | "3-5" | "6+"
