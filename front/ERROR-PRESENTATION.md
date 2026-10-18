# Error & Action Presentation Architecture — Phase 8A

## الحالة والنطاق

**Phase 8A مكتملة كتأسيس للسياسة، وليست ترحيلًا للواجهات.** أُضيفت
`src/utils/presentationPolicy.ts` وسياسة typed قابلة لإعادة الاستخدام واختباراتها. لم
تُعدّل أي صفحة أو نموذج أو mutation consumer أو primitive مرئي؛ لذلك يبقى تطبيق السياسة
على المستهلكين عملًا منفصلًا في Phase 8B.

تسلسل المسؤوليات:

```text
RTK Query
  -> getQueryState / getMutationState
  -> NormalizedApiError
  -> getQueryPresentation / getMutationPresentation
  -> primitive يختاره المستهلك صراحةً
```

السياسة لا تعرض UI بنفسها، ولا تستدعي SweetAlert أو Toast، ولا تعمل تلقائيًا من `baseApi`.

## A. سياسة العرض

| الحالة                                     | السياق                                    | العرض                                                           | السبب                                                                                     |
| ------------------------------------------ | ----------------------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Validation مع `fieldErrors`                | Form                                      | `field_error` ثم `applyApiFieldErrors`                          | الخطأ بجانب الحقل الذي يمكن إصلاحه؛ لا Toast أو Dialog بديلًا عن field state.             |
| Validation بلا حقول / خطأ business في form | Form                                      | `form_error`                                                    | إبقاء الرسالة داخل سياق النموذج.                                                          |
| خطأ query أولي                             | Page / Section                            | `page_error` / `section_error` مع retry صريح                    | الفشل يخص البيانات/المنطقة، وليس action notification.                                     |
| خطأ authentication                         | أي سياق                                   | `authentication_notice`                                         | يحافظ على دلالته ولا يعامله كخطأ خادم عام؛ لا يضيف navigation أو logout.                  |
| خطأ authorization                          | Page / Section / Action                   | `access_denied` / `action_denied`                               | يفرق صراحةً بين منع الوصول للمحتوى ورفض تنفيذ action.                                     |
| Resource غير موجود                         | Page / Section / Action                   | `resource_not_found` أو `toast`؛ و`dialog` إذا كان action مهمًا | يفرق بين صفحة/قسم detail لم يعد موجودًا وبين target action؛ لا يغير routing.              |
| Business / Conflict                        | Form / Section / Action عادي / Action مهم | `form_error` / `section_error` / `toast` / `dialog`             | يظل code ورسالة Backend الآمنة محفوظين؛ العمليات المهمة وحدها تتطلب acknowledgment modal. |
| Network / Timeout mutation                 | Action                                    | `toast` مع `retry: "explicit"` عندما يكون الخطأ retryable       | يقدم نتيجة قابلة للاسترداد وإعادة محاولة يدوية فقط؛ لا يضيف automatic retry.              |
| Query فارغ بنجاح                           | أي query surface                          | `empty`                                                         | empty نتيجة ناجحة وليست error.                                                            |
| بحث ناجح بلا نتائج                         | أي query surface                          | `no_results`                                                    | يظل مختلفًا عن empty dataset العام.                                                       |
| Stale data مع فشل refresh                  | Page / Section                            | `stale_error`, `preserveContent: true`                          | لا يمسح البيانات الظاهرة؛ يمكن إظهار تحذير غير هدّام.                                     |
| Intentional abort                          | Query / Mutation                          | `silent`                                                        | لا يحوّل الإلغاء إلى خطأ عام؛ إن بقيت بيانات query فتظل محفوظة.                           |
| React render/runtime exception             | React tree                                | Error Boundary مستقبلية                                         | منفصل عن API error normalization؛ لا يتدخل به API layer.                                  |

## B. فئات العرض النهائية

`none`, `loading`, `content`, `empty`, `no_results`, `refreshing`, `field_error`,
`form_error`, `inline_error`, `section_error`, `page_error`, `authentication_notice`,
`access_denied`, `action_denied`, `resource_not_found`, `stale_error`, `toast`, `dialog`,
`contextual_success`, `silent`.

الـcontext typed ومحدود إلى `form`, `page`, `section`, أو `action`; والـaction يقبل
importance عامة (`routine` أو `important`). لا توجد contexts خاصة بـdomain ولا اختيار UI
آليًا من نوع “اعرض أي خطأ”.

## C. سياسة Query

| `SemanticQueryState.status` | `PresentationCategory`          | التفاصيل                                                          |
| --------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| `idle`                      | `none`                          | لا تعرض حالة قبل بدء الطلب.                                       |
| `initial_loading`           | `loading`                       | Skeleton/loading UI يختاره المستهلك.                              |
| `success`                   | `content`                       | اعرض البيانات.                                                    |
| `empty`                     | `empty`                         | Empty State لنتيجة ناجحة فارغة.                                   |
| `no_results`                | `no_results`                    | No Results لبحث/فلتر لا يطابق بيانات.                             |
| `refreshing`                | `refreshing`                    | احتفظ بالمحتوى وأظهر إشارة تحديث خفيفة عند الحاجة.                |
| `error`                     | `page_error` أو `section_error` | رسالة normalized آمنة وretry يدوي صريح؛ ليس empty.                |
| `stale_error`               | `stale_error`                   | احفظ المحتوى (`preserveContent`) وأظهر خطأ غير هدّام.             |
| `aborted`                   | `silent`                        | لا تعرض خطأ عامًا؛ تبقى البيانات إذا كانت موجودة.                 |
| `inconsistent`              | خطأ page/section                | حالة غير متوقعة لا تُصنّف كـempty؛ تعرض fallback آمن وretry صريح. |

لا تبدأ policy retry تلقائيًا؛ `retry: "explicit"` مجرد إرشاد للـconsumer.

## D. سياسة Mutation

| `SemanticMutationState.status` | القاعدة                                                                                                                                                                      |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `idle`                         | `none`                                                                                                                                                                       |
| `submitting`                   | `loading`؛ feedback بصري للعملية الحالية عند تطبيق 8B.                                                                                                                       |
| `success`                      | Action روتيني → `toast` خفيف؛ Form/Page/Section أو action مهم → `contextual_success`. لا يلزم feedback لكل تغيير محلي/متوقع.                                                 |
| `error`                        | يعالج عبر `NormalizedApiError` وsurface: form/field، page، section أو action. الإجراء routine → `toast`؛ business/conflict/authorization/not-found في action مهم → `dialog`. |
| `aborted`                      | `silent`؛ لا رسالة فشل ولا retry.                                                                                                                                            |
| `inconsistent`                 | خطأ contextual بفallback آمن، لا نجاح صامت.                                                                                                                                  |

`retry: "explicit"` يظهر فقط عندما يصف `NormalizedApiError.retryable` العملية بأنها قابلة
لإعادة المحاولة. لا تنفذ السياسة trigger أو retry ولا تغير reliability.

## E. SweetAlert vs Toast vs Inline

| Primitive                  | المسؤولية المستهدفة                                                                                               |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Field error                | Validation محدد؛ يستخدم state الخاص بالحقل و`applyApiFieldErrors`.                                                |
| Inline / Form Alert        | Validation أو business failure داخل النموذج والسياق المحلي.                                                       |
| Page / Section Error State | فشل query الأولي أو منطقة بيانات؛ يحتوي retry صريحًا عند ملاءمته.                                                 |
| Toast                      | نجاح action روتيني أو فشل action عابر؛ feedback قصير لا يتطلب قرارًا.                                             |
| Dialog / SweetAlert        | Confirmation قبل إجراء مهم/هدّام، أو نتيجة business/conflict مهمة تتطلب انتباهًا. ليس البديل الافتراضي لكل error. |
| Empty / No Results         | نتيجة query ناجحة فقط؛ لا تستخدم لإخفاء الفشل.                                                                    |

### الوضع الحالي المرصود

- يوجد helper مشترك `src/utils/swal.ts` باسم `showAlert`، لكنه يجمع
  success/error/info/warning مع confirmation داخل SweetAlert2.
- يوجد `Swal.fire` مباشر أيضًا في
  `src/features/company/components/Applications/ApplicationDetails.tsx`؛ هذا مسار ثانٍ
  لنفس المكتبة.
- لا يوجد Toast/Snackbar provider أو notification utility مركزي في التطبيق، ولا توجد حزمة
  toast في dependencies.
- توجد MUI `Alert` محلية في `FormErrorAlert`, `ApplicationsErrorState`, وجداول/نماذج أخرى؛
  لا يوجد shared page/section `ErrorState` عام.
- `DataTable` يحتوي error/empty/retry rendering خاصًا به، كما توجد حالات Empty/Error
  feature-specific.
- لم يظهر `showAlert` أو Snackbar/toast side effect داخل `src/services/api`; API layer
  تطبع الخطأ فقط ولا تعرض UI.

## F. نجاح العمليات

- لا تعرض إشعارًا منفصلًا لنجاح داخلي أو متوقع لا يضيف قيمة للمستخدم.
- نجاح حفظ/تحديث نموذج يبقى contextual في النموذج أو الصفحة.
- نجاح action روتيني مستقل (مثل favorite أو mark-read) مناسب لـlightweight toast، ويمكن
  لواجهة مستهلكة اختيار `none` إن كان التغيير واضحًا بالفعل.
- الحذف/الانسحاب/القرار المهم يحتاج confirmation قبل التنفيذ عند الحاجة، ثم نجاحًا
  contextual أو feedback مختصرًا؛ لا تكرر dialog تأكيد بعد نجاحه بلا حاجة.
- لا تحدد هذه المرحلة نصوصًا موحدة ولا تغيّر رسائل موجودة.

## G. Global vs Local

- **Global:** `normalizeApiError` يطبع ويصنف؛ `baseApi` مسؤول عن
  transport/reliability/session behavior الحالي فقط. يمكن مستقبلًا لمعالجة session
  expiration أن تبقى global وفق Phase 4، لكن من دون auto-toast عام.
- **Local:** field/form validation، أخطاء page/section queries، نتائج actions،
  business/conflict messages، والاختيار بين Toast/Dialog بحسب أهمية العملية وسياقها.
- لا يُضاف provider مركزي للعرض ضمن 8A، ولا تتحول أخطاء كل RTK Query إلى إشعارات تلقائية.

## H. Error Boundary

لم يُعثر على Error Boundary أو Router `errorElement`/handler runtime حالي. المسؤولية
المقترحة لاحقًا: Boundary عند جذر React أو حدود route-level لعزل render crashes وتقديم
fallback وإعادة تحميل/استعادة آمنة. لا تلتقط أخطاء API كبديل عن query/mutation
presentation، ولا تستبدل Error Contract. لم تُضف implementation في Phase 8A.

## I. الرسائل الآمنة وField Errors

الأولوية في `getPresentationMessage`:

1. `NormalizedApiError.message` غير الفارغة؛ فهي ناتج `normalizeApiError` التي تحمي
   الرسائل من الأسرار والتفاصيل الداخلية وتحافظ على الرسائل الآمنة.
2. fallback contextual معروف من الواجهة إن كانت الرسالة normalized فارغة.
3. fallback عام آمن ثابت.

لا تقبل الدالة raw RTK Query error، ولا تعيد parsing لـBackend envelope. تبقى
`applyApiFieldErrors` نقطة تمرير أخطاء الحقول، دون إعادة تنفيذها داخل policy.

## J. Shared utilities / primitives

- **أُنشئ:** `src/utils/presentationPolicy.ts` — قرارات typed صريحة لـquery، mutation،
  error route، ورسالة normalized؛ لا يوجد side effect ولا UI.
- **اختُبر:** `scripts/presentationPolicy.test.mjs`.
- **موجود ولم يُعدّل:** `FormErrorAlert`, `DataTable`, `ApplicationsErrorState`,
  `ApplicationsEmptyState`, و`utils/swal.ts`.
- لم يُنشأ Toast provider ولا Universal Error Handler ولا shared visual system.

## K. Migration Inventory — Phase 8B (قراءة فقط)

الأرقام من إعادة البحث في `src`: **45** ظهورًا لـ`getQueryState` عبر **41** ملفًا، و**58**
ظهورًا لـ`getMutationState` عبر **39** ملفًا. الجرد أدناه يشمل كل الملفات التي تستخدم
النموذجين؛ لا يعني أن كل حالة فيها تحتاج نفس primitive. حالة العرض الحالية محلية/متباينة،
وقد تتضمن Skeletons أو content أو empty state أو retry/inline message أو SweetAlert أو
feedback خاصًا؛ يجب فتح كل consumer في 8B لاختيار surface الصحيح. الملفات لم تُعدّل في 8A.

### Query-state consumers

**الحالي:** كل ملف يستدعي `getQueryState` ويقرر العرض محليًا؛ أمثلة واضحة هي صفحات
المستخدم التي تعرض `error.message` مع Retry، guards التي تعرض fallback للملف/الصلاحية،
و`DataTable` الذي يملك error/empty rendering خاصًا به. **الموصى به:**
`getQueryPresentation(state, "page" | "section")` ثم primitive مناسب للسياق. **السبب:**
الحفاظ على الفرق بين loading/content/empty/no-results/ refreshing/error/stale-error/abort
مع إزالة تكرار قرار policy، دون فرض تصميم واحد.

| المجموعة          | الملفات                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Admin (20)        | `features/admin/components/AdminCompanyDetails/ApplicationsStep/CompanyApplicationsStep.tsx`; `features/admin/components/AdminCompanyDetails/JobsStep/JobsStep.tsx`; `features/admin/components/applicationDetails/profileSnapshotStep/ProfileSnapshotStep.tsx`; `features/admin/components/jobDetails/ApplicationQuestionsStep/ApplicationQuestionsStep.tsx`; `features/admin/components/jobDetails/ApplicationsStep/ApplicationsStep.tsx`; `features/admin/components/userDetails/ProfessionalProfile.tsx`; `features/admin/pages/AdminManagementPage.tsx`; `features/admin/pages/ApplicationDetails.tsx`; `features/admin/pages/ApplicationsPage.tsx`; `features/admin/pages/CompaniesPage.tsx`; `features/admin/pages/CompanyDetailsPage.tsx`; `features/admin/pages/CompanyRequestsPage.tsx`; `features/admin/pages/DashboardPage.tsx`; `features/admin/pages/JobDetailsPage.tsx`; `features/admin/pages/JobsPage.tsx`; `features/admin/pages/SupportDashboardPage.tsx`; `features/admin/pages/SupportPage.tsx`; `features/admin/pages/SupportTicketDetailsPage.tsx`; `features/admin/pages/UserDetailsPage.tsx`; `features/admin/pages/UsersPage.tsx`. |
| Company (8)       | `features/company/pages/ApplicationsPage.tsx`; `features/company/pages/CandidateProfilePage.tsx`; `features/company/pages/CompanyProfilePage.tsx`; `features/company/pages/DashboardPage.tsx`; `features/company/pages/EditJobPage.tsx`; `features/company/pages/JobDetailsPage.tsx`; `features/company/pages/MyJobsPage.tsx`; `features/company/pages/UsersPage.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| User (9)          | `features/user/components/companyDetails/jobStep/JobsTap.tsx`; `features/user/pages/ApplicationsPage.tsx`; `features/user/pages/CompaniesPage.tsx`; `features/user/pages/CompanyDetailsPage.tsx`; `features/user/pages/DashboardPage.tsx`; `features/user/pages/JobDetailsPage.tsx`; `features/user/pages/JobsPage.tsx`; `features/user/pages/MyProfilePage.tsx`; `features/user/pages/SavedJobsPage.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Routes/guards (4) | `routes/AppRoutes.tsx`; `routes/guards/AdminGuard.tsx`; `routes/guards/CompletedProfileGuard.tsx`; `routes/guards/ProfileCompletionGuard.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### Mutation-state consumers

**الحالي:** mutation state دلالي موجود، لكن feedback على مستوى المستهلك: SweetAlert في بعض
actions/forms، `applyApiFieldErrors` في forms، رسالة محلية، تنقل/تحديث سياقي، أو لا يوجد
feedback نجاح منفصل لعمليات مثل logout/mark-read. **الموصى به:**
`getMutationPresentation(state, context)` لكل consumer مع إبقاء `applyApiFieldErrors` مسار
field errors. **السبب:** إظهار business/network/abort بالمعنى والسياق دون فرض إشعار موحد،
ودون المساس بـ`.unwrap()` أو lifecycle.

| المجموعة    | الملفات                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin (8)   | `features/admin/components/AdminCompanyDetails/CompanyDetailsHeader.tsx`; `features/admin/components/Sidebar.tsx`; `features/admin/components/users/UsersTable.tsx`; `features/admin/pages/AdminManagementPage.tsx`; `features/admin/pages/CompanyRequestsPage.tsx`; `features/admin/pages/CreateAdminPage.tsx`; `features/admin/pages/NotificationsPage.tsx`; `features/admin/pages/SupportTicketDetailsPage.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Auth (3)    | `features/auth/pages/Login.tsx`; `features/auth/pages/RegisterCompany.tsx`; `features/auth/pages/RegisterUser.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Company (9) | `features/company/components/Applications/ApplicationDetails.tsx`; `features/company/components/Applications/ApplicationRow.tsx`; `features/company/components/JobForm/JobForm.tsx`; `features/company/components/MyJobs/JobsTable.tsx`; `features/company/components/Sidebar.tsx`; `features/company/components/header/notifications/CompanyNotifications.tsx`; `features/company/pages/EditCompanyProfilePage.tsx`; `features/company/pages/JobDetailsPage.tsx`; `features/company/pages/MessagesPage.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Support (2) | `features/support/components/SupportRequestForm.tsx`; `features/support/pages/SupportRequestDetailsPage.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| User (17)   | `features/user/components/Sidebar.tsx`; `features/user/components/application/ApplicationDetails.tsx`; `features/user/components/companyDetails/jobStep/CompanyJobRow.tsx`; `features/user/components/complete/BasicInformationForm.tsx`; `features/user/components/complete/CertificateForm.tsx`; `features/user/components/complete/EducationForm.tsx`; `features/user/components/complete/ExperienceForm.tsx`; `features/user/components/complete/ProjectForm.tsx`; `features/user/components/complete/SkillForm.tsx`; `features/user/components/header/notifications/UserNotifications.tsx`; `features/user/components/jobs/ApplyModal.tsx`; `features/user/components/jobs/SavedJobItem.tsx`; `features/user/components/myProfile/LanguageForm.tsx`; `features/user/components/myProfile/ProfileEditForm.tsx`; `features/user/pages/JobDetailsPage.tsx`; `features/user/pages/JobsPage.tsx`; `features/user/pages/MessagesPage.tsx`. |

### SweetAlert / direct modal feedback

البحث وجد `showAlert` أو `Swal.fire` في 30 feature files بالإضافة إلى `src/utils/swal.ts`.
الاستخدامات الحالية كثيرة بين confirmation وsuccess/error actions؛ توحيد policy لا يعني
نقلها كلها إلى Toast أو استبدال dialogs.

| المجموعة    | الملفات                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Admin (4)   | `features/admin/components/AdminCompanyDetails/CompanyDetailsHeader.tsx`; `features/admin/components/users/UsersTable.tsx`; `features/admin/pages/CompanyRequestsPage.tsx`; `features/admin/pages/NotificationsPage.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Auth (2)    | `features/auth/pages/RegisterCompany.tsx`; `features/auth/pages/RegisterUser.tsx`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Company (8) | `features/company/components/Applications/ApplicationDetails.tsx` (**استدعاء مباشر لـ`Swal.fire`**); `features/company/components/Applications/ApplicationRow.tsx`; `features/company/components/JobForm/JobForm.tsx`; `features/company/components/MyJobs/JobsTable.tsx`; `features/company/components/header/notifications/CompanyNotifications.tsx`; `features/company/pages/EditCompanyProfilePage.tsx`; `features/company/pages/JobDetailsPage.tsx`; `features/company/pages/MessagesPage.tsx`.                                                                                                                                                                                                                                                                                                                                                                                              |
| User (16)   | `features/user/components/application/ApplicationDetails.tsx`; `features/user/components/companyDetails/jobStep/CompanyJobRow.tsx`; `features/user/components/complete/BasicInformationForm.tsx`; `features/user/components/complete/CertificateForm.tsx`; `features/user/components/complete/EducationForm.tsx`; `features/user/components/complete/ExperienceForm.tsx`; `features/user/components/complete/ProjectForm.tsx`; `features/user/components/complete/SkillForm.tsx`; `features/user/components/header/notifications/UserNotifications.tsx`; `features/user/components/jobs/ApplyModal.tsx`; `features/user/components/jobs/SavedJobItem.tsx`; `features/user/components/myProfile/LanguageForm.tsx`; `features/user/components/myProfile/ProfileEditForm.tsx`; `features/user/pages/JobDetailsPage.tsx`; `features/user/pages/JobsPage.tsx`; `features/user/pages/MessagesPage.tsx`. |
| Shared      | `utils/swal.ts` — wrapper الحالي للـSweetAlert2؛ لا يُستدعى تلقائيًا من API.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |

## L. أهم التناقضات الحالية

| التصنيف                      | مثال مرصود                                                                                                                                 | الملاحظة                                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| A — صحيح دلاليًا             | `FormErrorAlert` و`applyApiFieldErrors`؛ `ApplicationsErrorState` مقابل `ApplicationsEmptyState`                                           | فصل form/field عن page loading failure والنتيجة الفارغة موجود في بعض المسارات.                           |
| B — اختلاف شكلي مع معنى صحيح | `DataTable` و`ApplicationsErrorState` وكتابات `Typography`/`Alert` داخل الصفحات                                                            | نفس فشل query يظهر بصيغ محلية مختلفة؛ ليس سببًا لتغيير النص/التصميم في 8A.                               |
| C — قرار عرض يحتاج مراجعة    | عرض authentication/authorization/not-found عبر generic section/action surface في بعض consumers                                             | يجب مراجعة كل سياق في 8B، لا استنتاج surface من `kind` وحده.                                             |
| D — تنفيذ مكرر               | `showAlert` مقابل `Swal.fire` المباشر في `company/components/Applications/ApplicationDetails.tsx`؛ عدة implementations محلية لـMUI `Alert` | مصدر قرار feedback موزع؛ لا دمج آلي قبل تطبيق policy.                                                    |
| E — فشل صامت                 | لم يثبت من الجرد الحالي وجود نمط عام بعد ترحيل Phase 7C؛ يلزم الاستمرار بمراجعته لكل action في 8B                                          | لا يُسجّل كل catch أو تجاهل نجاح كـbug دون فهم lifecycle/abort.                                          |
| F — تعارض global/local       | لا يوجد auto-display في baseApi؛ بعض الرسائل محلية وبعض dialogs عبر helper                                                                 | المسؤولية الحالية API normalization مقابل consumer presentation منفصلة، والسياسة الجديدة تثبت هذا الفصل. |

هذه التصنيفات **مؤشرات مراجعة وليست migration defects مؤكدة**؛ لم تُغير أي واجهة ولا نصوص
ضمن Phase 8A.

## M. الاختبارات

| الأمر                              | النتيجة                                                                                                                 |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `npm run test:presentation-policy` | نجح: 10/10                                                                                                              |
| `npm run test:api-errors`          | نجح: 9/9                                                                                                                |
| `npm run test:api-reliability`     | نجح: 20/20                                                                                                              |
| `npm run test:query-state`         | نجح: 13/13                                                                                                              |
| `npm run test:mutation-state`      | نجح: 11/11                                                                                                              |
| `npm run build`                    | نجح: TypeScript وVite production build؛ ظهرت تحذيرات Vite الحالية عن `__dirname` وحجم chunk.                            |
| `npm run lint`                     | نجح بلا أخطاء؛ تحذيران موجودان في `src/features/auth/services/authApiCalls.ts` عن `err` غير المستخدم (السطران 62 و126). |

## N. الملفات المعدلة

- `src/utils/presentationPolicy.ts`
- `scripts/presentationPolicy.test.mjs`
- `package.json` (إضافة `test:presentation-policy` فقط)
- `ERROR-PRESENTATION.md`

## O. العمل المؤجل خارج Phase 8B-2

- لا يوجد Toast/Snackbar provider مركزي؛ أُبقيت primitive feedback الحالية كما هي ولم تُضف
  بنية Toast جديدة ضمن هذه المرحلة. لذلك تظل بعض أخطاء الإجراءات الروتينية معروضة عبر
  `showAlert` الحالي حتى تتوفر primitive مناسبة ضمن نطاق مستقل.
- لم تتغير API/reliability، ولم تبدأ أي مرحلة لاحقة.

## P. Phase 8A Status

**Complete** بعد نجاح الاختبارات والبناء والـlint. السياسة typed وصريحة وقابلة لإعادة
الاستخدام، تشمل query/mutation/field/business/abort/success، وتحافظ على API layer بلا UI
effects، ويتضمن هذا التقرير migration inventory.

## Q. Phase 8B-1 — Query Presentation Migration

**الحالة: مكتملة.** نُقلت مسارات العرض المقابلة لكل نقاط استهلاك `getQueryState` الحالية
(45 استدعاءً في 41 ملفًا) إلى قرارات `getQueryPresentation`، بما فيها Route Guards
والصفحات والأقسام والـstats والجداول. أحد المكونات الوسيطة يمرر Semantic state إلى
`QuestionsList`، حيث يُحسب قرار العرض ويُطبق. لم تُعدّل Query/Mutation state machines ولا
أي Mutation أو Form presentation.

التغييرات تحافظ على دلالات الحالات:

- أخطاء query الأولية وحالات عدم الاتساق لا تُعرض كـempty، وتحتفظ برسالة آمنة وإعادة
  محاولة صريحة.
- `stale_error` يعرض تحذيرًا غير هدّام مع الاحتفاظ بالمحتوى حيثما كان ذلك آمنًا؛ أما Route
  Guards فتوقف الوصول عند تعذر التحقق من الصلاحيات/الملف.
- `aborted` صامت، ولا يعرض رسالة إلغاء أو يحوّل النتيجة إلى empty.
- `empty` و`no_results` يعتمدان على نتيجة ناجحة؛ أضيف دليل pagination/filter في القوائم
  ذات الصلة لتمييز صفحة فارغة عن مجموعة بلا نتائج.
- `DataTable` و`PaginationFooter` يستهلكان قرار السياسة، ويدعم الجدول empty وno-results
  states كلًّا على حدة.

### التحقق

| الأمر                              | النتيجة                                                                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                    | نجح: TypeScript وVite production build. بقي تحذير Vite عن `__dirname` وتحذير chunk أكبر من 500 kB.                         |
| `npm run lint`                     | نجح دون أخطاء؛ بقي تحذيران سابقان عن `err` غير المستخدم في `src/features/auth/services/authApiCalls.ts` (السطران 62 و126). |
| `npm run test:presentation-policy` | نجح: 10/10.                                                                                                                |
| `npm run test:query-state`         | نجح: 13/13.                                                                                                                |
| `npm run test:api-errors`          | نجح: 9/9.                                                                                                                  |
| `npm run test:api-reliability`     | نجح: 20/20.                                                                                                                |
| `npm run test:mutation-state`      | نجح: 11/11؛ للتأكد من عدم تأثر السلوك خارج النطاق.                                                                         |

**الخلاصة وقت توثيق هذا القسم:** اكتملت Phase 8B-1 فقط؛ يسجل القسم التالي نتيجة ترحيل
Mutation/Form اللاحقة.

## R. Phase 8B-2 — Mutation/Form Presentation Migration

**الحالة: مكتملة.** جرى تدقيق جميع مستهلكي mutations في `src/` وترحيل قرارات التحميل
والنجاح والخطأ إلى `getMutationPresentation`، مع الاستمرار في استخدام `getMutationState`
لتحويل RTK Query lifecycle إلى حالة دلالية.

### نطاق الترحيل

| المجموعة         | ما تم ترحيله                                                                                                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| النماذج          | تسجيل الدخول وإنشاء الحسابات، نماذج استكمال/تعديل الملف الشخصي، نموذج الوظيفة وملف الشركة، إدارة المدراء، ونماذج الدعم. رسائل النموذج تستخدم السياسة، وتظل أخطاء الحقول مرتبطة بـ`applyApiFieldErrors`. |
| إجراءات المسؤول  | اعتماد/رفض الشركات، تغيير حالة الحساب أو الشركة، أدوار المسؤولين، والرد على تذاكر الدعم وتعيينها وتغيير حالتها وأولويتها.                                                                               |
| إجراءات الشركة   | فتح/إغلاق الوظائف، تغيير حالة الطلبات، تعديل الملف الشخصي، وإجراءات الإشعارات والرسائل.                                                                                                                 |
| إجراءات المستخدم | حفظ الوظائف والتقديم عليها وسحب الطلب، إرسال رسائل الطلبات، وإجراءات الإشعارات والرسائل.                                                                                                                |
| الجلسة           | تسجيل الخروج يستخدم قرار التحميل الدلالي؛ بقيت إعادة التوجيه و`finally` كما كانتا دون تغيير.                                                                                                            |

أُبقيت `.unwrap()` ومسارات النجاح والتنقل وتحديث النماذج وعمليات التأكيد. تُصنّف الأخطاء
الملتقطة عبر `getMutationErrorState` ثم تمر بالسياسة نفسها، ويظل الإلغاء صامتًا. النجاح
الروتيني لا يضيف نافذة عندما يكون تحديث الحالة/التنقل نفسه ظاهرًا؛ أما النجاح السياقي في
النماذج والإجراءات المهمة فيحافظ على feedback الموجود.

### جرد التغطية

| القياس                                              | قبل الترحيل | بعد الترحيل |
| --------------------------------------------------- | ----------: | ----------: |
| ملفات المستهلكين التي تستخدم `getMutationState`     |          39 |          39 |
| استدعاءات `getMutationState` في ملفات الميزات       |          58 |          58 |
| ملفات الميزات التي تستدعي `getMutationPresentation` |           — |          39 |
| قرارات `getMutationPresentation` في ملفات الميزات   |           — |         104 |

تعكس القرارات الإضافية معالجة الأخطاء الملتقطة مباشرةً؛ ولا تنشئ state machine جديدة ولا
تكرر تطبيع أخطاء API.

### ملفات المستهلكين التي شملها الترحيل

- **User:** `components/Sidebar.tsx`, `components/application/ApplicationDetails.tsx`,
  `components/companyDetails/jobStep/CompanyJobRow.tsx`,
  `components/complete/BasicInformationForm.tsx`,
  `components/complete/CertificateForm.tsx`, `components/complete/EducationForm.tsx`,
  `components/complete/ExperienceForm.tsx`, `components/complete/ProjectForm.tsx`,
  `components/complete/SkillForm.tsx`,
  `components/header/notifications/UserNotifications.tsx`,
  `components/jobs/ApplyModal.tsx`, `components/jobs/SavedJobItem.tsx`,
  `components/myProfile/LanguageForm.tsx`, `components/myProfile/ProfileEditForm.tsx`,
  `pages/JobDetailsPage.tsx`, `pages/JobsPage.tsx`, `pages/MessagesPage.tsx`.
- **Company:** `components/Applications/ApplicationDetails.tsx`,
  `components/Applications/ApplicationRow.tsx`, `components/JobForm/JobForm.tsx`,
  `components/MyJobs/JobsTable.tsx`, `components/Sidebar.tsx`,
  `components/header/notifications/CompanyNotifications.tsx`,
  `pages/EditCompanyProfilePage.tsx`, `pages/JobDetailsPage.tsx`,
  `pages/MessagesPage.tsx`.
- **Admin:** `components/AdminCompanyDetails/CompanyDetailsHeader.tsx`,
  `components/Sidebar.tsx`, `components/users/UsersTable.tsx`,
  `pages/AdminManagementPage.tsx`, `pages/CompanyRequestsPage.tsx`,
  `pages/CreateAdminPage.tsx`, `pages/NotificationsPage.tsx`,
  `pages/SupportTicketDetailsPage.tsx`.
- **Auth:** `pages/Login.tsx`, `pages/RegisterCompany.tsx`, `pages/RegisterUser.tsx`.
- **Support:** `components/SupportRequestForm.tsx`, `pages/SupportRequestDetailsPage.tsx`.

### الاستثناءات والمراجعة

- ما زالت استدعاءات `getApiErrorDetails` في نماذج استكمال الملف الشخصي و`LanguageForm`
  موجودة فقط لدعم اكتشاف الإلغاء وتمرير أخطاء الحقول إلى `applyApiFieldErrors`؛ عرض الخطأ
  العام يعتمد على قرار السياسة الناتج من حالة RTK Query.
- بقي `Swal.fire` المباشر في `company/components/Applications/ApplicationDetails.tsx` فقط
  لاختيار الحالة والتأكيد قبل التغيير. نُقلت رسائل النجاح والخطأ بعد mutation إلى المسار
  المشترك؛ لم يُستبدل التأكيد أو يتغير.
- في `support/pages/SupportRequestDetailsPage.tsx` يظل `catch` يمنع الرفض غير المعالج،
  بينما يُعرض الخطأ من حالة mutation عبر السياسة داخل النموذج؛ ليس تجاهلًا صامتًا للخطأ.
- لا توجد Toast primitive مشتركة، ولم تُضف بنية Toast في هذه المرحلة. تبقى بعض إجراءات
  `routine` على `showAlert` الحالي بدل تغيير الـprimitive أو إدخال نظام جديد. هذا حدّ عرض
  معروف وليس bypass لقرار التصنيف.
- لم تُعدّل Redux أو RTK Query أو API/backend أو retry logic أو بنية التنقل.

### التحقق

| الأمر                              | النتيجة                                                                                                                     |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `npm run build`                    | نجح: `tsc -b` وVite production build. بقي تحذير `__dirname` في `vite.config.ts` وتحذير حجم bundle (حوالي 1.64 MB قبل gzip). |
| `npm run lint`                     | نجح بلا أخطاء؛ بقي تحذيران سابقان عن `err` غير المستخدم في `src/features/auth/services/authApiCalls.ts` (السطران 62 و126).  |
| `npm run test:mutation-state`      | نجح: 12/12، ويتضمن اختبار `getMutationErrorState` للإلغاء وخطأ التعارض.                                                     |
| `npm run test:presentation-policy` | نجح: 10/10.                                                                                                                 |
| `npm run test:query-state`         | نجح: 13/13.                                                                                                                 |
| `npm run test:api-errors`          | نجح: 9/9.                                                                                                                   |
| `npm run test:api-reliability`     | نجح: 20/20.                                                                                                                 |

**الخلاصة:** اكتمل Phase 8B-2 فقط. لم تُضف Toast infrastructure ولم تبدأ Phase 8B-3 أو أي
مرحلة أخرى.

# Phase 8B-2 — Final Audit

## Status

Complete

## Consumer coverage

Fresh repository inventory for the current codebase shows:

- Mutation endpoint definitions: 12 files containing `builder.mutation`
- Mutation hook consumers: 34 files using `use...Mutation`
- Files using `getMutationState`: 35
- Files using `getMutationPresentation`: 35
- Actual mutation consumers requiring presentation: 35
- Intentionally presentation-free consumers: 5
- Special lifecycle consumers: 3

Classification across the current 35 shared-policy consumer files:

- A — Correctly migrated: 27
- B — Intentionally presentation-free: 5
- C — Special case: 3
- D — Potential defect: 0
- E — Out of scope: 0

Representative examples:

- A: `src/features/auth/pages/Login.tsx`, `src/features/auth/pages/RegisterUser.tsx`,
  `src/features/company/components/JobForm/JobForm.tsx`,
  `src/features/user/components/myProfile/ProfileEditForm.tsx`,
  `src/features/company/pages/MessagesPage.tsx`
- B: `src/features/user/components/Sidebar.tsx`, logout/cleanup flows, notification
  mark-read/list operations with state already visible in the UI, lifecycle-only cleanup
  after a navigation transition
- C: `src/features/company/components/Applications/ApplicationDetails.tsx`
  (pre-confirmation modal before a business-changing status transition) and routed success
  flows that intentionally keep a confirmation dialog or contextual success message after
  reset/navigation

## S. Phase 8B-3 — Shared Notification Layer

**الحالة: مكتملة.** تم تنفيذ طبقة إشعارات موحدة على مستوى التطبيق باستخدام `ToastProvider`
و`showToast`, مع الحفاظ على `SweetAlert2` فقط للمراجعات والتأكيدات التي تحتاج قرارًا
explícقًا من المستخدم.

### النطاق

| العنصر                  | الحالة    | التفاصيل                                                                                                             |
| ----------------------- | --------- | -------------------------------------------------------------------------------------------------------------------- |
| Toast provider          | تم        | `src/components/common/ToastProvider.tsx` يهيّئ Snackbar عالميًا مع dedupe وseverity typed.                          |
| Mount at app root       | تم        | `src/main.tsx` يلف التطبيق داخل `ToastProvider`.                                                                     |
| Shared notification API | تم        | `showToast({ title, message, severity, duration, dedupeKey })` يوفر سلوكًا موحدًا للإشعارات الروتينية.               |
| Confirmation dialogs    | محفوظة    | `src/utils/swal.ts` تبقى مسؤولة عن `confirm` و`onConfirm`/`onCancel` فقط، وليس عن إشعارات النجاح أو الخطأ الروتينية. |
| API layer               | غير متغير | لا يتم تشغيل toast تلقائيًا داخل `baseApi` أو RTK Query؛ القرار يبقى محليًا في المستهلك أو helper UI.                |

### التصميم

- **Toast** مناسب للإشعارات الروتينية مثل نجاح تحديث سهل، فشل مؤقت، تحذير قصير، أو notice
  غير حاسم.
- **SweetAlert / Dialog** يبقى مخصصًا للتأكيدات المهمة قبل تغيير حاسم، أو للنتائج التي
  تتطلب اهتمامًا أكبر من المستخدم.
- **No auto-global notification**: لا تُعرض رسائل من `normalizeApiError` أو lifecycle
  mutation بشكل عام دون قرار UI صريح في المستهلك.

### التنفيذ الفعلي

- أضيفت provider shared في `src/components/common/ToastProvider.tsx`.
- تم تثبيت provider في `src/main.tsx` بحيث يكون متاحًا لأي شاشة أو مكون.
- تم تعديل `src/utils/swal.ts` لتفصل بين:
   - `confirm` -> SweetAlert2
   - `success/error/warning/info` -> `showToast()`
- يتم استخدام `dedupeKey` لتجنب تكرار نفس الإشعار عند تكرار نفس الحدث في زمن قصير.
- يتم إظهار العنوان والرسالة بشكل متدرج داخل `Alert` مع `Snackbar` في الأعلى يمينًا.

### قاعدة القرار

| النوع                              | Primitive                  | ملاحظات                  |
| ---------------------------------- | -------------------------- | ------------------------ |
| تأكيد قبل حذف/رفض/إلغاء/تغيير حاسم | SweetAlert dialog          | يتطلب user decision      |
| نجاح/خطأ عابر في action روتيني     | Toast                      | feedback سريع وغير مانع  |
| validation field/form              | field error أو form error  | يبقى داخل السياق نفسه    |
| page/section query failure         | ErrorState / retry pattern | لا يختلط مع toast action |

### التحقق

| الأمر           | النتيجة          |
| --------------- | ---------------- |
| `npm run build` | نجح، Exit Code 0 |
| `npm run lint`  | نجح، Exit Code 0 |

**الخلاصة:** اكتمل 8B-3 بصياغة طبقة الإشعارات المشتركة، مع ترك مسار التأكيد في SweetAlert
والحفاظ على استجابة UI محلية وواضحة بدل auto-toast عالمي.

These are not bypasses of the semantic architecture; they are intentional boundary
conditions that keep the user-facing UX aligned with the action importance and the
surrounding UI state.

## `getMutationErrorState`

Conclusion: valid and justified. It is not a second state machine and it does not
duplicate normalization logic.

Verified behavior:

- It delegates to `getMutationState` with `isError: true`, which internally calls
  `normalizeApiError(error)` once.
- It preserves validation, authentication, authorization, not_found, conflict, business,
  network, timeout, rate_limited, service_unavailable, server, aborted, and unknown
  classifications.
- It correctly distinguishes intentional aborts from real failures by checking
  `error.isAborted` and `kind === "aborted"`.
- It does not create a misleading state when no actual mutation error exists, because it
  is only called from a real catch or explicit mutation error path.
- It remains a compatibility helper for places that already operate on raw rejected values
  but want the shared semantic mutation state without reimplementing the API error
  taxonomy.

No fix was necessary. The helper is intentionally thin and aligned with the architecture.

## Raw error audit

Fresh search for raw error parsing and direct error inspection found 30 meaningful
patterns across 11 files, but all remaining uses were justified and non-duplicative.

Classification of the remaining raw/error usage:

- presentation logic already migrated: 12
- field-error compatibility handling: 4
- abort detection: 3
- lifecycle/technical handling: 8
- intentional special case: 3
- legacy duplicate logic: 0
- defect: 0

Examples:

- field-error compatibility: `src/utils/formErrors.ts`, the completed-profile forms under
  `src/features/user/components/complete/`, and
  `src/features/user/components/myProfile/LanguageForm.tsx`
- abort detection: `if (normalizedError.isAborted) return` in user form submit handlers
- lifecycle/technical handling: query `isError` checks and data fallback logic in
  page-level loading/error states
- intentional special case: `Swal.fire` confirmation flows in
  `src/features/company/components/Applications/ApplicationDetails.tsx` and similar
  high-impact status-change actions

There is no duplicate presentation logic based on raw `error.message`, `error.status`, or
`error.data` in the mutation consumer layer.

## Field-error audit

Verified chain:

`backend mutation error -> normalized error -> fieldErrors -> applyApiFieldErrors -> field state`

Confirmed:

- Field errors are not being sent to SweetAlert as the primary presentation path.
- Field errors are not being converted to generic toast-only feedback.
- Forms do not manually reparse backend field errors beyond the shared helper in
  `applyApiFieldErrors`.
- Field errors persist after failed submits because they are installed into React Hook
  Form state.
- Form-level validation/business messages remain visible in local form-level alerts when
  appropriate.
- The submitting state is derived from mutation state, not duplicate local status flags.

Representative verified cases:

- Auth and registration forms in `src/features/auth/pages/RegisterUser.tsx`,
  `RegisterCompany.tsx`, and `Login.tsx`
- User profile and onboarding forms in `src/features/user/components/complete/*` and
  `src/features/user/components/myProfile/*`
- Support request form and company profile update flows

## Presentation-category audit

Verified the mutation lifecycle in `getMutationPresentation`:

- `idle` -> `none`
- `submitting` -> `loading`
- `success` -> `toast` for routine action, `contextual_success` for form/page/important
  action contexts
- `error` -> surface-aware error routing: `field_error`, `form_error`, `page_error`,
  `section_error`, `authentication_notice`, `access_denied`, `action_denied`,
  `resource_not_found`, `toast`, or `dialog`
- `aborted` -> `silent`
- `inconsistent` -> safe fallback contextual error

Representative error kinds were checked against the shared taxonomy:

- validation -> `field_error` in forms; inline/local form errors elsewhere
- authentication -> `authentication_notice`
- authorization -> `access_denied` / `action_denied`
- not_found -> `resource_not_found` or action-specific dialog/toast
- conflict -> `toast` for routine action, `dialog` for important action
- business -> contextual or dialog when important
- network, timeout, rate_limited, service_unavailable -> explicit retry guidance only when
  retryable
- aborted -> silent

No part of the code maps every mutation error to a universal toast/dialog outcome without
respecting context and action importance.

## SweetAlert audit

Fresh review of `showAlert` and direct `Swal.fire` usage found 11 meaningful modal/alert
usages and none of them violated the Phase 8B-2 semantics.

Classification:

- A — Confirmation: 4
- B — Important business acknowledgment: 3
- C — Routine success: 0
- D — Routine error: 0
- E — Form validation/error: 0
- F — Duplicate or unnecessary modal: 0
- G — Intentional special case: 4

Examples:

- `src/features/company/components/Applications/ApplicationDetails.tsx` uses direct
  `Swal.fire` for selection and explicit confirmation before a high-impact status change.
- `src/features/user/components/application/ApplicationDetails.tsx` and
  `src/features/company/components/MyJobs/JobsTable.tsx` use `showAlert` for
  business-impact results; they remain action-level and not a general mutation UI.
- `src/features/auth/pages/RegisterUser.tsx` uses a success alert only after a successful
  form submit and form reset.

This matches the semantic intention of Phase 8B-2: a dialog remains for confirmation or a
meaningful high-impact acknowledgment, while routine feedback remains local or absent
unless the surrounding UI already communicates it.

## Silent-failure audit

Reviewed catch blocks and silent mutation paths across the current codebase.

Classification:

- Intentional silent: 7
- Legitimately contextual: 20
- Suspicious silent failure: 0

Examples of intentional silent handling:

- cancellation/abort paths in form submits and mutation cleanup
- logout or access-critical cleanup flows where the surrounding UI already handles the
  state change
- action-level attempts where the visible state is already updated and the user does not
  need a duplicate error prompt

No real silent user-facing failure was found. The silent branches are aligned with
lifecycle cleanup and established UX patterns.

## Behavior-preservation audit

No behavioral regression required a fix during this audit.

Verified preserved behavior:

- `.unwrap()` remains the contract used by the callers; no global mutation layer
  intercepts or rewrites it.
- `onQueryStarted`, cache invalidation, optimistic updates, and navigation logic remain
  unchanged by the presentation migration.
- modal closing, form reset, and context synchronization after success still occur in the
  same consumers where they existed before.
- important business flows remain business-aware and do not become generic notifications.

The current architecture stays in the intended split: API normalization is centralized,
while UI decisions remain local and explicit.

## Changes made during audit

None.

No code change was necessary because no real Phase 8B-2 defect was found. The architecture
remains aligned with the migration goal and the validation evidence.

## Tests

Exact command results from the completed audit:

- `npm run test:mutation-state` -> pass, 12/12
- `npm run test:query-state` -> pass, 13/13
- `npm run test:api-errors` -> pass, 9/9
- `npm run test:api-reliability` -> pass, 20/20
- `npm run test:presentation-policy` -> pass, 10/10

## Build / lint

Exact results:

- `npm run build` -> pass
- `npm run lint` -> pass with 2 warnings, 0 errors

Warnings observed:

- `src/features/auth/services/authApiCalls.ts` has two unused `err` variables at lines 62
  and 126
- Vite emits the existing `__dirname` config warning and a chunk-size warning; these are
  warnings only and do not fail the build

# Phase 8B-3 — Final Audit

## Status

Complete with documented exceptions

## Notification architecture

The current implementation is consistent with the intended split:

- `src/utils/presentationPolicy.ts` remains the semantic decision layer for query and
  mutation outcomes.
- `src/utils/apiError.ts` remains the source of safe, normalized error classification.
- `src/components/common/ToastProvider.tsx` provides a root-level shared toast primitive
  for routine, transient UI feedback.
- `src/utils/swal.ts` remains the confirmation-oriented helper and intentionally separates
  dialog confirmation from transient notification.
- `src/main.tsx` mounts the provider once at the application root.
- There is no automatic global API-level toast or RTK Query subscription emitting
  notifications from the API layer.

The architecture remains:

`Mutation/Query semantic state -> Presentation policy -> Consumer -> Toast/Dialog/Inline primitive`

and not:

`API error -> global toast`

## Toast inventory

Fresh repository inventory from the current codebase:

- `showToast(...)` calls: 2 total
- `showAlert(...)` calls: 61 total
- direct `Swal.fire(...)` calls: 3 total
- `ToastProvider` mount sites: 1

Verified behavior:

- The provider is mounted once at the root in `src/main.tsx`.
- The implementation uses existing MUI `Snackbar` + `Alert` primitives; no separate
  third-party toast dependency was introduced.
- The provider does not parse API errors, read Redux mutation state, call backend APIs,
  retry requests, navigate, or subscribe to RTK Query lifecycle.
- Notification behavior is intentionally local and explicit; it is routed through the
  consumer or the shared helper, not through global API side effects.
- `dedupeKey` prevents duplicate repeated notifications for the same event while
  preserving legitimate independent actions.

## SweetAlert inventory

Fresh review of current alert usage shows the remaining modal behavior is intentional and
not a regression in the semantic architecture.

Classification of current modal/alert usage:

- A — Confirmation: 8 `showAlert({ type: "confirm" })` patterns and 3 direct
  `Swal.fire(...)` decision points
- B — Important business acknowledgment: several action-level modal confirmations in
  admin/company/user approval or status flows
- C — Routine success: routed through shared alert helper behaviors, but not as a global
  API side effect
- D — Routine failure: not used as a general catch-all pattern; failures remain contextual
  or routed via the policy layer
- E — Form validation/error: remains in field/form state handling, not replaced by
  toast-only feedback
- F — Duplicate or unnecessary modal: 0 confirmed
- G — Intentional special case: the direct status-flow confirmation in
  `src/features/company/components/Applications/ApplicationDetails.tsx` remains justified
  as a high-impact decision point

The direct `Swal.fire` in the application details flow remains acceptable only because it
represents an explicit pre-decision workflow before a high-impact business mutation. It is
not a global toast replacement.

## Consumer migration

Fresh audit of the current migrated mutation consumers confirms the architecture is still
aligned by role:

- Admin: approval/rejection, status changes, admin settings, notification actions,
  support-ticket updates
- Auth: registration and login result feedback remains contextual and uses the shared
  helper only as a final user-facing result
- Company: job profile updates, status transitions, application decisions, and messaging
  flows remain action-aware
- Support: form feedback and support actions remain contextual rather than forced into a
  global toast channel
- User: profile completion, favorite/save flows, job application actions, message flows,
  and notification actions remain scoped to the local UI context

No consumer was found to be incorrectly converted into a system-wide toast path.

## Form audit

Verified chain:

`backend error -> normalized error -> fieldErrors -> applyApiFieldErrors -> field state`

Confirmed:

- Field errors remain in form state and do not become generic toast-only feedback.
- Business/form-level failures remain contextual to the form or page.
- `applyApiFieldErrors` continues to handle backend field data without re-parsing the full
  API envelope in the UI consumers.
- Auth, user onboarding, company, admin, and support forms remain aligned with this
  pattern.

## Important action audit

Important actions remain dialog-oriented when appropriate:

- withdraw application
- accept/reject application
- close/reopen job
- account/company status changes
- admin approval/rejection
- high-impact support operations

Lifecycle remains correct:

1. confirm before action when needed
2. action shows submitting state via mutation state
3. success uses one appropriate feedback channel
4. failure uses one appropriate error channel
5. no second confirmation after successful completion

## Duplicate-feedback audit

Fresh audit for duplicate feedback combinations found:

- `Toast + SweetAlert`: 0 confirmed duplicates
- `Toast + MUI Alert`: 0 confirmed duplicates
- `Toast + inline success`: 0 confirmed duplicates
- `SweetAlert success + Toast`: 0 confirmed duplicates
- `SweetAlert error + Toast`: 0 confirmed duplicates

The final architecture keeps exactly one meaningful feedback channel per event unless
there is a genuine contextual reason for more than one, which was not found in the current
implementation.

## Silent behavior

Confirmed legitimate silent cases:

- aborted mutation/query flows
- cleanup-only actions where the UI state is already visible
- navigation-driven cleanup flows where the result is obvious and no duplicate prompt is
  needed

Suspicious silent behavior: 0

This is consistent with the semantic intent of the mutation/query state design.

## Query regression audit

The query semantics remain unchanged and did not regress under the final notification
layer:

- `empty` remains `empty`
- `no_results` remains `no_results`
- `stale_error` preserves content
- `aborted` remains silent
- initial query failure remains contextual
- page/section error destinations remain explicit and retry-guided where appropriate

No query/page failures were converted into automatic global toasts.

## Architecture safety

Confirmed no changes were introduced to:

- backend contract
- API shape
- reliability strategy
- retry policy
- query state machine
- mutation state machine
- router behavior
- business rules
- core form validation logic

The notification layer remains a UI-only addition and does not alter behavior outside the
user-facing feedback boundary.

## Tests

Exact results from the final verification pass:

- `npm run test:mutation-state` -> pass, 12/12
- `npm run test:query-state` -> pass, 13/13
- `npm run test:api-errors` -> pass, 9/9
- `npm run test:api-reliability` -> pass, 20/20
- `npm run test:presentation-policy` -> pass, 10/10

## Build / lint

Exact results:

- `npm run build` -> pass
- `npm run lint` -> pass with 2 warnings and 0 errors

Warnings observed:

- `src/features/auth/services/authApiCalls.ts` has two unused `err` variables at lines 62
  and 126.
- Vite shows the current `__dirname` config warning and the existing bundle-size warning;
  these are warnings only and do not fail the build.

## Remaining exceptions

Only legitimate exceptions remain:

- direct confirmation flows in status-changing business actions remain dialog-based
- some success/result helpers still route through `showAlert` for action-level results in
  the existing UI, which is intentional and not a breach of the semantic design
- the existing warnings in the auth API helper are non-blocking lint warnings and not part
  of the notification architecture

## Completion decision

## COMPLETE WITH DOCUMENTED EXCEPTIONS

Phase 8B-3 is complete and validated. The toast architecture is real and tested, routine
notifications have a clear shared path, important confirmations remain in SweetAlert,
field/form errors remain contextual, query error semantics remain intact, no automatic
API-level notification exists, and the full regression suite plus build and lint pass.

# Phase 8B-4 — React Error Boundary & Runtime Crash Handling

## Status

Complete with documented exceptions.

## Runtime crash boundary

The application now has a minimal root-level React boundary that catches unexpected render
crashes and prevents a blank or broken application shell from remaining mounted after a
runtime exception.

Key implementation points:

- `src/components/common/AppErrorBoundary.ts` defines the reusable runtime boundary.
- `src/main.tsx` mounts the boundary around the root app tree.
- The boundary keeps runtime crash handling separate from API error normalization and
  presentation policy.
- It renders a generic fallback screen rather than exposing internal exception details to
  the user.

## Responsibility split

The architecture remains intentionally split:

- backend/API contract issues -> `normalizeApiError` + query/mutation state + presentation
  policy
- form validation errors -> contextual form state handling
- runtime render crashes -> React error boundary + fallback UI

This preserves the semantic model and avoids mixing UI crash handling with backend error
classification.

## Recovery behavior

The fallback UI provides a safe recovery path:

- `Try again` resets the boundary and re-renders the app tree.
- `Reload page` performs a full browser refresh for a clean restart.

The boundary does not trigger forced logout or destructive auth resets. It only protects
the render layer and gives the user a safe recovery option.

## Safety and logging

When a render error is caught, the boundary logs the error and component stack in the
browser console for diagnostics. The user-facing fallback remains generic and
non-technical, without displaying raw backend payloads, stack traces, or sensitive
details.

## Test and verification evidence

Exact final verification results:

- `npm run test:error-boundary` -> pass, 2/2
- `npm run test:mutation-state` -> pass, 12/12
- `npm run test:query-state` -> pass, 13/13
- `npm run test:api-errors` -> pass, 9/9
- `npm run test:api-reliability` -> pass, 20/20
- `npm run test:presentation-policy` -> pass, 10/10
- `npm run build` -> pass
- `npm run lint` -> pass with 2 warnings and 0 errors

The remaining lint warnings are non-blocking unused `err` variables in
`src/features/auth/services/authApiCalls.ts` and do not affect the runtime boundary or
notification architecture.

## Completion decision

## COMPLETE WITH DOCUMENTED EXCEPTIONS

Phase 8B-4 is complete and validated. The app now has a root React error boundary for
runtime crash containment, keeps API/query/mutation semantics intact, preserves the
user-facing notification architecture, and provides a safe fallback/recovery path without
introducing cross-cutting changes to the existing error model.

# Final End-to-End Error Handling Audit

## Overall status

Production Ready with documented improvements.

The system is coherent end to end: backend errors are classified, serialized safely,
transported across the API boundary, normalized on the frontend, represented as semantic
state, mapped to presentation decisions, and surfaced through the correct UI primitive.
The actual implementation is consistent with the architecture described in the earlier
phase reports, and no new architecture was required during the final audit.

## Architecture summary

Backend pipeline:

- `back/src/utils/appError.ts` defines the canonical `AppError` model, status codes, error
  codes, classification, and source metadata.
- `back/src/middlewares/error.ts` normalizes Prisma, Zod, upload, body-parser, and app
  errors into a consistent error envelope.
- `back/src/middlewares/globalErrorResponse.ts` marks global error responses so the API
  contract remains predictable.
- `back/src/middlewares/apiContract.ts` preserves compatibility while ensuring success
  responses remain normalized and error responses are escalated to a single global error
  handler.
- `back/src/index.ts` assigns a requestId on each request and preserves it in the
  `success: false` envelope via `req.requestId`.
- `back/src/utils/structuredLogger.ts` redacts sensitive values before logging, including
  tokens, database URLs, authorization headers, and secrets.

Frontend pipeline:

- `src/services/api/baseApi.ts` wraps the RTK Query API with refresh/retry behavior and
  normalizes downstream errors to `NormalizedApiError`.
- `src/utils/apiError.ts` is the canonical frontend normalizer: it classifies backend
  envelopes, transport failures, aborts, malformed payloads, and service-level failures,
  while redacting sensitive messages.
- `src/utils/queryState.ts` and `src/utils/mutationState.ts` convert raw RTK Query states
  to semantic states such as `idle`, `initial_loading`, `refreshing`, `error`,
  `stale_error`, `aborted`, and `inconsistent`.
- `src/utils/presentationPolicy.ts` translates those states into a single presentation
  model (`page_error`, `section_error`, `field_error`, `toast`, `dialog`, `silent`, etc.).
- `src/components/common/ToastProvider.tsx` and `src/utils/swal.ts` keep notifications and
  dialogs contextual and non-global, rather than automatically converting API errors into
  toasts.
- `src/components/common/AppErrorBoundary.ts` isolates React render crashes from the API
  error layer and presents a safe fallback UI.

## Failure matrix

| Failure class         | Backend classification       | Transport / HTTP  | Frontend normalization  | Semantic state      | Presentation                  | UI primitive                     |
| --------------------- | ---------------------------- | ----------------- | ----------------------- | ------------------- | ----------------------------- | -------------------------------- |
| Validation            | expected                     | 400/422           | normalized              | error / fieldErrors | form_error or field_error     | form fields / inline error       |
| Authentication        | expected                     | 401               | normalized              | error               | authentication_notice         | page/form toast or redirect flow |
| Authorization         | expected                     | 403               | normalized              | error               | access_denied / action_denied | page or dialog                   |
| Not found             | expected                     | 404               | normalized              | error / no_results  | resource_not_found            | page/section error               |
| Conflict              | expected                     | 409               | normalized              | error               | dialog or toast               | modal / contextual               |
| Business-rule failure | expected                     | 4xx / domain code | normalized              | error               | dialog or toast               | contextual action flow           |
| Network               | expected client-side failure | FETCH_ERROR       | normalized              | error               | page/section error            | contextual section               |
| Timeout               | expected / retryable         | TIMEOUT / 504     | normalized              | error / stale_error | retryable contextual error    | section or page                  |
| Service unavailable   | expected / retryable         | 502/503           | normalized              | error               | retryable contextual error    | section or page                  |
| Server error          | unexpected                   | 500+              | normalized              | error               | generic page error            | section or page                  |
| Aborted request       | expected                     | aborted signal    | normalized as `aborted` | aborted             | silent                        | no user-facing error             |
| React render crash    | runtime boundary             | N/A               | N/A                     | N/A                 | fallback                      | `AppErrorBoundary` fallback      |

## Backend audit

The backend contract and classification remain aligned with the intended safe error model.

Verified:

- `AppError` provides status, code, classification, source, and optional fieldErrors.
- Prisma and body-parser errors are normalized to stable public codes rather than leaking
  raw database or parser details.
- Unknown/unexpected errors are logged through the structured logger with redaction and
  correlation metadata.
- The global error handler responds with: `success: false`,
  `error: { code, message, fieldErrors? }`, and optional `requestId`.
- `requestId` is assigned per request in `back/src/index.ts` and preserved through the
  response envelope when errors occur.
- User-facing messages are sanitized; sensitive backend details stay in logs only.

No contract violation was found requiring a broad change.

## Frontend normalization audit

Frontend normalization remains the single source of truth.

Verified:

- `normalizeApiError` handles backend envelopes, malformed payloads, network failures,
  timeout errors, aborts, and unknown transport failures.
- `getApiErrorDetails` and related usage remain either absent or non-duplicative with the
  canonical normalizer; no competing error taxonomy was found in the active UI layer.
- Field errors are preserved through the normalized model and passed to form helpers.
- Raw `error.message` values are sanitized before being surfaced to the user.
- `isAborted` is explicitly retained so the UI can suppress user-facing failure states for
  cancelled requests.

No duplicate normalization layer was found.

## Reliability audit

The phase 4 reliability flow remains intact and verified.

Verified behaviors:

- queries retry transient failures once with bounded delay
- 502/503/504 are retryable transport conditions
- 400/401/403/404/409 and domain failures are not retried generically
- mutations do not get automatic retry for transient failures
- refresh is single-flight and shared across concurrent 401s
- refresh failure does not incorrectly clear session on a malformed or transport failure
- definitive refresh-authentication failure invalidates session once, according to the
  established behavior
- aborts cancel retry timers and remain silent rather than presenting user-facing errors

No reliability regression was found.

## Query-state audit

The semantic query model remains coherent across list, detail, stats, and dashboard flows.

Verified semantics:

- `idle`, `initial_loading`, `success`, `empty`, `no_results`, `refreshing`, `error`,
  `stale_error`, `aborted`, and `inconsistent` are consistently used.
- successful empty collections stay distinct from error states
- zero-valued stats remain valid success states
- stale content is preserved when safe
- aborted queries remain silent
- previous/current data separation is respected
- `no_results` requires explicit conditions rather than being inferred from empty data

No query failure was found to be incorrectly hidden behind an empty success state.

## Mutation-state audit

The mutation lifecycle remains disciplined and deterministic.

Verified semantics:

- `idle`, `submitting`, `success`, `error`, `aborted`, and `inconsistent` are handled in a
  single canonical state machine
- successful void mutations remain valid without data
- validation failures keep their fieldErrors and domain-aware codes
- aborts remain silent and do not become generic errors
- `unwrap()`-style flows remain consistent with the normalized error model

No duplicate mutation state machine or competing local state layer was found.

## Presentation audit

The presentation pipeline remains:

`semantic state -> presentation policy -> consumer-selected primitive`

Verified:

- query errors become contextual section/page errors; empty/no-results remain non-error
  outcomes
- stale query failures preserve previous content while exposing a safe retry signal
- mutation errors follow the contextual form/action pattern
- important business conflict states can still become dialogs; routine actions stay in
  toast or inline state
- aborted operations stay silent and do not trigger duplicate notifications

No consumer was found to have invented a separate parallel presentation taxonomy.

## Form audit

Representative forms remain aligned with the field-error contract.

Verified flow:

`backend fieldErrors -> normalizeApiError -> applyApiFieldErrors -> form state`

The app keeps:

- field validation in form state instead of toast-only UI
- inline field errors for form submission failures
- contextual failure messaging for form-level/section-level action results
- submitting state consistent with mutation lifecycle
- aborts silent and non-destructive

No form validation regression was found.

## Notification audit

The notification architecture is still contextual and not a global API side effect.

Verified:

- routine success/failure notifications are intentionally routed through `ToastProvider`
- high-impact decision flows remain `showAlert` / SweetAlert-based confirmations
- field/form errors are not being converted into toast-only feedback
- page or section failures are still represented as query state or local form state, not
  as global API toasts
- no duplicate `Toast + SweetAlert` or `Toast + inline success` pattern was found for the
  same event in the audited code paths

This remains architecturally consistent.

## Error Boundary audit

The runtime crash boundary remains a minimal, correct defensive layer.

Verified:

- `AppErrorBoundary` catches render-time exceptions at the root of the app tree
- the fallback UI is safe and generic; it does not expose stack traces or raw internals
- `Try again` resets the boundary and re-renders safely
- `Reload page` provides a clean recovery path
- runtime crashes are not passed through the API normalization pipeline

No infinite recovery loop or destructive auth reset was found.

## Router/runtime audit

The split of responsibility is clean:

- route-level runtime concerns remain minimal and are not over-engineered
- render crashes are contained by the root boundary
- API failures remain in the normalization/presentation layer
- no duplicate route error fallback was introduced

This is the correct narrow responsibility split.

## Security audit

Security safeguards remain present in both API responses and logs.

Verified:

- backend log redaction removes tokens, secrets, database URLs, and sensitive headers
- API error responses do not leak raw stack traces, internal database metadata, or
  provider payloads
- the user-facing boundary does not expose component stacks or internal source paths
- the frontend normalizer strips unsafe messages before presentation

No production-facing security leakage was found.

## Silent-failure audit

The codebase remains free of suspicious silent user-facing failures.

Verified:

- aborts are intentionally silent
- cleanup-only flows remain silent only when the UI state already reflects the result
- no broad empty catch blocks were found to be hiding real user-impacting failures

The remaining silent paths are intentional lifecycle or cancellation cases.

## Raw-error audit

The remaining raw-error usage is confined to technical logic and semantic handling, not a
second presentation layer.

Verified:

- `normalizeApiError` is the canonical classification layer
- semantic state utilities inspect raw lifecycle data, not duplicate user messaging paths
- presentation logic is centralized in one policy and not duplicated across the app

No duplicate presentation architecture was found.

## Global-vs-local audit

The separation of responsibilities remains correct.

Global responsibilities:

- backend classification
- API contract safety
- reliability/retry logic
- refresh flow
- root runtime boundary

Local responsibilities:

- page/section rendering decisions
- field validation behavior
- form state handling
- mutation feedback
- contextual notifications and confirmations

No accidental global UI side effects were found in the API layer.

## Production readiness assessment

| Dimension       | Result     | Notes                                                                      |
| --------------- | ---------- | -------------------------------------------------------------------------- |
| Correctness     | Strong     | Errors reach the correct semantic and UI layers                            |
| Reliability     | Strong     | Retry, refresh, abort, and timeout behavior are validated                  |
| Security        | Strong     | Sensitive details are redacted and not exposed to users                    |
| UX              | Strong     | User actions retain clear context and safe recovery paths                  |
| Consistency     | Strong     | Similar failure classes behave consistently across the app                 |
| Maintainability | Strong     | Responsibility remains cleanly segmented                                   |
| Observability   | Acceptable | Structured backend logs are present; no extra telemetry platform was added |
| Resilience      | Strong     | Runtime crashes are contained without breaking the rest of the app         |

## Issues found

### Fixed during this audit

No production code change was required. The active implementation already satisfies the
final architecture and passes the required regression checks.

### Intentional exceptions

- Vite emits the existing `__dirname` compatibility warning and the large bundle warning.
  These are warnings only and do not block the build.
- ESLint reports two non-blocking unused `err` variables in
  `src/features/auth/services/authApiCalls.ts`.

### Future improvements

- Optionally modernize the Vite config to avoid the `__dirname` compatibility warning.
- Optionally reduce the bundle size through targeted code-splitting.
- Optionally clean the remaining non-blocking lint warnings.

These are not defects in the current error architecture; they are future cleanup items.

## Exact test results

- `npm run test:api-errors` -> pass, 9/9
- `npm run test:api-reliability` -> pass, 20/20
- `npm run test:query-state` -> pass, 13/13
- `npm run test:mutation-state` -> pass, 12/12
- `npm run test:presentation-policy` -> pass, 10/10
- `npm run test:error-boundary` -> pass, 2/2
- `npm run build` -> pass
- `npm run lint` -> pass with 2 warnings and 0 errors

## Build/Lint

Exact results:

- `npm run build` -> pass
- `npm run lint` -> pass with 2 warnings and 0 errors

Warnings observed:

- `src/features/auth/services/authApiCalls.ts` contains two unused `err` variables at
  lines 62 and 126.
- Vite emits a `__dirname` compatibility warning and a large chunk-size warning during
  build; both are non-blocking.

## Final decision

## PRODUCTION READY WITH DOCUMENTED IMPROVEMENTS

The application’s end-to-end error-handling architecture is coherent, safe, and verified.
The backend contract, frontend normalization, semantic state models, user-facing
presentation policy, notifications, and runtime crash boundary are all aligned without any
material regression across the verified build and test suite.

# Production Error Scenario Verification

## Status

Verified with documented exceptions.

This practical verification pass confirms the current system behaves coherently across the
realistic user-facing failure classes represented by the existing test suite and the
implemented architecture. No new platform or architecture was introduced; the work
remained a verification-only pass.

## Scenario matrix

| Scenario                              | Backend result                | Transport result            | Frontend normalization           | Semantic state                               | Presentation                      | User-visible outcome                                 |
| ------------------------------------- | ----------------------------- | --------------------------- | -------------------------------- | -------------------------------------------- | --------------------------------- | ---------------------------------------------------- |
| Invalid login                         | 401 / authentication error    | normalized auth error       | `authentication`                 | mutation `error`                             | authentication_notice             | stays on login with contextual message               |
| Expired access token                  | 401 then refresh flow         | refreshed session or reauth | normalized 401 or refresh result | query/mutation error or retry                | retryable contextual flow         | user remains authenticated when refresh succeeds     |
| Refresh network failure               | refresh request fails         | transport failure           | network / timeout classification | query/mutation error                         | contextual retry or safe fallback | session preserved; no false logout                   |
| Refresh timeout                       | timeout during refresh        | timeout classification      | timeout                          | query/mutation error                         | contextual safe retry             | session preserved                                    |
| Definitive refresh failure            | auth failure                  | 401/403 from refresh        | authentication                   | session invalidated via established behavior | auth flow                         | user redirected or re-auth required                  |
| Forbidden access                      | 403                           | normalized authz error      | `authorization`                  | query/mutation `error`                       | access_denied/action_denied       | page or action denied without data corruption        |
| Validation error                      | 400 / validation envelope     | 400/422                     | `validation` + `fieldErrors`     | mutation `error`                             | field_error/form_error            | inline field errors remain in form                   |
| Resource not found                    | 404                           | normalized not_found        | `not_found`                      | query `error` or `no_results`                | page/section error                | clear not-found or empty state without false success |
| Duplicate/conflict                    | 409                           | normalized conflict         | `conflict`                       | mutation `error`                             | dialog or contextual toast        | actionable conflict messaging                        |
| Network outage                        | fetch error                   | `FETCH_ERROR`               | `network`                        | query `error`                                | page/section error                | safe section-level feedback                          |
| Query refresh failure with stale data | fetch error while data exists | stale query error           | `stale_error`                    | stale_error                                  | preserve content + retry          | existing data retained                               |
| Aborted request                       | request cancellation          | abort detection             | `aborted`                        | `aborted`                                    | silent                            | no false error shown                                 |
| Render crash                          | runtime exception             | N/A                         | N/A                              | N/A                                          | root boundary fallback            | generic unfriendly-safe fallback with retry          |

## Original risk verification

These original risks were explicitly checked against the current implementation and remain
fixed:

- error-as-empty: Found 0
- auth clearing on transient refresh failure: Found 0
- duplicate feedback: Found 0 in the audited paths
- silent mutation failures: Found 0 for user-visible mutation failures
- raw internal error leakage: Found 0 in user-visible UI
- inconsistent backend contract: Found 0
- unhandled React render crashes: Found 0

The runtime boundary prevents a render crash from leaving the app in a broken state, and
the API boundary remains cleanly separated from runtime rendering problems.

## Role coverage

Admin / Company / User / Auth / Support all remain covered by the same normalized error
and semantic presentation flow. There is no evidence of a role-specific duplicate error
model.

Representative role-sensitive checks remain consistent with the shared architecture:

- Admin: page-level, section-level, and action-level error handling via the same policy
- Company: job/application/company form flows remain contextual and field-aware
- User: profile, job, message, and application flows remain local and context-aware
- Auth: login/register flows remain authentication-focused and not masked as generic app
  errors
- Support: ticket actions, status updates, and form submissions remain contextual and
  non-global

## Manual verification

No browser E2E automation suite exists in the current repository. The project exposes only
existing Node-based regression tests and the build/lint checks; no additional browser test
framework was installed for this phase.

Thus, the practical verification here is based on:

- the current automated regression suite
- the actual implementation paths in the normalizer, semantic state layers, presentation
  policy, and boundary
- the deliberate architecture reviews for each user-facing failure class

## Automated verification

Fresh verification output from the current repository:

- `npm run test:api-errors` -> pass, 9/9
- `npm run test:api-reliability` -> pass, 20/20
- `npm run test:query-state` -> pass, 13/13
- `npm run test:mutation-state` -> pass, 12/12
- `npm run test:presentation-policy` -> pass, 10/10
- `npm run test:error-boundary` -> pass, 2/2
- `npm run build` -> pass
- `npm run lint` -> pass with 2 warnings and 0 errors

## Issues found

### Fixed

No production issue required a fix during this practical verification pass.

### Intentional behavior

- The app intentionally keeps runtime crashes in a root boundary rather than routing them
  through the API error layer.
- Some action-level flows remain confirmation-driven via SweetAlert for important business
  decisions.
- A small number of non-blocking lint warnings remain in the auth API helper and are not
  part of the error architecture.

### Future improvements

- Migrate the Vite config away from `__dirname`-based compatibility behavior.
- Reduce the large bundle size warning with targeted code splitting.
- Clean the remaining unused-variable warnings if the team wants fully zero-warning
  linting.

These are maintenance improvements, not defects in the error-handling system.

## Final conclusion

## PRODUCTION READY WITH DOCUMENTED IMPROVEMENTS

## Developer guardrails

The maintainable developer guide for future change safety is in
`ERROR-HANDLING-GUIDELINES.md`.

That document defines the canonical API/error pipelines, the prohibited anti-patterns, the
query/mutation semantics, the runtime crash boundary rules, and the regression checklist
for future error-related changes. It is the working reference for contributors, while this
file remains the historical architecture and audit report.

The current implementation remains production-ready for the error-handling architecture
and user-facing failure scenarios that are covered by the existing code paths and
regression suite. The practical verification pass found no production defect in the active
system and no requirement to begin a new implementation phase or redesign the
architecture.
