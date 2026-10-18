import { AccountStatus, CompanyApprovalStatus, Role } from "@prisma/client";

declare global {
  namespace Express {
    interface AuthUser {
      id: string;
      role: Role;
      accountStatus: AccountStatus;
    }

    interface AuthCompany {
      id: string;
      status: AccountStatus;
      approvalStatus: CompanyApprovalStatus;
    }

    interface Request {
      user?: AuthUser;
      company?: AuthCompany;
      supportOnlyAccountType?: "user" | "company";
      requestId?: string;
    }
  }
}

export {};
