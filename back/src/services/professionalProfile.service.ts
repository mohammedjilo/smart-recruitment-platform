import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";

/**
 * Professional profile read service. It exposes a safe profile projection and
 * keeps completion calculations separate from authentication and transport.
 */

export const getProfessionalProfile = async (userId: string) => {
  const profile = await prisma.professionalProfile.findUnique({
    where: {
      userId: userId,
    },
    select: {
      id: true,
      jobTitle: true,
      summary: true,
      yearsOfExperience: true,
      cvPath: true,
      createdAt: true,
      updatedAt: true,
      educations: {
        select: {
          id: true,
          university: true,
          degree: true,
          major: true,
          startDate: true,
          endDate: true,
        },
      },
      experiences: {
        select: {
          id: true,
          companyName: true,
          position: true,
          description: true,
          startDate: true,
          endDate: true,
        },
      },
      projects: {
        select: {
          id: true,
          title: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      certificates: {
        select: {
          id: true,
          certificateName: true,
          organization: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          country: true,
          profilePicId: true,
          profilePicUrl: true,
          skills: {
            select: {
              skill: { select: { id: true, skillName: true, slug: true } },
            },
          },
        },
      },
    },
  });
  if (!profile) {
    throw new AppError("Professional profile not found", 404);
  }

  // Calculate completion
  const basicInformation = !!profile.jobTitle && !!profile.yearsOfExperience;

  const educations = profile.educations.length > 0;

  const experiences = profile.experiences.length > 0;

  const skills = profile.user.skills.length > 0;

  const projects = profile.projects.length > 0;

  const certificates = profile.certificates.length > 0;

  const sections = [
    basicInformation,
    educations,
    experiences,
    skills,
    projects,
    certificates,
  ];

  const completedSections = sections.filter(Boolean).length;

  const percentage = Math.round((completedSections / sections.length) * 100);
  const isCompleted =
    basicInformation &&
    skills &&
    educations &&
    experiences &&
    projects &&
    certificates;

  return {
    profile,
    completion: {
      percentage,
      basicInformation,
      educations,
      experiences,
      skills,
      projects,
      certificates,
      isCompleted,
    },
  };
};

// export const professionalProfileIsCompleted= async (userId: string) => {
//   const profile = await prisma.professionalProfile.findUnique({
//     where: {
//       userId: userId,
//     },select:{isCompleted:true}

//   });
//   if (!profile) {
//     throw new AppError("Professional profile not found", 404);
//   }
//   return {
//     profile
//   };
// }
