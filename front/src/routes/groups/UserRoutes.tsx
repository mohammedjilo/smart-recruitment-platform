import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import UserLayout from "@/layouts/UserLayout"
import ProfileCompletionGuard from "@/routes/guards/ProfileCompletionGuard"
import CompletedProfileGuard from "@/routes/guards/CompletedProfileGuard"
import UserGuard from "@/routes/guards/UserGuard"
import RoutePage from "../RoutePage"

const MyProfile = lazy(() => import("@/features/user/pages/MyProfilePage"))
const Complete = lazy(() => import("@/features/user/pages/profile/Complete"))
const Applications = lazy(() => import("@/features/user/pages/ApplicationsPage"))
const Jobs = lazy(() => import("@/features/user/pages/JobsPage"))
const JobDetails = lazy(() => import("@/features/user/pages/JobDetailsPage"))
const SavedJobs = lazy(() => import("@/features/user/pages/SavedJobsPage"))
const UserNotifications = lazy(() => import("@/features/user/pages/NotificationsPage"))
const UserMessages = lazy(() => import("@/features/user/pages/MessagesPage"))
const AboutPage = lazy(() => import("@/features/shared/pages/AboutPage"))
const CompaniesByUser = lazy(() => import("@/features/user/pages/CompaniesPage"))
const CompanyDetailsByUser = lazy(
   () => import("@/features/user/pages/CompanyDetailsPage")
)
const UserSupportHelp = lazy(() => import("@/features/user/pages/SupportHelpPage"))
const UserSupportTopic = lazy(
   () => import("@/features/user/pages/UserSupportTopicPage")
)
const UserSupportArticle = lazy(
   () => import("@/features/user/pages/UserSupportArticlePage")
)
const SupportRequestCreatePage = lazy(
   () => import("@/features/shared/support/pages/SupportRequestCreatePage")
)
const SupportRequestDetailsPage = lazy(
   () => import("@/features/shared/support/pages/SupportRequestDetailsPage")
)

const userRoutes: RouteObject[] = [
   {
      element: <UserGuard />,
      children: [
         {
            element: <UserLayout />,
            children: [
               {
                  element: <CompletedProfileGuard />,
                  children: [
                     {
                        path: "/profile/complete",
                        element: (
                           <RoutePage>
                              <Complete />
                           </RoutePage>
                        )
                     }
                  ]
               },
               {
                  element: <ProfileCompletionGuard />,
                  children: [
                     {
                        path: "/profile",
                        element: (
                           <RoutePage>
                              <MyProfile />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/companies",
                        element: (
                           <RoutePage>
                              <CompaniesByUser />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/companies/:id/:slug",
                        element: (
                           <RoutePage>
                              <CompanyDetailsByUser />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/companies/:id",
                        element: (
                           <RoutePage>
                              <CompanyDetailsByUser />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/applications",
                        element: (
                           <RoutePage>
                              <Applications />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/jobs",
                        element: (
                           <RoutePage>
                              <Jobs />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/jobs/:id/:slug",
                        element: (
                           <RoutePage>
                              <JobDetails />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/saved-jobs",
                        element: (
                           <RoutePage>
                              <SavedJobs />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/messages",
                        element: (
                           <RoutePage>
                              <UserMessages />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/messages/:conversationId",
                        element: (
                           <RoutePage>
                              <UserMessages />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/notifications",
                        element: (
                           <RoutePage>
                              <UserNotifications />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/about",
                        element: (
                           <RoutePage>
                              <AboutPage />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/user/support",
                        element: (
                           <RoutePage>
                              <UserSupportHelp />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/user/support/application-guide",
                        element: (
                           <RoutePage>
                              <AboutPage />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/user/support/:topicId",
                        element: (
                           <RoutePage>
                              <UserSupportTopic />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/user/support/:topicId/:articleId",
                        element: (
                           <RoutePage>
                              <UserSupportArticle />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/user/support/requests/create",
                        element: (
                           <RoutePage>
                              <SupportRequestCreatePage portalType="user" />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/user/support/requests/:ticketId",
                        element: (
                           <RoutePage>
                              <SupportRequestDetailsPage portalType="user" />
                           </RoutePage>
                        )
                     },
                     {
                        path: "/support-help",
                        element: (
                           <RoutePage>
                              <UserSupportHelp />
                           </RoutePage>
                        )
                     }
                  ]
               }
            ]
         }
      ]
   }
]

export default userRoutes
