import { prisma } from "../../config/db.js";
import {
  assertPermission,
  getUserPermissions,
} from "../../authorization/permission.service.js";
import { PERMISSIONS } from "../../authorization/permissions.js";

export const getAdminDashboard = async (actorUserId: string) => {
  await assertPermission(actorUserId, PERMISSIONS.VIEW_ADMIN_DASHBOARD);
  const permissions = new Set(await getUserPermissions(actorUserId));
  const can = (permission: (typeof PERMISSIONS)[keyof typeof PERMISSIONS]) =>
    permissions.has(permission);

  const [
    totalCompanies,
    totalUsers,
    totalJobs,
    totalApplications,
    totalSupportTickets,
    openSupportTickets,
    companyRequests,
    latestJobs,
    topCompaniesByJobs,
    topJobsByApplications,
  ] = await Promise.all([
    can(PERMISSIONS.VIEW_COMPANIES) ? prisma.company.count() : 0,
    can(PERMISSIONS.VIEW_USERS)
      ? prisma.user.count({ where: { role: "USER" } })
      : 0,
    can(PERMISSIONS.VIEW_JOBS) ? prisma.job.count() : 0,
    can(PERMISSIONS.VIEW_APPLICATIONS) ? prisma.application.count() : 0,
    can(PERMISSIONS.VIEW_SUPPORT) ? prisma.supportTicket.count() : 0,
    can(PERMISSIONS.VIEW_SUPPORT)
      ? prisma.supportTicket.count({ where: { status: "OPEN" } })
      : 0,
    can(PERMISSIONS.VIEW_COMPANIES)
      ? prisma.company.findMany({
          where: { approvalStatus: "PENDING" },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            companyName: true,
            slug: true,
            email: true,
            logoUrl: true,
            location: true,
            status: true,
            approvalStatus: true,
            createdAt: true,
          },
        })
      : [],
    can(PERMISSIONS.VIEW_JOBS)
      ? prisma.job.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            createdAt: true,
            company: {
              select: {
                id: true,
                companyName: true,
                slug: true,
                logoUrl: true,
              },
            },
            _count: { select: { applications: true } },
          },
        })
      : [],
    can(PERMISSIONS.VIEW_COMPANIES)
      ? prisma.company.findMany({
          orderBy: { jobs: { _count: "desc" } },
          take: 5,
          select: {
            id: true,
            companyName: true,
            slug: true,
            logoUrl: true,
            status: true,
            approvalStatus: true,
            _count: { select: { jobs: true } },
          },
        })
      : [],
    can(PERMISSIONS.VIEW_JOBS) && can(PERMISSIONS.VIEW_APPLICATIONS)
      ? prisma.job.findMany({
          orderBy: { applications: { _count: "desc" } },
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            createdAt: true,
            company: {
              select: {
                id: true,
                companyName: true,
                slug: true,
                logoUrl: true,
              },
            },
            _count: { select: { applications: true } },
          },
        })
      : [],
  ]);

  return {
    stats: {
      totalCompanies,
      totalUsers,
      totalJobs,
      totalApplications,
      totalSupportTickets,
      openSupportTickets,
    },
    companyRequests,
    latestJobs,
    topCompaniesByJobs,
    topJobsByApplications,
  };
};

export const getOperationsDashboard = async (actorUserId: string) => {
  await assertPermission(actorUserId, PERMISSIONS.VIEW_OPERATIONS_DASHBOARD);
  const permissions = new Set(await getUserPermissions(actorUserId));

  const [users, companies, jobs, applications] = await Promise.all([
    permissions.has(PERMISSIONS.VIEW_USERS)
      ? prisma.user.count({ where: { role: "USER" } })
      : 0,
    permissions.has(PERMISSIONS.VIEW_COMPANIES) ? prisma.company.count() : 0,
    permissions.has(PERMISSIONS.VIEW_JOBS) ? prisma.job.count() : 0,
    permissions.has(PERMISSIONS.VIEW_APPLICATIONS)
      ? prisma.application.count()
      : 0,
  ]);

  return { users, companies, jobs, applications };
};
