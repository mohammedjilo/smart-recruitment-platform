# نظام حماية Routes (Route Protection System)

## نظرة عامة

تم إنشاء نظام حماية شامل للـ routes يضمن أن كل نوع مستخدم (Admin, User, Company) لا يستطيع
الوصول إلى routes الأنواع الأخرى.

## المكونات الرئيسية

### 1. AdminGuard

**الملف**: `AdminGuard.tsx`

يحمي جميع routes الـ Admin (يبدأ بـ `/admin`)

**القواعد**:

- ✅ يسمح: المستخدمون بـ `role: "admin"`
- ❌ يمنع: أي مستخدم عادي (`role: "user"`)
- ❌ يمنع: أي شركة (`company`)

**الإعادة التوجيه**:

- إذا كان المستخدم `company` → يذهب إلى `/dashboard`
- إذا كان المستخدم غير مصرح → يذهب إلى `/login`

### 2. UserGuard

**الملف**: `UserGuard.tsx`

يحمي جميع routes المستخدمين العاديين (مثل `/jobs`, `/applications`, `/saved-jobs`)

**القواعل**:

- ✅ يسمح: المستخدمون بـ `role: "user"` فقط
- ❌ يمنع: المستخدمون بـ `role: "admin"`
- ❌ يمنع: أي شركة (`company`)

**الإعادة التوجيه**:

- إذا كان المستخدم `company` → يذهب إلى `/dashboard`
- إذا كان المستخدم غير مصرح → يذهب إلى `/login`

### 3. CompanyGuard

**الملف**: `CompanyGuard.tsx`

يحمي جميع routes الشركات (مثل `/company/jobs`, `/create-job`, `/company-profile`)

**القواعد**:

- ✅ يسمح: الشركات فقط
- ❌ يمنع: أي مستخدم (حتى لو كان `admin`)
- ❌ يمنع: المستخدمون العاديون

**الإعادة التوجيه**:

- إذا كان المستخدم `user` → يذهب إلى `/dashboard`
- إذا كان المستخدم غير مصرح → يذهب إلى `/login`

## بنية الـ Routes المحمية

```
Routes الـ Admin (محمية بـ AdminGuard)
├── /admin
├── /admin/company-requests
├── /admin/companies
├── /admin/companies/:id
├── /admin/jobs
└── /admin/jobs/:id/:slug

Routes المستخدمين (محمية بـ UserGuard)
├── /profile/complete
├── /applications
├── /jobs
├── /jobs/:id/:slug
└── /saved-jobs

Routes الشركات (محمية بـ CompanyGuard)
├── /company/jobs
├── /company/applications
├── /company-profile
├── /company/profile/edit
├── /company/jobs/:id/:slug
├── /create-job
└── /company/jobs/:id/:slug/edit

Routes المتاحة للجميع (بدون حماية)
├── /login
├── /register
├── /register/user
├── /register/company
└── /dashboard (يوجهك إلى المكان الصحيح بناءً على النوع)
```

## جدول الوصول

| Route               | Admin | User | Company | الحالة               |
| ------------------- | ----- | ---- | ------- | -------------------- |
| `/admin/*`          | ✅    | ❌   | ❌      | محمي بـ AdminGuard   |
| `/profile/complete` | ❌    | ✅   | ❌      | محمي بـ UserGuard    |
| `/jobs/*`           | ❌    | ✅   | ❌      | محمي بـ UserGuard    |
| `/applications`     | ❌    | ✅   | ❌      | محمي بـ UserGuard    |
| `/company/*`        | ❌    | ❌   | ✅      | محمي بـ CompanyGuard |
| `/create-job`       | ❌    | ❌   | ✅      | محمي بـ CompanyGuard |
| `/login`            | ✅    | ✅   | ✅      | متاح للجميع          |
| `/register*`        | ✅    | ✅   | ✅      | متاح للجميع          |

## آلية العمل

### مثال 1: محاولة Admin الوصول إلى routes الـ Company

```
1. Admin يحاول فتح /company/jobs
2. CompanyGuard يتحقق:
   - هل هناك user معرّف؟ نعم → قطع الوصول
3. Admin يتم توجيهه إلى /dashboard
```

### مثال 2: محاولة User الوصول إلى routes الـ Admin

```
1. User يحاول فتح /admin
2. AdminGuard يتحقق:
   - هل هناك company معرّف؟ لا
   - هل user موجود وبـ role "admin"؟ لا
3. User يتم توجيهه إلى /login
```

### مثال 3: محاولة Company الوصول إلى routes الـ User

```
1. Company يحاول فتح /jobs
2. UserGuard يتحقق:
   - هل هناك company معرّف؟ نعم → قطع الوصول
3. Company يتم توجيهه إلى /dashboard
```

## الحالات الخاصة

### ProfileCompletionGuard

- هذا الـ Guard موجود بالفعل ولا يتعارض مع النظام الجديد
- يحمي routes المستخدمين بشرط التأكد من اكتمال ملفهم الشخصي
- يتم تطبيقه بعد `UserGuard` على الـ routes التي تحتاجه

### DashboardRouter

- `/dashboard` يعيد توجيه المستخدم إلى المكان الصحيح:
   - Admin → `/admin`
   - Company → `/company/jobs`
   - User → `/dashboard` (يعرض UserDashboard)
   - غير مسجل → `/login`

## الأمان والحماية

✅ **المميزات**:

1. حماية من جانب الـ Frontend
2. التحقق من البيانات المخزنة في Redux
3. التعامل مع جميع الحالات الحدية
4. توجيه آمن للمستخدمين غير المصرحين

⚠️ **ملاحظات مهمة**:

1. هذا النظام يوفر **حماية Frontend فقط**
2. يجب تطبيق **حماية Backend** أيضاً
3. تأكد من التحقق من الـ Token والـ Role في API

## كيفية التوسع

إذا كنت تريد إضافة نوع مستخدم جديد:

1. أنشئ Guard جديد مثل `ModeratorGuard.tsx`
2. أضف الـ Guard إلى `App.tsx`
3. أضف Routes جديدة تحت الـ Guard الجديد
4. تأكد من تحديث جدول الوصول

## الملفات المتعلقة

- `src/routes/guards/AdminGuard.tsx`
- `src/routes/guards/UserGuard.tsx`
- `src/routes/guards/CompanyGuard.tsx`
- `src/routes/guards/ProfileCompletionGuard.tsx`
- `src/routes/AppRoutes.tsx`
- `src/redux/slices/authSlice.ts`
