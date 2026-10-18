# Validation Inventory

This is the initial migration inventory. It records confirmed boundaries before
moving forms or business rules.

| Form / endpoint        | Frontend path                                                          | Current validation                 | Shared candidate                            | Status                                                                                          |
| ---------------------- | ---------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Login                  | `front/src/features/auth/pages/Login.tsx`                              | RHF + composed Zod                 | `auth/login.schema.ts`                      | Migrated: shared request shape plus frontend-required role                                      |
| Register user          | `front/src/features/auth/pages/RegisterUser.tsx`                       | RHF + composed Zod                 | `auth/register.schema.ts`                   | Migrated: confirmation/birthdate remain frontend-only                                           |
| Register company       | `front/src/features/auth/pages/RegisterCompany.tsx`                    | RHF + composed Zod                 | `auth/register.schema.ts`                   | Migrated: browser `File` remains frontend-only                                                  |
| Create/Edit job        | `front/src/features/company/components/JobForm/JobForm.tsx`            | Manual step state + shared Zod DTO | `jobs/create-job.schema.ts`                 | Migrated validation/DTO mapping; full RHF step-context migration remains                        |
| Support ticket         | `front/src/components/support/SupportRequestForm.tsx`                  | RHF + composed Zod                 | `support/create-support-ticket.schema.ts`   | Migrated                                                                                        |
| Create admin           | `front/src/features/admin/pages/CreateAdmin.tsx`                       | RHF + shared Zod                   | `admin/create-admin.schema.ts`              | Migrated                                                                                        |
| Send message           | Message API endpoints                                                  | Backend route + shared Zod         | `messaging/send-message.schema.ts`          | Migrated backend shape validation; conversation authorization remains service-side              |
| Education              | `front/src/features/user/components/complete/EducationForm.tsx`        | RHF + shared Zod                   | `profile/education.schema.ts`               | Migrated; null end dates normalized at API boundary                                             |
| Experience             | `front/src/features/user/components/complete/ExperienceForm.tsx`       | RHF + shared Zod                   | `profile/experience.schema.ts`              | Migrated; nullable description/end date normalized                                              |
| Project                | `front/src/features/user/components/complete/ProjectForm.tsx`          | RHF + shared Zod                   | `profile/project.schema.ts`                 | Migrated; nullable description normalized                                                       |
| Certificate            | `front/src/features/user/components/complete/CertificateForm.tsx`      | RHF + shared Zod                   | `profile/certificate.schema.ts`             | Migrated                                                                                        |
| Skills                 | `front/src/features/user/components/complete/SkillForm.tsx`            | RHF + shared Zod                   | `profile/skill.schema.ts`                   | Migrated; symbol restriction remains a documented decision                                      |
| Professional profile   | `front/src/features/user/components/complete/BasicInformationForm.tsx` | RHF + shared Zod                   | `profile/professional-profile.schema.ts`    | Migrated to API contract; UI defaults/adapters remain local                                     |
| Application submission | `front/src/features/user/components/jobs/ApplyModal.tsx`               | Manual UI checks + backend schema  | `applications/create-application.schema.ts` | Backend/shared age, coercion, and duplicate-answer rules reconciled; full RHF migration remains |

## Migration Rules

- `packages/validation` contains only Zod schemas, types, and shared constants.
- Backend services retain business rules and authorization checks.
- Browser `File` validation remains in the frontend; shared inputs contain only
  serializable metadata.
- A form is migrated only after its UI payload is mapped to the backend DTO.
