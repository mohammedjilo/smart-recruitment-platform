import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import CompanyLayout from "@/layouts/CompanyLayout"
import CompanyGuard from "@/routes/guards/CompanyGuard"
import RoutePage from "../RoutePage"

const CreateJob = lazy(() => import("@/features/company/pages/CreateJobPage"))
const EditJob = lazy(() => import("@/features/company/pages/EditJobPage"))
const MyJobs = lazy(() => import("@/features/company/pages/MyJobsPage"))
const CompanyJobDetails = lazy(
   () => import("@/features/company/pages/JobDetailsPage")
)
const CompanyApplications = lazy(
   () => import("@/features/company/pages/ApplicationsPage")
)
const CompanyUsers = lazy(() => import("@/features/company/pages/UsersPage"))
const CompanyProfile = lazy(
   () => import("@/features/company/pages/CompanyProfilePage")
)
const CompanyNotifications = lazy(
   () => import("@/features/company/pages/NotificationsPage")
)
const CompanyMessages = lazy(() => import("@/features/company/pages/MessagesPage"))
const CandidateProfile = lazy(
   () => import("@/features/company/pages/CandidateProfilePage")
)
const EditCompanyProfile = lazy(
   () => import("@/features/company/pages/EditCompanyProfilePage")
)
const CompanySupportHelp = lazy(
   () => import("@/features/company/pages/SupportHelpPage")
)
const CompanySupportTopic = lazy(
   () => import("@/features/company/pages/CompanySupportTopicPage")
)
const CompanySupportArticle = lazy(
   () => import("@/features/company/pages/CompanySupportArticlePage")
)
const SupportRequestCreatePage = lazy(
   () => import("@/features/support/pages/SupportRequestCreatePage")
)
const SupportRequestDetailsPage = lazy(
   () => import("@/features/support/pages/SupportRequestDetailsPage")
)
const AboutPage = lazy(() => import("@/features/shared/pages/AboutPage"))

const companyRoutes: RouteObject[] = [
   {
      element: <CompanyGuard />,
      children: [
         {
            element: <CompanyLayout />,
            children: [
               {
                  path: "/company/jobs",
                  element: (
                     <RoutePage>
                        <MyJobs />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/applications",
                  element: (
                     <RoutePage>
                        <CompanyApplications />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/users",
                  element: (
                     <RoutePage>
                        <CompanyUsers />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/users/:userId/profile",
                  element: (
                     <RoutePage>
                        <CandidateProfile />
                     </RoutePage>
                  )
               },
               {
                  path: "/company-profile",
                  element: (
                     <RoutePage>
                        <CompanyProfile />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/profile/edit",
                  element: (
                     <RoutePage>
                        <EditCompanyProfile />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/jobs/:id/:slug",
                  element: (
                     <RoutePage>
                        <CompanyJobDetails />
                     </RoutePage>
                  )
               },
               {
                  path: "/create-job",
                  element: (
                     <RoutePage>
                        <CreateJob />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/jobs/:id/:slug/edit",
                  element: (
                     <RoutePage>
                        <EditJob />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/about",
                  element: (
                     <RoutePage>
                        <AboutPage />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/support",
                  element: (
                     <RoutePage>
                        <CompanySupportHelp />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/support/:topicId",
                  element: (
                     <RoutePage>
                        <CompanySupportTopic />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/support/:topicId/:articleId",
                  element: (
                     <RoutePage>
                        <CompanySupportArticle />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/support/requests/create",
                  element: (
                     <RoutePage>
                        <SupportRequestCreatePage portalType="company" />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/support/requests/:ticketId",
                  element: (
                     <RoutePage>
                        <SupportRequestDetailsPage portalType="company" />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/support-help",
                  element: (
                     <RoutePage>
                        <CompanySupportHelp />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/messages",
                  element: (
                     <RoutePage>
                        <CompanyMessages />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/messages/:conversationId",
                  element: (
                     <RoutePage>
                        <CompanyMessages />
                     </RoutePage>
                  )
               },
               {
                  path: "/company/notifications",
                  element: (
                     <RoutePage>
                        <CompanyNotifications />
                     </RoutePage>
                  )
               }
            ]
         }
      ]
   }
]

export default companyRoutes
