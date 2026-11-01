export const PERMISSION_DEFINITIONS = {
  VIEW_ADMIN_DASHBOARD: {
    resource: "ADMIN_DASHBOARD",
    action: "VIEW",
    description: "View the general admin dashboard",
  },
  VIEW_SUPPORT_DASHBOARD: {
    resource: "SUPPORT_DASHBOARD",
    action: "VIEW",
    description: "View the support admin dashboard",
  },
  VIEW_OPERATIONS_DASHBOARD: {
    resource: "OPERATIONS_DASHBOARD",
    action: "VIEW",
    description: "View the operations admin dashboard",
  },
  VIEW_SUPPORT: {
    resource: "SUPPORT",
    action: "VIEW",
    description: "View the support queue and ticket details",
  },
  VIEW_SUPPORT_TICKETS: {
    resource: "SUPPORT_TICKET",
    action: "VIEW",
    description: "View support tickets",
  },
  REPLY_SUPPORT_TICKETS: {
    resource: "SUPPORT_TICKET",
    action: "REPLY",
    description: "Reply to support tickets",
  },
  ASSIGN_SUPPORT_TICKET: {
    resource: "SUPPORT_TICKET",
    action: "ASSIGN",
    description: "Assign unassigned support tickets",
  },
  REASSIGN_SUPPORT_TICKET: {
    resource: "SUPPORT_TICKET",
    action: "REASSIGN",
    description: "Reassign support tickets",
  },
  CLOSE_SUPPORT_TICKET: {
    resource: "SUPPORT_TICKET",
    action: "CLOSE",
    description: "Close resolved support tickets",
  },
  REPLY_SUPPORT: {
    resource: "SUPPORT",
    action: "REPLY",
    description: "Reply to support tickets",
  },
  CHANGE_SUPPORT_PRIORITY: {
    resource: "SUPPORT",
    action: "CHANGE_PRIORITY",
    description: "Change support ticket priority",
  },
  ASSIGN_SUPPORT: {
    resource: "SUPPORT",
    action: "ASSIGN",
    description: "Assign unassigned support tickets",
  },
  REASSIGN_SUPPORT: {
    resource: "SUPPORT",
    action: "REASSIGN",
    description: "Reassign support tickets",
  },
  CHANGE_SUPPORT_STATUS: {
    resource: "SUPPORT",
    action: "CHANGE_STATUS",
    description: "Change support ticket status",
  },
  CLOSE_SUPPORT: {
    resource: "SUPPORT",
    action: "CLOSE",
    description: "Close support tickets",
  },
  VIEW_USERS: {
    resource: "USERS",
    action: "VIEW",
    description: "View users",
  },
  VIEW_USER_DETAILS: {
    resource: "USERS",
    action: "VIEW_DETAILS",
    description: "View user details",
  },
  EDIT_USERS: {
    resource: "USERS",
    action: "EDIT",
    description: "Edit users",
  },
  SUSPEND_USERS: {
    resource: "USERS",
    action: "SUSPEND",
    description: "Suspend users",
  },
  DELETE_USERS: {
    resource: "USERS",
    action: "DELETE",
    description: "Delete users",
  },
  VIEW_COMPANIES: {
    resource: "COMPANIES",
    action: "VIEW",
    description: "View companies",
  },
  VIEW_COMPANY_DETAILS: {
    resource: "COMPANIES",
    action: "VIEW_DETAILS",
    description: "View company details",
  },
  EDIT_COMPANIES: {
    resource: "COMPANIES",
    action: "EDIT",
    description: "Edit companies",
  },
  SUSPEND_COMPANIES: {
    resource: "COMPANIES",
    action: "SUSPEND",
    description: "Suspend companies",
  },
  DELETE_COMPANIES: {
    resource: "COMPANIES",
    action: "DELETE",
    description: "Delete companies",
  },
  VIEW_JOBS: {
    resource: "JOBS",
    action: "VIEW",
    description: "View jobs",
  },
  CREATE_JOBS: {
    resource: "JOBS",
    action: "CREATE",
    description: "Create jobs",
  },
  EDIT_JOBS: {
    resource: "JOBS",
    action: "EDIT",
    description: "Edit jobs",
  },
  DELETE_JOBS: {
    resource: "JOBS",
    action: "DELETE",
    description: "Delete jobs",
  },
  APPROVE_JOBS: {
    resource: "JOBS",
    action: "APPROVE",
    description: "Approve jobs",
  },
  REJECT_JOBS: {
    resource: "JOBS",
    action: "REJECT",
    description: "Reject jobs",
  },
  VIEW_APPLICATIONS: {
    resource: "APPLICATIONS",
    action: "VIEW",
    description: "View applications",
  },
  UPDATE_APPLICATION_STATUS: {
    resource: "APPLICATIONS",
    action: "UPDATE_STATUS",
    description: "Update application status",
  },
  VIEW_ADMINS: {
    resource: "ADMIN_MANAGEMENT",
    action: "VIEW",
    description: "View administrators",
  },
  CREATE_ADMIN: {
    resource: "ADMIN_MANAGEMENT",
    action: "CREATE",
    description: "Create administrators",
  },
  EDIT_ADMIN: {
    resource: "ADMIN_MANAGEMENT",
    action: "EDIT",
    description: "Edit administrators",
  },
  DISABLE_ADMIN: {
    resource: "ADMIN_MANAGEMENT",
    action: "DISABLE",
    description: "Disable administrators",
  },
  ASSIGN_ADMIN_ROLE: {
    resource: "ADMIN_MANAGEMENT",
    action: "ASSIGN_ROLE",
    description: "Assign administrator roles",
  },
  MANAGE_ADMIN_PERMISSIONS: {
    resource: "ADMIN_MANAGEMENT",
    action: "MANAGE_PERMISSIONS",
    description: "Manage administrator permissions",
  },
  VIEW_AUDIT_LOG: {
    resource: "AUDIT",
    action: "VIEW",
    description: "View audit logs",
  },
  DEMO_ADMIN_READ_ONLY: {
    resource: "DEMO_ADMIN",
    action: "READ_ONLY",
    description: "Identifies the restricted demo administrator experience",
  },
} as const;

export const PERMISSIONS = Object.fromEntries(
  Object.keys(PERMISSION_DEFINITIONS).map((key) => [key, key])
) as { [K in keyof typeof PERMISSION_DEFINITIONS]: K };

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ADMIN_ROLE_NAMES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SUPPORT_ADMIN: "SUPPORT_ADMIN",
  OPERATIONS_ADMIN: "OPERATIONS_ADMIN",
  DEMO_ADMIN: "DEMO_ADMIN",
} as const;

export type AdminRoleName =
  (typeof ADMIN_ROLE_NAMES)[keyof typeof ADMIN_ROLE_NAMES];

const SUPER_ADMIN_PERMISSIONS = [
  PERMISSIONS.VIEW_ADMIN_DASHBOARD,
  PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
  PERMISSIONS.VIEW_OPERATIONS_DASHBOARD,
  PERMISSIONS.VIEW_SUPPORT,
  PERMISSIONS.VIEW_SUPPORT_TICKETS,
  PERMISSIONS.REPLY_SUPPORT_TICKETS,
  PERMISSIONS.ASSIGN_SUPPORT_TICKET,
  PERMISSIONS.REASSIGN_SUPPORT_TICKET,
  PERMISSIONS.CLOSE_SUPPORT_TICKET,
  PERMISSIONS.REPLY_SUPPORT,
  PERMISSIONS.CHANGE_SUPPORT_PRIORITY,
  PERMISSIONS.ASSIGN_SUPPORT,
  PERMISSIONS.REASSIGN_SUPPORT,
  PERMISSIONS.CHANGE_SUPPORT_STATUS,
  PERMISSIONS.CLOSE_SUPPORT,
  PERMISSIONS.VIEW_USERS,
  PERMISSIONS.VIEW_USER_DETAILS,
  PERMISSIONS.EDIT_USERS,
  PERMISSIONS.SUSPEND_USERS,
  PERMISSIONS.DELETE_USERS,
  PERMISSIONS.VIEW_COMPANIES,
  PERMISSIONS.VIEW_COMPANY_DETAILS,
  PERMISSIONS.EDIT_COMPANIES,
  PERMISSIONS.SUSPEND_COMPANIES,
  PERMISSIONS.DELETE_COMPANIES,
  PERMISSIONS.VIEW_JOBS,
  PERMISSIONS.CREATE_JOBS,
  PERMISSIONS.EDIT_JOBS,
  PERMISSIONS.DELETE_JOBS,
  PERMISSIONS.APPROVE_JOBS,
  PERMISSIONS.REJECT_JOBS,
  PERMISSIONS.VIEW_APPLICATIONS,
  PERMISSIONS.UPDATE_APPLICATION_STATUS,
  PERMISSIONS.VIEW_ADMINS,
  PERMISSIONS.CREATE_ADMIN,
  PERMISSIONS.EDIT_ADMIN,
  PERMISSIONS.DISABLE_ADMIN,
  PERMISSIONS.ASSIGN_ADMIN_ROLE,
  PERMISSIONS.MANAGE_ADMIN_PERMISSIONS,
  PERMISSIONS.VIEW_AUDIT_LOG,
] as const satisfies readonly PermissionCode[];

const SUPPORT_ADMIN_PERMISSIONS = [
  PERMISSIONS.VIEW_ADMIN_DASHBOARD,
  PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
  PERMISSIONS.VIEW_SUPPORT,
  PERMISSIONS.VIEW_SUPPORT_TICKETS,
  PERMISSIONS.REPLY_SUPPORT_TICKETS,
  PERMISSIONS.ASSIGN_SUPPORT_TICKET,
  PERMISSIONS.REASSIGN_SUPPORT_TICKET,
  PERMISSIONS.CLOSE_SUPPORT_TICKET,
  PERMISSIONS.REPLY_SUPPORT,
  PERMISSIONS.CHANGE_SUPPORT_PRIORITY,
  PERMISSIONS.ASSIGN_SUPPORT,
  PERMISSIONS.REASSIGN_SUPPORT,
  PERMISSIONS.CHANGE_SUPPORT_STATUS,
  PERMISSIONS.CLOSE_SUPPORT,
] as const satisfies readonly PermissionCode[];

const OPERATIONS_ADMIN_PERMISSIONS = [
  PERMISSIONS.VIEW_ADMIN_DASHBOARD,
  PERMISSIONS.VIEW_OPERATIONS_DASHBOARD,
  PERMISSIONS.VIEW_USERS,
  PERMISSIONS.VIEW_USER_DETAILS,
  PERMISSIONS.EDIT_USERS,
  PERMISSIONS.SUSPEND_USERS,
  PERMISSIONS.DELETE_USERS,
  PERMISSIONS.VIEW_COMPANIES,
  PERMISSIONS.VIEW_COMPANY_DETAILS,
  PERMISSIONS.EDIT_COMPANIES,
  PERMISSIONS.SUSPEND_COMPANIES,
  PERMISSIONS.DELETE_COMPANIES,
  PERMISSIONS.VIEW_JOBS,
  PERMISSIONS.CREATE_JOBS,
  PERMISSIONS.EDIT_JOBS,
  PERMISSIONS.DELETE_JOBS,
  PERMISSIONS.APPROVE_JOBS,
  PERMISSIONS.REJECT_JOBS,
  PERMISSIONS.VIEW_APPLICATIONS,
  PERMISSIONS.UPDATE_APPLICATION_STATUS,
] as const satisfies readonly PermissionCode[];

export const ADMIN_ROLE_DEFINITIONS = {
  SUPER_ADMIN: {
    name: ADMIN_ROLE_NAMES.SUPER_ADMIN,
    description: "Full administrative access",
    permissions: SUPER_ADMIN_PERMISSIONS,
  },
  SUPPORT_ADMIN: {
    name: ADMIN_ROLE_NAMES.SUPPORT_ADMIN,
    description: "Support queue and conversation access",
    permissions: SUPPORT_ADMIN_PERMISSIONS,
  },
  OPERATIONS_ADMIN: {
    name: ADMIN_ROLE_NAMES.OPERATIONS_ADMIN,
    description:
      "Operations access for users, companies, jobs, and applications",
    permissions: OPERATIONS_ADMIN_PERMISSIONS,
  },
  DEMO_ADMIN: {
    name: ADMIN_ROLE_NAMES.DEMO_ADMIN,
    description: "Read-only access to explicitly scoped demo records",
    permissions: [
      PERMISSIONS.DEMO_ADMIN_READ_ONLY,
      PERMISSIONS.VIEW_ADMIN_DASHBOARD,
      PERMISSIONS.VIEW_OPERATIONS_DASHBOARD,
      PERMISSIONS.VIEW_SUPPORT_DASHBOARD,
      PERMISSIONS.VIEW_SUPPORT,
      PERMISSIONS.VIEW_SUPPORT_TICKETS,
      PERMISSIONS.VIEW_USERS,
      PERMISSIONS.VIEW_USER_DETAILS,
      PERMISSIONS.VIEW_COMPANIES,
      PERMISSIONS.VIEW_COMPANY_DETAILS,
      PERMISSIONS.VIEW_JOBS,
      PERMISSIONS.VIEW_APPLICATIONS,
      PERMISSIONS.VIEW_AUDIT_LOG,
    ] as const satisfies readonly PermissionCode[],
  },
} as const satisfies Record<
  AdminRoleName,
  {
    name: string;
    description: string;
    permissions: readonly PermissionCode[];
  }
>;

export const DEMO_ADMIN_READ_PERMISSION_CODES = [
  ...ADMIN_ROLE_DEFINITIONS.DEMO_ADMIN.permissions,
] as const satisfies readonly PermissionCode[];
