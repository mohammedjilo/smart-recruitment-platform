import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined"
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined"
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined"
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined"
import type {
   SupportPortalConfig,
   SupportTopicDetailsData
} from "@/features/shared/support/types"

export const userSupportConfig: SupportPortalConfig = {
   portalType: "user",

   title: "Support & Help",

   subtitle: "Get help, find answers, and create support requests.",

   topics: [
      {
         id: "applications",
         title: "Applications",
         description: "Track your applications and status.",
         icon: DescriptionOutlinedIcon
      },
      {
         id: "job-search",
         title: "Job Search",
         description: "How to search and apply for jobs.",
         icon: SearchOutlinedIcon
      },
      {
         id: "profile",
         title: "Profile",
         description: "Update your profile and skills.",
         icon: AccountCircleOutlinedIcon
      },
      {
         id: "security",
         title: "Account & Security",
         description: "Password, email and account settings.",
         icon: LockOutlinedIcon
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
      },
      {
         id: "application-employment-guide",
         title: "Application & Employment Guide",
         description: "Understand application statuses and employment types.",
         icon: WorkOutlineOutlinedIcon
      }
   ],

   contactEmail: "support@nexora.com",
   supportHours: "Sun - Thu, 9:00 AM - 6:00 PM",
   responseTime: "Within 24 hours"
}

export const userTopicDetails: Record<string, SupportTopicDetailsData> = {
   applications: {
      title: "Applications",
      description: "Track your applications and understand their current stage.",
      icon: DescriptionOutlinedIcon,
      articles: [
         {
            id: "how-to-check-application-status",
            title: "How to check application status",
            description:
               "Open your application list to see where each role stands in the hiring process.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Your Application page is where you can see every job you have applied for and review the current stage of each one."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open Applications",
                  description:
                     "Go to the Applications section from your main dashboard or navigation menu.",
                  steps: [
                     "Select Applications to open your list of submitted roles.",
                     "Use the filters if you want to focus on a specific status or time period."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Review the status",
                  description:
                     "Each application shows its current stage so you can understand where you stand in the hiring process.",
                  steps: [
                     "Look at the status column for your application.",
                     "Open the application details page if you want more information about the company or recruiters response."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Follow the next step",
                  description:
                     "After checking the status, continue to the next action expected from the employer or platform.",
                  steps: [
                     "If your application is pending, wait for the review to be completed.",
                     "If it is shortlisted, prepare for any interview or follow-up communication."
                  ],
                  note: "Statuses may update as the employer moves through their recruitment process."
               }
            ]
         },
         {
            id: "understanding-application-statuses",
            title: "Understanding application statuses",
            description:
               "Learn what each application stage means so you know what to expect.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Application statuses are a simple way to communicate where your job application is in the process."
               },
               {
                  id: "section-1",
                  title: "Common statuses",
                  description:
                     "You may see several statuses depending on the platform configuration and the company’s process.",
                  steps: [
                     "Pending: your application has been received and is waiting for review.",
                     "Reviewing: the company is checking your profile and qualifications.",
                     "Shortlisted: you are being considered for the next stage.",
                     "Interview: the company has moved your application forward for follow-up.",
                     "Accepted, Rejected, or Withdrawn: the process has reached a final outcome."
                  ],
                  note: "A status change usually means the company has taken an action, so it is worth checking your application details regularly."
               }
            ]
         },
         {
            id: "view-application-details",
            title: "View application details",
            description:
               "Open a specific application to review the role, your submission, and any recruiter feedback.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "The application details page gives you a closer look at the role you applied for and the status of your submission."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open a specific application",
                  description:
                     "From the Applications list, choose the role you want to inspect in more detail.",
                  steps: [
                     "Click the application you are interested in.",
                     "Review the job title, company name, and the date you submitted your profile."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Review the information provided",
                  description:
                     "The details page often includes your application overview, current status, and the company’s activity on the role.",
                  steps: [
                     "Check whether the application details match the job you intended to apply for.",
                     "Look for recruiter messages, notes, or updates that may appear in the timeline."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Take action if needed",
                  description:
                     "If the page shows that the process has changed or the role is no longer relevant, you can decide whether to wait, update, or withdraw."
               }
            ]
         },
         {
            id: "how-to-withdraw-an-application",
            title: "How to withdraw an application",
            description:
               "Withdraw a job application if you no longer want to continue with a role.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Withdrawing an application is a good option when you no longer want to be considered for a role or your plans have changed."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the application details",
                  description:
                     "Go to the application you want to remove from your active list.",
                  steps: [
                     "Open the application from the Applications page.",
                     "Review the role and confirm that this is the correct application to withdraw."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Use the withdraw option",
                  description:
                     "Select the action that allows you to withdraw the application.",
                  steps: [
                     "Choose Withdraw Application or a similar option shown on the details page.",
                     "Confirm the action when the platform asks for confirmation."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Confirm the result",
                  description:
                     "Once withdrawn, the application will no longer continue in the company’s active process.",
                  steps: [
                     "Check that the status has updated accordingly.",
                     "Review your application list to confirm the role is no longer active."
                  ],
                  note: "A withdrawn application is usually still visible in your history, but it will no longer be considered for the role."
               }
            ]
         }
      ]
   },
   "job-search": {
      title: "Job Search",
      description: "Find the right jobs and apply with confidence.",
      icon: SearchOutlinedIcon,
      articles: [
         {
            id: "how-to-search-for-jobs",
            title: "How to search for jobs",
            description:
               "Use the search bar and filters to browse job listings that match your preferences and skills.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "The job search page helps you discover roles that fit your goals, location, and skills."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open Jobs",
                  description:
                     "Navigate to the Jobs page from your dashboard or main menu.",
                  steps: [
                     "Select Jobs to open the search page.",
                     "Use the search box to type a role, keyword, or company name."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Review the results",
                  description:
                     "Browse the job cards to understand which roles best match your needs.",
                  steps: [
                     "Check each role’s title, company, location, and description.",
                     "Open a role for more details before applying."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Save or apply",
                  description:
                     "If a role looks promising, you can save it for later or submit your application immediately.",
                  steps: [
                     "Use Save Job if you want to keep it in your saved list.",
                     "Use Apply to start the application flow if you are ready."
                  ]
               }
            ]
         },
         {
            id: "using-location-filters",
            title: "Using location filters",
            description:
               "Refine your search results by city, country, or remote availability.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Location filters help you focus on opportunities that fit your preferred working area or remote setup."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the filters",
                  description:
                     "Use the job search filters to narrow your results by location.",
                  steps: [
                     "Select the location or remote option in the filter panel.",
                     "Choose the area that best suits your current circumstances."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Review the updated results",
                  description:
                     "After applying a location filter, the list updates so that you only see relevant opportunities.",
                  steps: [
                     "Check whether the results now match your preferred city or remote options.",
                     "Adjust the filter if you want to widen or narrow the search."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Save the best results",
                  description:
                     "Once the results look right, save or apply to the roles that match your goals.",
                  steps: [
                     "Click Save Job for positions you want to review later.",
                     "Apply only to the jobs that truly fit your skills and interests."
                  ]
               }
            ]
         },
         {
            id: "how-to-use-job-filters",
            title: "How to use job filters",
            description:
               "Use available search filters to narrow results by type, skills, company, and other key fields.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Job filters can save time by making the search results more relevant to your qualifications and interests."
               },
               {
                  id: "step-1",
                  title: "Step 1: Explore the filter options",
                  description:
                     "Open the filter panel on the Jobs page and review the available criteria.",
                  steps: [
                     "Filter by employment type, department, location, company, or skill set.",
                     "Use the filters that matter most for the roles you want to pursue."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Combine filters",
                  description:
                     "You can often combine multiple filters to find a more precise match.",
                  steps: [
                     "Set one filter at a time and review the result list after each change.",
                     "Remove filters that are too restrictive once you have enough options."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Apply your findings",
                  description:
                     "Once you have a useful search result, open the most relevant jobs and apply if they fit.",
                  steps: [
                     "Click on the role to read the full description.",
                     "Save or apply to positions that match your professional goals."
                  ]
               }
            ]
         },
         {
            id: "how-to-apply-for-a-job",
            title: "How to apply for a job",
            description:
               "Submit your application using the job details page and the platform’s application form.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Applying for a job is straightforward when you review the role carefully and prepare the required details before submitting."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the job posting",
                  description:
                     "Select a job from the search results and read the full description.",
                  steps: [
                     "Check the responsibilities, required skills, and experience level.",
                     "Review the location, employment type, and application instructions."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Prepare your application",
                  description:
                     "Make sure your profile is complete so the company sees your strongest qualifications.",
                  steps: [
                     "Review your profile information, resume, skills, and certifications.",
                     "Update any missing sections before starting the application."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Submit the application",
                  description:
                     "Use the Apply button to send your application through the platform.",
                  steps: [
                     "Check all fields before submitting.",
                     "After submitting, go to Applications to confirm the role appears in your application list."
                  ],
                  note: "A complete, accurate profile increases your chances of being seen as a strong candidate."
               }
            ]
         },
         {
            id: "how-to-save-a-job",
            title: "How to save a job",
            description:
               "Save interesting job opportunities so you can review them later.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Saving a job lets you keep roles you are interested in without submitting an application immediately."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the job listing",
                  description: "Select a role you want to revisit later.",
                  steps: [
                     "Open the job details page from the search results.",
                     "Review the description to confirm that it aligns with your interests."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Save the position",
                  description:
                     "Use the Save Job action available on the job card or details page.",
                  steps: [
                     "Click Save Job when you want to keep the listing in your saved jobs list.",
                     "Check that the item is added to your Saved Jobs section."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Review saved jobs later",
                  description:
                     "Visit Saved Jobs whenever you want to revisit interesting opportunities.",
                  steps: [
                     "Open the Saved Jobs page from your account navigation.",
                     "Apply when you are ready to move forward with a role."
                  ]
               }
            ]
         }
      ]
   },
   profile: {
      title: "Profile",
      description: "Keep your profile complete and up to date.",
      icon: AccountCircleOutlinedIcon,
      articles: [
         {
            id: "how-to-complete-your-profile",
            title: "How to complete your profile",
            description:
               "Fill in your personal details, skills, and background so employers can evaluate your profile properly.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "A complete profile improves your visibility and helps companies understand who you are, what you know, and what you have done."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open your profile",
                  description:
                     "Go to your profile page from the user dashboard or account menu.",
                  steps: [
                     "Review all visible sections such as bio, work history, education, and skills.",
                     "Look for sections that are empty or incomplete."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Add the missing information",
                  description:
                     "Update your profile with details that show your experience and capabilities clearly.",
                  steps: [
                     "Add your current role, years of experience, and a professional summary.",
                     "Fill in your education, recent projects, and skills to improve the profile quality."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Save the changes",
                  description:
                     "Once the profile looks complete, save the changes so employers can see the latest version.",
                  steps: [
                     "Use the Save button at the bottom of the profile form.",
                     "Return to your profile later to review whether anything else should be added."
                  ],
                  tip: "The more complete your profile is, the easier it is for recruiters and employers to understand your background."
               }
            ]
         },
         {
            id: "how-to-edit-your-information",
            title: "How to edit your information",
            description:
               "Update your profile details whenever your bio, contact information, or related data changes.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "You may need to edit your profile from time to time as your experience, contact details, or career goals change."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the profile edit page",
                  description:
                     "Select the profile area you want to update from your account menu or profile page.",
                  steps: [
                     "Choose Edit Profile or a similar option.",
                     "Review the editable fields before making updates."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Update the fields",
                  description:
                     "Edit the information that has changed, such as your bio, location, email, or career interests.",
                  steps: [
                     "Keep your summary accurate and professional.",
                     "Make sure contact details are current so employers can reach you."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Save changes",
                  description:
                     "Once you are satisfied with the new information, save your updates so the profile shows the latest version.",
                  steps: [
                     "Click Save or Update after editing the section.",
                     "Visit the live profile page to confirm the details look correct."
                  ]
               }
            ]
         },
         {
            id: "how-to-add-education",
            title: "How to add education",
            description:
               "Show your academic background and qualifications by adding education entries to your profile.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Education details help employers understand your academic background and qualifications, especially for early-career or specialized roles."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open education section",
                  description:
                     "From your profile, choose the education section or an edit option for education.",
                  steps: [
                     "Look for the area labelled Education or Academic Background.",
                     "Choose Add Education if no entries are listed yet."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Enter the details",
                  description:
                     "Add the school, qualification, field of study, and dates attended.",
                  steps: [
                     "Include the institution name and the degree or certificate earned.",
                     "Add relevant details such as GPA if it is meaningful for the role."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Save the entry",
                  description:
                     "Once you have entered the details, save the education item to display it on your profile.",
                  steps: [
                     "Review the new entry before saving.",
                     "Repeat the process for multiple universities or certifications if needed."
                  ]
               }
            ]
         },
         {
            id: "how-to-add-experience",
            title: "How to add experience",
            description:
               "Include your work history so employers can see your responsibilities, achievements, and career growth.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Experience entries are one of the most important parts of your profile because they show what you have done in your career."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the experience section",
                  description:
                     "Find the professional experience section in your profile editor.",
                  steps: [
                     "Select Add Experience or edit an existing role.",
                     "Decide whether you want to add a current role, previous job, or internship."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Add role details",
                  description:
                     "Write a clear summary of your responsibilities and the results you achieved.",
                  steps: [
                     "Include your job title, company, dates, and a short description of your work.",
                     "Highlight measurable accomplishments or strong examples of impact when possible."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Save and review",
                  description:
                     "After saving, return to your profile to ensure the experience content reads clearly and appears in the right place.",
                  steps: [
                     "Use the edit option if you need to refine wording.",
                     "Keep the summary professional and aligned with the roles you want to pursue."
                  ]
               }
            ]
         },
         {
            id: "how-to-manage-skills",
            title: "How to manage skills",
            description:
               "Update the skills section so employers can quickly understand your strengths and technical capabilities.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Your skills section helps recruiters and companies match you to jobs that fit your background."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the skills section",
                  description: "Navigate to the skills area in your profile editor.",
                  steps: [
                     "Choose Skills from the editable profile sections.",
                     "Review the current list and identify missing or outdated entries."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Add or remove skills",
                  description:
                     "Update the list so it reflects your actual knowledge, tools, and strengths.",
                  steps: [
                     "Add skills that are relevant to the jobs you want.",
                     "Remove outdated or inaccurate skills that no longer reflect your capabilities."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Save the final list",
                  description:
                     "Once your skills list is correct, save the changes and review the profile.",
                  steps: [
                     "Check whether the skills now align with your experience and recent goals.",
                     "Update the list again whenever your skills change."
                  ]
               }
            ]
         },
         {
            id: "how-to-add-certifications",
            title: "How to add certifications",
            description:
               "Show professional or technical credentials that support your qualifications and career goals.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Certifications can help validate your knowledge and make your profile more credible for employers and recruiters."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open the certifications area",
                  description: "Find the certifications section in your profile editor.",
                  steps: [
                     "Choose Add Certification or edit an existing item.",
                     "Review which certifications are most relevant to your goals."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Enter certification details",
                  description:
                     "Add the certification name, provider, and dates when appropriate.",
                  steps: [
                     "If available, also include a credential ID or expiry date.",
                     "Make sure the information is accurate so employers can trust the entry."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Save and review",
                  description:
                     "Once saved, your certification will appear on your profile and support your job search.",
                  steps: [
                     "Confirm the entry appears correctly on the profile page.",
                     "Update or remove certifications if they are outdated or no longer relevant."
                  ]
               }
            ]
         }
      ]
   },
   security: {
      title: "Account & Security",
      description: "Manage account details and keep your profile secure.",
      icon: LockOutlinedIcon,
      articles: [
         {
            id: "how-to-change-your-password",
            title: "How to change your password",
            description:
               "Update your login password regularly to keep your account secure.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Changing your password is an important step if you want to refresh your account security or recover from a possible leak."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open security settings",
                  description:
                     "Go to the profile or account settings area where password management is available.",
                  steps: [
                     "Choose Security or Account Settings.",
                     "Look for the section that lets you update your password."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Enter the new password",
                  description:
                     "Create a strong password that is unique and hard to guess.",
                  steps: [
                     "Use a long password with a mix of letters, numbers, and symbols.",
                     "Avoid reusing an older password from another account."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Confirm the change",
                  description:
                     "Save the updated password and sign back in if the system requires it.",
                  steps: [
                     "Review the confirmation message after saving.",
                     "Update any saved login details in your browser or password manager."
                  ],
                  note: "It is smart to change your password if you suspect someone else may know it."
               }
            ]
         },
         {
            id: "how-to-change-your-email",
            title: "How to change your email",
            description:
               "Update the email address connected to your account when your contact details change.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Your email address is often used for account recovery, notifications, and important updates, so it should stay correct."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open account settings",
                  description:
                     "Go to your account settings or profile settings and find the email section.",
                  steps: [
                     "Select the email or contact information option.",
                     "Review the existing address before making changes."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Enter the new email",
                  description:
                     "Add the correct email address you want to use for your account.",
                  steps: [
                     "Double-check spelling and the domain before saving.",
                     "Make sure the new address is one you can access for verification or recovery messages."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Confirm the update",
                  description:
                     "Save the change and follow any verification steps needed by the platform.",
                  steps: [
                     "Check your inbox for a confirmation or verification message.",
                     "Complete the required steps if the platform asks for verification."
                  ]
               }
            ]
         },
         {
            id: "keep-your-account-secure",
            title: "Keep your account secure",
            description:
               "Follow a few simple habits to protect your account from unauthorized access.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Your account contains personal information and application history, so it should be protected with strong security habits."
               },
               {
                  id: "section-1",
                  title: "Recommended habits",
                  description: "Use these steps to keep your account safer every day.",
                  steps: [
                     "Choose a unique password that you do not reuse elsewhere.",
                     "Update your password if you think it may have been exposed.",
                     "Keep your contact information current so account recovery is easier."
                  ],
                  tip: "A password manager can help you create and store secure passwords without memorizing each one."
               },
               {
                  id: "section-2",
                  title: "What to avoid",
                  description:
                     "Avoid sharing your login details or leaving your account logged in on shared devices.",
                  steps: [
                     "Do not share your password with other people.",
                     "Sign out from public or shared computers after use."
                  ],
                  warning:
                     "If you notice suspicious activity, change your password immediately and contact support."
               }
            ]
         },
         {
            id: "deactivate-your-account",
            title: "Deactivate your account",
            description:
               "Temporarily disable your account when you no longer want to use the platform.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Deactivating your account is the correct option when you want to pause your profile temporarily or stop using the platform for a while."
               },
               {
                  id: "step-1",
                  title: "Step 1: Open account settings",
                  description:
                     "Go to your account or profile settings area to find the account deactivation option.",
                  steps: [
                     "Look for Deactivate Account or a similar setting in the security section.",
                     "Review any warnings before continuing."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Confirm deactivation",
                  description:
                     "Follow the platform prompts to temporarily disable the account.",
                  steps: [
                     "Read the confirmation message carefully.",
                     "Confirm the action when asked to proceed."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Reactivate later",
                  description:
                     "If you want to return later, you can usually reactivate the account using the same login information or support help.",
                  steps: [
                     "Check whether the platform allows reactivation from the login page or account settings.",
                     "Contact support if you need help restoring access."
                  ],
                  note: "Deactivation usually pauses your profile, but some account history may remain available for records or support needs."
               }
            ]
         }
      ]
   },
   technical: {
      title: "Technical Issue",
      description: "Report bugs or technical problems affecting the platform.",
      icon: SettingsOutlinedIcon,
      articles: [
         {
            id: "website-is-not-working",
            title: "Website is not working",
            description:
               "Refresh the page, check your browser, and try again if the platform is not loading properly.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "A site issue can happen for many small reasons, including a temporary browser problem, a weak connection, or a platform service disruption."
               },
               {
                  id: "step-1",
                  title: "Step 1: Refresh the page",
                  description: "Try reloading the page before doing anything else.",
                  steps: [
                     "Refresh once or twice to see if the page loads normally.",
                     "Check if the issue affects multiple pages or just one section."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Check the browser",
                  description:
                     "If the page keeps failing, try another browser or an incognito/private session.",
                  steps: [
                     "Clear cache or cookies if the platform is showing stale content.",
                     "Update the browser if it has not been refreshed recently."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Contact support if needed",
                  description:
                     "If the problem continues, report it with the page name, the time it happened, and the error message."
               }
            ]
         },
         {
            id: "login-problems",
            title: "Login problems",
            description:
               "Verify your account credentials and try resetting your password if you are blocked from logging in.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Login issues usually happen because of incorrect credentials, a session problem, or a temporary browser issue."
               },
               {
                  id: "step-1",
                  title: "Step 1: Check the entered details",
                  description:
                     "Review the email address and password you are using for the account.",
                  steps: [
                     "Make sure you are using the correct account and that the password is entered correctly.",
                     "Check if Caps Lock or another keyboard setting changed what you typed."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Reset the password",
                  description:
                     "Use the password recovery option if you cannot remember your current password.",
                  steps: [
                     "Click Forgot Password and follow the instructions.",
                     "Create a new password and try logging in again."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Retry in a clean session",
                  description:
                     "If password reset works but login still fails, the browser session may need to be refreshed.",
                  steps: [
                     "Try again in an incognito session or after clearing temporary data.",
                     "Contact support with the error message if the problem still continues."
                  ]
               }
            ]
         },
         {
            id: "file-upload-issues",
            title: "File upload issues",
            description:
               "Make sure documents meet the accepted format and size requirements before resubmitting them.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Upload problems usually happen when the file format, size, or the browser connection prevents the file from being submitted."
               },
               {
                  id: "step-1",
                  title: "Step 1: Check the file type",
                  description:
                     "Confirm that the file is in a format supported by the platform.",
                  steps: [
                     "Try a common format such as PDF or DOCX if the current file is rejected.",
                     "Rename the file to a simple title if the platform rejects special characters."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Check the file size",
                  description:
                     "Large files may fail to upload on a slow or unstable connection.",
                  steps: [
                     "Compress or resize the file if it is very large.",
                     "Retry after confirming that your connection is stable."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Retry or report the issue",
                  description:
                     "If the upload still fails, use support channels to report the problem with the file details.",
                  steps: [
                     "Include the file name, size, and the error you saw.",
                     "Attach the document if support asks for it."
                  ]
               }
            ]
         },
         {
            id: "report-a-bug",
            title: "Report a bug",
            description:
               "Submit a clear support request with the issue details, the page you were on, and the steps you took.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "A good bug report helps the support team understand the problem and investigate it quickly."
               },
               {
                  id: "step-1",
                  title: "Step 1: Describe the issue",
                  description:
                     "Explain what did not work and what you expected to happen.",
                  steps: [
                     "Add the page, the action you were trying to complete, and the result you saw.",
                     "Mention whether the issue happens consistently or only sometimes."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Add context",
                  description:
                     "Helpful context includes the browser, device, and timing of the issue.",
                  steps: [
                     "Include the browser name if you know it.",
                     "Add a screenshot or any visible error message if possible."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Submit the report",
                  description:
                     "Use the support request flow to send the report and let the team investigate.",
                  steps: [
                     "Submit the issue through the Create Support Request action.",
                     "Check your inbox for any follow-up messages from support."
                  ]
               }
            ]
         }
      ]
   },
   other: {
      title: "Other",
      description: "General questions, feedback, and additional support requests.",
      icon: MailOutlineOutlinedIcon,
      articles: [
         {
            id: "general-questions",
            title: "General questions",
            description:
               "Browse the most common platform questions and use the article list to find the right answer.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "The Support & Help center is designed to answer common questions quickly and help you move forward without delays."
               },
               {
                  id: "section-1",
                  title: "How to use the help center",
                  description:
                     "Start by selecting the topic that matches your question, then open the relevant article.",
                  steps: [
                     "Use the category list to find the main topic area.",
                     "Search the topic by keyword if you already know what you need."
                  ]
               },
               {
                  id: "section-2",
                  title: "If you still need help",
                  description:
                     "Use the Create Support Request option if the article list does not answer your question.",
                  note: "A clear question and a few details about what you were doing will help the support team respond faster."
               }
            ]
         },
         {
            id: "send-feedback",
            title: "Send feedback",
            description:
               "Provide feedback on your experience so the platform team can keep improving the service.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Feedback helps the platform team understand what is working well and what still needs improvement."
               },
               {
                  id: "section-1",
                  title: "What to include",
                  description:
                     "A useful feedback message includes the problem, the improvement, and the impact it had on the user experience.",
                  steps: [
                     "Explain what you were trying to do.",
                     "Share what felt confusing, slow, or missing.",
                     "Mention whether the issue affected your ability to apply, search, or manage your account."
                  ]
               },
               {
                  id: "section-2",
                  title: "How to send feedback",
                  description:
                     "Use the support request channel to send a message to the team when you want to share your experience.",
                  note: "Specific examples are more helpful than general praise or complaints."
               }
            ]
         },
         {
            id: "send-a-suggestion",
            title: "Send a suggestion",
            description:
               "Share ideas for new features, better workflows, or improvements that could help the platform.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Suggestions are valuable when they describe a practical improvement that could make the platform easier or more useful for everyone."
               },
               {
                  id: "section-1",
                  title: "What makes a good suggestion",
                  description:
                     "Clear suggestions explain the idea, the benefit, and how it would improve the current experience.",
                  steps: [
                     "Describe the feature, workflow, or change you would like to see.",
                     "Explain who would benefit from it and why it matters."
                  ]
               },
               {
                  id: "section-2",
                  title: "How to submit",
                  description:
                     "Use the support or feedback channel to send the suggestion to the platform team.",
                  tip: "A concise suggestion with a clear use case is easier to evaluate and prioritize."
               }
            ]
         },
         {
            id: "report-inappropriate-content",
            title: "Report inappropriate content",
            description:
               "Use support channels to flag content that violates community or platform guidelines.",
            content: [
               {
                  id: "intro",
                  title: "Introduction",
                  description:
                     "Reporting inappropriate content helps protect the platform community and keeps interactions safe and respectful for everyone."
               },
               {
                  id: "step-1",
                  title: "Step 1: Identify the issue",
                  description:
                     "Review the content carefully and note why it does not belong on the platform.",
                  steps: [
                     "Capture the page or location where the content appears.",
                     "Write down what is inappropriate or harmful about it."
                  ]
               },
               {
                  id: "step-2",
                  title: "Step 2: Submit a report",
                  description:
                     "Use the support request process to share the content details with the platform team.",
                  steps: [
                     "Include the content location, the reason for the report, and any links needed to review it.",
                     "If possible, explain how the content impacts users or the community."
                  ]
               },
               {
                  id: "step-3",
                  title: "Step 3: Follow up if needed",
                  description:
                     "If the issue is still unresolved, you can follow up with support and provide any new information that may help the team act."
               }
            ]
         }
      ]
   }
}
