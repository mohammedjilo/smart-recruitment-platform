import BusinessCenterOutlinedIcon from "@mui/icons-material/BusinessCenterOutlined"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined"
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined"
import type {
   SupportPortalConfig,
   SupportTopicDetailsData
} from "@/features/support/types"

export const companySupportConfig: SupportPortalConfig = {
   portalType: "company",

   title: "Support & Help",

   subtitle: "Get help, find answers, and create support requests.",

   topics: [
      {
         id: "jobs",
         title: "Jobs",
         description: "Create, manage and edit your job postings.",
         icon: BusinessCenterOutlinedIcon
      },
      {
         id: "applications",
         title: "Applications",
         description: "View and manage applications for your jobs.",
         icon: DescriptionOutlinedIcon
      },
      {
         id: "users",
         title: "Users / Candidates",
         description: "Search and manage candidates.",
         icon: PeopleOutlineOutlinedIcon
      },
      {
         id: "company-account",
         title: "Company Account",
         description: "Manage your company profile and settings.",
         icon: BusinessOutlinedIcon
      },
      {
         id: "technical",
         title: "Technical Issue",
         description: "Report bugs or technical problems.",
         icon: SettingsOutlinedIcon
      },
      {
         id: "other",
         title: "Other",
         description: "General inquiries and other topics.",
         icon: MailOutlineOutlinedIcon
      }
   ],

   contactEmail: "support@nexora.com",
   supportHours: "Sun - Thu, 9:00 AM - 6:00 PM",
   responseTime: "Within 24 hours"
}

export const companyTopicDetails: Record<string, SupportTopicDetailsData> = {
   jobs: {
      title: "Jobs",
      description: "Create, manage, and optimize your company job listings.",
      icon: BusinessCenterOutlinedIcon,
      articles: [
         {
            id: "how-to-create-a-job",
            title: "How to create a job",
            description:
               "Create a clear, complete job listing so candidates can understand the role, responsibilities, and qualifications.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Creating a job is the first step in attracting the right people to your company. A strong job post should explain the role, responsibilities, skills needed, and the hiring timeline clearly."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the Jobs section",
                  description:
                     "From your company dashboard, open the Jobs area. This is where you can see all current listings, drafts, and previously closed jobs.",
                  steps: [
                     "Go to your company workspace and select Jobs from the main navigation.",
                     "Review your existing job listings before creating a new one so you do not duplicate roles."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Click Create Job",
                  description:
                     "Use the Create Job button to open the job form and start adding the details for a new opportunity.",
                  steps: [
                     "Click Create Job from the Jobs page.",
                     "Enter a clear and specific job title that matches the role you want to fill."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Fill in the required job details",
                  description:
                     "The form should include the information a candidate needs to understand the opportunity and decide whether to apply.",
                  steps: [
                     "Add the job title, description, responsibilities, location, employment type, and required skills.",
                     "Include key requirements such as years of experience, education, certifications, or tools the candidate should know."
                  ],
                  note: "Keep the description concise but informative. Candidates should understand the role, day-to-day work, and what success looks like."
               },
               {
                  id: "step-4",
                  title: "Step 4: Review before publishing",
                  description:
                     "Before publishing, double-check the listing for clarity, spelling, and consistency across the job details.",
                  steps: [
                     "Review the job title, description, location, and application instructions.",
                     "Make sure the role matches your hiring needs and the company profile is accurate."
                  ],
                  tip: "If multiple team members are involved in hiring, ask one person to review the draft before it goes live."
               },
               {
                  id: "step-5",
                  title: "Step 5: Publish the job",
                  description:
                     "Once everything looks correct, publish the listing so candidates can start applying.",
                  steps: [
                     "Click Publish or Save and Publish to make the job visible.",
                     "After publishing, the job becomes available in the platform and starts receiving applications."
                  ],
                  warning:
                     "Do not publish before checking the role details, compensation expectations, and required qualifications."
               }
            ]
         },
         {
            id: "how-to-edit-a-job",
            title: "How to edit a job",
            description:
               "Update job information when responsibilities, requirements, or hiring details change.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "You can edit a job at any point after it has been created, whether it is still unpublished, active, or waiting for candidates."
               },
               {
                  id: "step-1",
                  title: "Step 1: Find the job",
                  description:
                     "Open your Jobs list and locate the listing you want to update.",
                  steps: [
                     "Go to the Jobs section from your company dashboard.",
                     "Use the search or filter options if you have many job listings."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Open edit mode",
                  description:
                     "Select the specific job and open its edit page to make changes to the details.",
                  steps: [
                     "Click the job you want to update.",
                     "Choose Edit Job or use the edit option available on the job detail page."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Update the details",
                  description:
                     "Revise the job title, description, requirements, salary range if applicable, or the location and employment type.",
                  steps: [
                     "Update responsibilities, requirements, and candidate expectations as needed.",
                     "If the role changes, make sure the title and description still match the actual needs of the position."
                  ]
               },
               {
                  id: "step-4",
                  title: "Step 4: Save changes",
                  description:
                     "Save your updates and review the new listing before sharing it with candidates again.",
                  steps: [
                     "Click Save or Save and Publish depending on whether you want to keep the current status or make the updated version visible immediately.",
                     "Check the updated job page to confirm the changes appear correctly."
                  ],
                  note: "If the job already has applications, review the updated content carefully so candidates receive accurate expectations."
               }
            ]
         },
         {
            id: "job-status-and-visibility",
            title: "Job status and visibility",
            description:
               "Understand how a job’s status affects whether it is visible to candidates and open to applications.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Each job can have a different status depending on its stage in the hiring process. These statuses help you manage the lifecycle of a role from draft to closed."
               },
               {
                  id: "section-1",
                  title: "Common statuses",
                  description:
                     "The platform usually shows jobs in a few different stages so both employers and candidates can understand what is happening.",
                  steps: [
                     "Draft: the listing is being prepared and is not yet open to candidates.",
                     "Active: the job is live and accepting applications.",
                     "Closed: the listing is no longer accepting new applications.",
                     "Expired: the advertising period has ended and the listing is no longer visible in active search results."
                  ],
                  note: "The exact labels may vary slightly depending on the features available in your environment, but the purpose is the same."
               },
               {
                  id: "section-2",
                  title: "How visibility works",
                  description:
                     "Visibility depends on the current job status and the settings on the listing itself.",
                  steps: [
                     "Active jobs are visible to candidates searching for roles.",
                     "Draft jobs are only visible to your team while they are being prepared.",
                     "Closed or expired listings should be updated or archived if you no longer want candidates to apply."
                  ],
                  tip: "If a role is still needed but not yet ready, keep it in draft until the details are complete."
               }
            ]
         },
         {
            id: "how-to-close-a-job",
            title: "How to close a job",
            description:
               "Close a job posting when the role has been filled, cancelled, or is no longer accepting applications.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Closing a job is the correct step when you want to stop receiving applications for a listing that is no longer active."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the job",
                  description: "Find the listing you want to close in your Jobs section.",
                  steps: [
                     "Open the Jobs page from the company dashboard.",
                     "Select the job you want to close."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Change the status",
                  description:
                     "Use the available action to close or archive the job so new applications are no longer accepted.",
                  steps: [
                     "Choose the Close Job or Archive Job action.",
                     "Confirm the action if prompted."
                  ],
                  note: "Closing a job does not delete it from your records, so you can still review historical applications if needed."
               },
               {
                  id: "step-3",
                  title: "Step 3: Review the result",
                  description:
                     "After closing the job, confirm that candidates can no longer apply and the listing is no longer visible as active.",
                  steps: [
                     "Check the job status after the action is completed.",
                     "Make sure the position is no longer visible in the active jobs list if that is your intention."
                  ],
                  tip: "If you may reopen the role later, keep a note of the original closing date and the reason for closure."
               }
            ]
         }
      ]
   },
   applications: {
      title: "Applications",
      description: "Review candidates and manage incoming applications efficiently.",
      icon: DescriptionOutlinedIcon,
      articles: [
         {
            id: "how-to-view-applications",
            title: "How to view applications",
            description:
               "Open the Applications section to review candidates who have applied to your jobs.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "The Applications area is where you can monitor all candidates who have submitted profiles and resumes for your jobs."
               },
               {
                  id: "step-1",
                  title: "Step 1: Go to Applications",
                  description: "Open the Applications page from your company dashboard.",
                  steps: [
                     "Select Applications from the main menu.",
                     "Review the list of applicants grouped by job or status."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Open a candidate",
                  description:
                     "Click on any applicant to see the full profile, submitted information, and application details.",
                  steps: [
                     "Review the candidate profile, job interest, and any notes tied to the application.",
                     "Use this page to decide whether to shortlist, interview, or reject."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Take action",
                  description:
                     "Once you have reviewed the application, move it to the next stage or update its status accordingly.",
                  steps: [
                     "Use the status menu to update the application stage.",
                     "Bookmark strong candidates for follow-up when needed."
                  ]
               }
            ]
         },
         {
            id: "application-status-explained",
            title: "Application status explained",
            description:
               "Learn how each application stage works so you can manage candidates consistently.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Statuses help your team understand where each candidate stands in the hiring process. They also help candidates know what to expect."
               },
               {
                  id: "section-1",
                  title: "Common statuses",
                  description:
                     "Depending on the setup in your workspace, applications may move through several common stages.",
                  steps: [
                     "Pending: the application has been submitted but has not been reviewed yet.",
                     "Reviewing: your team is evaluating the profile and qualifications.",
                     "Shortlisted: the candidate has passed the initial review and is being considered further.",
                     "Interview: a recruiter or hiring manager is preparing to reach out or meet the candidate.",
                     "Accepted, Rejected, or Withdrawn: the application has reached a final outcome."
                  ],
                  note: "Keep statuses updated so the hiring pipeline stays accurate and candidates receive consistent communication."
               }
            ]
         },
         {
            id: "how-to-filter-applications",
            title: "How to filter applications",
            description:
               "Use filters and sorting options to quickly find the candidates you need to review.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "When your company receives many applications, filtering helps you focus on the most relevant candidates first."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the filter panel",
                  description:
                     "From the Applications page, use the search and filter tools to narrow the list.",
                  steps: [
                     "Choose a status such as Pending, Reviewing, or Shortlisted.",
                     "Use name, job title, or other available filters if your workspace supports them."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Sort results",
                  description:
                     "Sort applications by recency, relevance, or the latest status change to make the queue easier to manage.",
                  steps: [
                     "Select the sort option that matches how you review candidates.",
                     "Refresh the list after updating statuses to keep your dashboard current."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Review high-priority candidates",
                  description:
                     "After filtering, open the strongest candidates first and continue your evaluation process.",
                  steps: [
                     "Check whether the applicants meet the role requirements.",
                     "Move qualified candidates forward as part of your standard hiring flow."
                  ]
               }
            ]
         },
         {
            id: "shortlist-candidates",
            title: "Shortlist candidates",
            description:
               "Move candidates forward when they meet the role requirements and are strong fits for the next stage.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Shortlisting is a simple way to mark candidates who should continue in the hiring process after a first review."
               },
               {
                  id: "step-1",
                  title: "Step 1: Review the application",
                  description:
                     "Open the candidate profile and check their qualifications, experience, and fit for the job.",
                  steps: [
                     "Review the resume, profile summary, experience, and skills.",
                     "Compare the applicant with the role requirements and your hiring goals."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Update the status",
                  description:
                     "Use the application actions to change the status to Shortlisted.",
                  steps: [
                     "Open the candidate application details panel.",
                     "Choose Shortlist and confirm the update."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Continue the process",
                  description:
                     "Once shortlisted, the candidate is ready for interview scheduling, further review, or follow-up contact.",
                  steps: [
                     "Use the next action in the hiring workflow to move the candidate ahead.",
                     "Keep communication clear and consistent so the candidate understands the next stage."
                  ]
               }
            ]
         },
         {
            id: "how-to-reject-an-application",
            title: "How to reject an application",
            description:
               "Reject a candidate in a clear and professional way when they are not moving forward.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "A rejection is a normal part of hiring. The main goal is to keep the process transparent and consistent for every applicant."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the application",
                  description:
                     "Select the candidate whose application should be rejected.",
                  steps: [
                     "Open the application detail page from the Applications section.",
                     "Review the candidate profile and notes one more time before changing the outcome."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Change the status",
                  description:
                     "Use the application action menu to mark the candidate as rejected.",
                  steps: [
                     "Choose Reject Application or a similar action available in your workspace.",
                     "Confirm the update so the status changes everywhere it is displayed."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Keep records tidy",
                  description:
                     "Use notes and status updates to maintain a clear hiring history for your team.",
                  steps: [
                     "Add a short internal note if the team needs context for future reviews.",
                     "Make sure the final result is visible in the application list and candidate dashboard."
                  ],
                  tip: "A thoughtful, consistent rejection process helps protect your brand and keeps your hiring workflow professional."
               }
            ]
         }
      ]
   },
   users: {
      title: "Users / Candidates",
      description: "Search for candidates and review their profiles in one place.",
      icon: PeopleOutlineOutlinedIcon,
      articles: [
         {
            id: "how-to-search-for-candidates",
            title: "How to search for candidates",
            description:
               "Use the search tools to find candidates by name, skill, experience, or role-related information.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Searching for candidates helps you quickly identify applicants who match the job requirements and company needs."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the users section",
                  description:
                     "Go to the Users or Candidates section from your company dashboard.",
                  steps: [
                     "Choose Users / Candidates from the main navigation.",
                     "Use the search box at the top to start finding people by name or keyword."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Apply filters",
                  description:
                     "Refine the list using the filters available for experience, skills, education, or role interest.",
                  steps: [
                     "Select the filters that best match your hiring needs.",
                     "Review the updated results list after applying each filter."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Open a profile",
                  description:
                     "When you find a promising candidate, open their profile to review their detailed information.",
                  steps: [
                     "Click the candidate name or profile card.",
                     "Review the skills, work history, education, and certifications to evaluate fit."
                  ]
               }
            ]
         },
         {
            id: "candidate-profiles",
            title: "Candidate profiles",
            description:
               "Open a candidate’s profile to assess experience, education, certifications, and profile completeness.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Candidate profiles are the main place to review a person’s professional background and what they have shared publicly or privately within the platform."
               },
               {
                  id: "section-1",
                  title: "What to review",
                  description:
                     "A complete profile gives you better context before moving someone forward in the process.",
                  steps: [
                     "Review experience, education, skills, certifications, and work samples if available.",
                     "Look for recent updates, completed sections, and any profile details that support the role."
                  ],
                  note: "Profiles with clear, up-to-date information usually make the hiring review faster and more accurate."
               },
               {
                  id: "section-2",
                  title: "How to use the profile",
                  description:
                     "Use the profile to understand the candidate’s background and decide how to proceed.",
                  steps: [
                     "Check whether the applicant fits the minimum qualifications for the role.",
                     "If needed, save the candidate for later or move them into a next-stage action."
                  ],
                  tip: "Look for consistency between the profile details, the application, and the job requirements."
               }
            ]
         },
         {
            id: "filtering-and-sorting",
            title: "Filtering and sorting",
            description:
               "Narrow down candidate lists and sort results so that your review process is faster and more organized.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Filtering and sorting are helpful when you have multiple candidates for the same role or are working with a large talent pool."
               },
               {
                  id: "step-1",
                  title: "Step 1: Apply filters",
                  description:
                     "Use the available filters to reduce the list to only the candidates relevant to your current need.",
                  steps: [
                     "Filter by skills, location, work type, or role-related fields.",
                     "Combine filters if you want a narrower, more specific result set."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Sort the list",
                  description:
                     "Once filtered, sort the results to bring the strongest or newest candidates to the top.",
                  steps: [
                     "Choose a sort option such as newest, most relevant, or alphabetical.",
                     "Reapply the sort after changing filters so the list stays organized."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Review and act",
                  description:
                     "Use the sorted and filtered list to move quickly through your review priorities.",
                  steps: [
                     "Open the top candidates first.",
                     "Update statuses as you learn more about each applicant."
                  ]
               }
            ]
         },
         {
            id: "how-to-contact-a-candidate",
            title: "How to contact a candidate",
            description:
               "Reach out to a candidate for interviews, follow-ups, or next steps in the hiring process.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Once you have reviewed a candidate and decided they fit your hiring plan, you can contact them directly through the platform or using the information available to your company."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the candidate profile",
                  description: "Select the candidate you want to reach out to.",
                  steps: [
                     "Open their profile or application details page.",
                     "Review the contact information and any recruiter notes before sending communication."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Start the conversation",
                  description:
                     "Use the available action to send a message or initiate the next stage of the process.",
                  steps: [
                     "Choose the appropriate contact or follow-up option in the candidate details area.",
                     "Include a clear subject or message that explains the next step."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Keep records updated",
                  description:
                     "After you contact the candidate, update the application status so the rest of the team knows what happened.",
                  steps: [
                     "Mark the candidate as Interviewing or follow up with their latest status.",
                     "Track your communication to avoid duplicate outreach."
                  ],
                  note: "Always communicate professionally and keep the message focused on the next step in the hiring process."
               }
            ]
         }
      ]
   },
   "company-account": {
      title: "Company Account",
      description: "Manage your company information, profile, and account security.",
      icon: BusinessOutlinedIcon,
      articles: [
         {
            id: "how-to-edit-your-company-profile",
            title: "How to edit your company profile",
            description:
               "Update your company details so candidates see accurate, current information about your organization.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Your company profile acts as your public identity on the platform. Keeping it accurate helps candidates understand your brand and hiring goals."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open your profile settings",
                  description:
                     "From the company dashboard, open the profile or company settings page.",
                  steps: [
                     "Find the section that manages your company profile.",
                     "Review your existing company description, contact information, and branding details."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Update the information",
                  description:
                     "Edit the fields that need to be refreshed, such as company name, description, website, or address.",
                  steps: [
                     "Update text to make the description more accurate and current.",
                     "Add or remove contact links, social pages, or other public details if needed."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Save changes",
                  description:
                     "Save your profile updates so the new information is visible to candidates and team members.",
                  steps: [
                     "Click Save after making your changes.",
                     "Review the live profile to confirm the data looks correct."
                  ]
               }
            ]
         },
         {
            id: "add-and-manage-company-members",
            title: "Add and manage company members",
            description:
               "Invite teammates and keep company account access organized as your team grows.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "A company account often needs multiple users to manage jobs, applications, and candidate lists. The right member management setup keeps the team organized."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open company settings",
                  description:
                     "Find the section where you can add or edit company members.",
                  steps: [
                     "Go to your company profile or account settings.",
                     "Look for the team or members management area."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Add a member",
                  description:
                     "Send the invitation or add the teammate using the available account setup flow.",
                  steps: [
                     "Enter the person’s details as required by your account settings.",
                     "Assign the correct role or access level, if the platform supports this."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Review permissions",
                  description:
                     "Check who can access jobs, applications, profiles, and account settings.",
                  steps: [
                     "Remove or update access when someone leaves the company or changes roles.",
                     "Keep the team list current so the account stays secure and easy to manage."
                  ],
                  note: "Only grant access to people who need it for day-to-day hiring work."
               }
            ]
         },
         {
            id: "company-verification",
            title: "Company verification",
            description:
               "Review what verification means and how to keep your company account aligned with platform requirements.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Verification helps build trust across the platform. It may be required for account credibility, job visibility, or certain hiring features."
               },
               {
                  id: "section-1",
                  title: "What verification usually includes",
                  description:
                     "Depending on your workspace, company verification may involve confirming account details or submitting paperwork for review.",
                  steps: [
                     "Confirm the company name, details, and legal information shown on the account.",
                     "Submit any required documents or updates when the platform asks for them."
                  ]
               },
               {
                  id: "section-2",
                  title: "How to prepare",
                  description:
                     "Keep your company profile current so the verification process is faster and easier.",
                  steps: [
                     "Review the profile information before submitting verification requests.",
                     "Respond quickly if the platform asks for additional proof or clarifications."
                  ],
                  tip: "Accurate details make verification smoother and reduce delays for your team."
               }
            ]
         },
         {
            id: "account-security",
            title: "Account security",
            description:
               "Protect your company account with strong passwords, careful access management, and regular profile review.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Security matters because company accounts often control job listings, applications, and sensitive candidate information."
               },
               {
                  id: "section-1",
                  title: "Best practices",
                  description:
                     "Use simple habits that reduce the chance of unauthorized access.",
                  steps: [
                     "Use a strong password unique to your company account.",
                     "Review who has access to the company workspace and remove accounts that are no longer needed.",
                     "Keep contact information up to date so account recovery is possible if something goes wrong."
                  ],
                  note: "If multiple people manage the account, ensure each teammate uses secure login credentials."
               },
               {
                  id: "section-2",
                  title: "When something looks wrong",
                  description:
                     "If you notice unusual account activity, update access and contact support quickly.",
                  steps: [
                     "Change your password if you suspect unauthorized activity.",
                     "Review recent team member access and confirm that every account is still needed."
                  ],
                  warning:
                     "Do not share login credentials with teammates outside of the approved account management process."
               }
            ]
         }
      ]
   },
   technical: {
      title: "Technical Issue",
      description: "Report issues and get help with platform technical problems.",
      icon: SettingsOutlinedIcon,
      articles: [
         {
            id: "website-is-not-working",
            title: "Website is not working",
            description:
               "If the platform is not loading correctly, follow these steps before contacting support.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "A website issue can happen because of a temporary problem with the browser, connection, or a platform-side outage."
               },
               {
                  id: "step-1",
                  title: "Step 1: Refresh the page",
                  description:
                     "Start with a simple refresh to see whether the issue is temporary.",
                  steps: [
                     "Reload the page once or twice to confirm whether the content returns.",
                     "Check whether the problem happens on one page or across the whole platform."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Check your browser",
                  description:
                     "Update the browser and clear cached data if the platform loads slowly or appears broken.",
                  steps: [
                     "Try opening the site in a different browser or an incognito window.",
                     "Clear temporary data if the page is freezing or showing stale content."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Contact support if needed",
                  description:
                     "If the issue continues, share a clear description so the team can investigate quickly.",
                  steps: [
                     "Include the page name, the time it happened, and the actions you took.",
                     "Attach any visible error message if possible."
                  ],
                  note: "A short, specific description helps support resolve the issue faster."
               }
            ]
         },
         {
            id: "login-problems",
            title: "Login problems",
            description:
               "Troubleshoot access issues when you cannot sign in or the system keeps rejecting your credentials.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Login problems often happen because of a password error, session issue, or browser state problem."
               },
               {
                  id: "step-1",
                  title: "Step 1: Verify your details",
                  description:
                     "Double-check the email address and password you are using.",
                  steps: [
                     "Make sure the login information matches your active account.",
                     "Check whether Caps Lock or keyboard layout settings changed the password entry."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Reset access if needed",
                  description:
                     "If the password is not working, use the reset option to regain access.",
                  steps: [
                     "Click Forgot Password or a similar recovery option.",
                     "Follow the recovery steps and create a new password if required."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Try another browser or session",
                  description:
                     "If the password reset is successful but login still fails, the browser session may need attention.",
                  steps: [
                     "Open the platform in a fresh session or private browser.",
                     "Clear local cookies if the login page keeps failing after a valid reset."
                  ],
                  note: "If you still cannot access your account, contact support with the exact error message and time of failure."
               }
            ]
         },
         {
            id: "file-upload-issues",
            title: "File upload issues",
            description:
               "Resolve common problems when documents, resumes, or attachments are not uploading correctly.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Uploads can fail if the file format is not supported, the file is too large, or the session is interrupted."
               },
               {
                  id: "step-1",
                  title: "Step 1: Check the file format",
                  description:
                     "Make sure the document matches the accepted file types supported by the platform.",
                  steps: [
                     "Try a common format such as PDF, DOCX, or PNG if the file is not uploading.",
                     "Remove non-standard file names or special characters if needed."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Check file size",
                  description:
                     "Large files can fail during upload, especially on unstable connections.",
                  steps: [
                     "Compress the file if it is very large.",
                     "Retry the upload after confirming the network is stable."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Retry or contact support",
                  description:
                     "If the file still does not upload, submit a support request with the file details and error message.",
                  steps: [
                     "Try the upload again after refreshing the page.",
                     "Share the file name, size, and error type if the issue continues."
                  ],
                  warning:
                     "Avoid submitting multiple duplicate upload attempts if the system is already processing the same file."
               }
            ]
         },
         {
            id: "report-a-bug",
            title: "Report a bug",
            description:
               "Tell the support team about a technical problem so it can be investigated and fixed.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Every bug report is more useful when it includes where the issue happened, what the user was doing, and what went wrong."
               },
               {
                  id: "step-1",
                  title: "Step 1: Describe the issue clearly",
                  description:
                     "Explain the problem in simple language so support understands what is failing.",
                  steps: [
                     "Include the page name, the action you were trying to complete, and the result you saw.",
                     "Mention whether the issue happens every time or only in certain situations."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Add useful details",
                  description:
                     "Support can investigate faster if you include the browser, device, and timing of the issue.",
                  steps: [
                     "Mention the browser type and whether the issue happened on mobile or desktop.",
                     "Include the exact wording of any error message if one appeared."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Submit the request",
                  description:
                     "Once the report is complete, send it through the support request flow or the available contact channel.",
                  steps: [
                     "Use the Create Support Request button if available.",
                     "Attach screenshots if they help explain the problem."
                  ],
                  tip: "A detailed bug report helps the team reproduce the issue and avoid guessing about the root cause."
               }
            ]
         }
      ]
   }
}
