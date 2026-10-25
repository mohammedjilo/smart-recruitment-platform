import Express from "express";
import { onlyAdminMiddleware } from "../middlewares/auth";
import {
  requireAnyPermission,
  requirePermission,
} from "../middlewares/permissions.js";
import { PERMISSIONS } from "../authorization/permissions.js";
import { validate } from "../middlewares/validate";
import {
  approveCompanyController,
  getAllCompaniesController,
  getCompanyByAdminController,
  getCompanyRequestsController,
  rejectCompanyController,
  updateCompanyStatusController,
} from "../controllers/admin/adminCompanyControllers";
import {
  getAllJobsController,
  getCompanyJobsByAdminController,
  getJobApplicationsByAdminController,
  getJobByAdminController,
  getQuestionsByAdminController,
  updateJobStatusController,
} from "../controllers/admin/adminJobControllers";
import {
  getAllUsersController,
  getUserByAdminController,
  updateUserStatusController,
} from "../controllers/admin/adminUserControllers";
import {
  getApplicationByAdminController,
  getApplicationsByAdminController,
  getCompanyApplicationsByAdminController,
  getProfileSnapshotByAdminController,
} from "../controllers/admin/adminApplicationControllers";
import {
  getAdminDashboardController,
  getOperationsDashboardController,
} from "../controllers/admin/adminDashboardControllers";
import {
  getCompanyRequestsQuerySchema,
  getCompanyJobsQuerySchema,
  getAdminJobsQuerySchema,
  getJobApplicationsQuerySchema,
  getAdminApplicationsQuerySchema,
  getAdminCompanyApplicationsQuerySchema,
  getAdminUsersQuerySchema,
  getAllCompaniesQuerySchema,
  rejectCompanySchema,
  updateCompanyStatusSchema,
  updateJobStatusSchema,
  updateUserStatusSchema,
} from "../validation/admin.validation";
import {
  assignAdminRoleSchema,
  updateAdminStatusSchema,
} from "../validation/adminAuthorization.validation.js";
import { createAdminSchema } from "../validation/adminCreation.validation.js";
import {
  assignAdminRoleController,
  createAdminController,
  getAdminAuthorizationController,
  getCurrentAdminPermissionsController,
  listAdminRolesController,
  listAdminsController,
  updateAdminStatusController,
} from "../controllers/adminAuthorizationControllers.js";
import { getAdminUserProfessionalProfileController } from "../controllers/adminUserDetailsControllers.js";

const adminRouter = Express.Router();

adminRouter.use(onlyAdminMiddleware);

adminRouter.get(
  "/dashboard",
  requirePermission(PERMISSIONS.VIEW_ADMIN_DASHBOARD),
  getAdminDashboardController
);
adminRouter.get(
  "/operations/dashboard",
  requirePermission(PERMISSIONS.VIEW_OPERATIONS_DASHBOARD),
  getOperationsDashboardController
);
adminRouter.get("/me/permissions", getCurrentAdminPermissionsController);
adminRouter.post(
  "/admins",
  requirePermission(PERMISSIONS.CREATE_ADMIN),
  validate(createAdminSchema),
  createAdminController
);
adminRouter.get(
  "/admins",
  requireAnyPermission([
    PERMISSIONS.VIEW_ADMINS,
    PERMISSIONS.ASSIGN_SUPPORT,
    PERMISSIONS.REASSIGN_SUPPORT,
  ]),
  listAdminsController
);
adminRouter.get(
  "/admins/:userId/permissions",
  requirePermission(PERMISSIONS.VIEW_ADMINS),
  getAdminAuthorizationController
);
adminRouter.get(
  "/roles",
  requirePermission(PERMISSIONS.VIEW_ADMINS),
  listAdminRolesController
);
adminRouter.patch(
  "/admins/:userId/role",
  requirePermission(PERMISSIONS.ASSIGN_ADMIN_ROLE),
  validate(assignAdminRoleSchema),
  assignAdminRoleController
);
adminRouter.patch(
  "/admins/:userId/status",
  requirePermission(PERMISSIONS.DISABLE_ADMIN),
  validate(updateAdminStatusSchema),
  updateAdminStatusController
);
adminRouter.get(
  "/users",
  requirePermission(PERMISSIONS.VIEW_USERS),
  validate(getAdminUsersQuerySchema, "query"),
  getAllUsersController
);
adminRouter.get(
  "/users/:userId",
  requirePermission(PERMISSIONS.VIEW_USER_DETAILS),
  getUserByAdminController
);
adminRouter.get(
  "/users/:userId/professional-profile",
  requirePermission(PERMISSIONS.VIEW_USER_DETAILS),
  getAdminUserProfessionalProfileController
);
adminRouter.patch(
  "/users/:userId/status",
  requirePermission(PERMISSIONS.SUSPEND_USERS),
  validate(updateUserStatusSchema),
  updateUserStatusController
);

adminRouter.get(
  "/companies",
  requirePermission(PERMISSIONS.VIEW_COMPANIES),
  validate(getAllCompaniesQuerySchema, "query"),
  getAllCompaniesController
);
adminRouter.get(
  "/company-requests",
  requirePermission(PERMISSIONS.VIEW_COMPANIES),
  validate(getCompanyRequestsQuerySchema, "query"),
  getCompanyRequestsController
);
adminRouter.get(
  "/companies/:companyId",
  requirePermission(PERMISSIONS.VIEW_COMPANY_DETAILS),
  getCompanyByAdminController
);
adminRouter.patch(
  "/companies/:companyId/approve",
  requirePermission(PERMISSIONS.EDIT_COMPANIES),
  approveCompanyController
);
adminRouter.patch(
  "/companies/:companyId/reject",
  requirePermission(PERMISSIONS.SUSPEND_COMPANIES),
  validate(rejectCompanySchema),
  rejectCompanyController
);
adminRouter.patch(
  "/companies/:companyId/status",
  requirePermission(PERMISSIONS.SUSPEND_COMPANIES),
  validate(updateCompanyStatusSchema),
  updateCompanyStatusController
);
adminRouter.get(
  "/companies/:companyId/jobs",
  requirePermission(PERMISSIONS.VIEW_JOBS),
  validate(getCompanyJobsQuerySchema, "query"),
  getCompanyJobsByAdminController
);
adminRouter.get(
  "/companies/:companyId/applications",
  requirePermission(PERMISSIONS.VIEW_APPLICATIONS),
  validate(getAdminCompanyApplicationsQuerySchema, "query"),
  getCompanyApplicationsByAdminController
);

adminRouter.get(
  "/jobs",
  requirePermission(PERMISSIONS.VIEW_JOBS),
  validate(getAdminJobsQuerySchema, "query"),
  getAllJobsController
);
adminRouter.get(
  "/jobs/:jobId",
  requirePermission(PERMISSIONS.VIEW_JOBS),
  getJobByAdminController
);
adminRouter.get(
  "/jobs/:jobId/questions",
  requirePermission(PERMISSIONS.VIEW_JOBS),
  getQuestionsByAdminController
);
adminRouter.get(
  "/jobs/:jobId/applications",
  requirePermission(PERMISSIONS.VIEW_APPLICATIONS),
  validate(getJobApplicationsQuerySchema, "query"),
  getJobApplicationsByAdminController
);
adminRouter.get(
  "/applications",
  requirePermission(PERMISSIONS.VIEW_APPLICATIONS),
  validate(getAdminApplicationsQuerySchema, "query"),
  getApplicationsByAdminController
);
adminRouter.get(
  "/applications/:applicationId",
  requirePermission(PERMISSIONS.VIEW_APPLICATIONS),
  getApplicationByAdminController
);
adminRouter.get(
  "/applications/:applicationId/profile-snapshot",
  requirePermission(PERMISSIONS.VIEW_APPLICATIONS),
  getProfileSnapshotByAdminController
);
adminRouter.patch(
  "/jobs/:jobId/status",
  requirePermission(PERMISSIONS.EDIT_JOBS),
  validate(updateJobStatusSchema),
  updateJobStatusController
);
export default adminRouter;
