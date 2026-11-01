import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";

export const getAdminUserProfessionalProfile = async (
  userId: string,
  isDemoAdmin = false
) => {
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
    select: {
      id: true,
      languages: {
        orderBy: { language: { languageName: "asc" } },
        select: {
          id: true,
          level: true,
          createdAt: true,
          updatedAt: true,
          language: {
            select: {
              id: true,
              languageName: true,
              createdAt: true,
              updatedAt: true,
            },
          },
        },
      },
      profile: {
        select: {
          id: true,
          userId: true,
          jobTitle: true,
          summary: true,
          yearsOfExperience: true,
          cvPath: true,
          cvPublicId: true,
          cvResourceType: true,
          cvDeliveryType: true,
          createdAt: true,
          updatedAt: true,
          educations: {
            orderBy: { startDate: "desc" },
            select: {
              id: true,
              university: true,
              degree: true,
              major: true,
              startDate: true,
              endDate: true,
              createdAt: true,
              updatedAt: true,
              profileId: true,
            },
          },
          experiences: {
            orderBy: { startDate: "desc" },
            select: {
              id: true,
              companyName: true,
              position: true,
              description: true,
              startDate: true,
              endDate: true,
              createdAt: true,
              updatedAt: true,
              profileId: true,
            },
          },
          projects: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              title: true,
              description: true,
              createdAt: true,
              updatedAt: true,
              profileId: true,
            },
          },
          certificates: {
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              certificateName: true,
              organization: true,
              createdAt: true,
              updatedAt: true,
              profileId: true,
            },
          },
        },
      },
      skills: {
        select: {
          skill: { select: { id: true, skillName: true, slug: true } },
        },
      },
    },
  });

  if (!user) throw new AppError("User not found", 404);

  if (!user.profile) return null;

  const {
    cvPath: _cvPath,
    cvPublicId,
    cvResourceType: _cvResourceType,
    cvDeliveryType: _cvDeliveryType,
    ...safeProfile
  } = user.profile;
  return {
    ...safeProfile,
    hasCv: isDemoAdmin ? false : Boolean(cvPublicId),
    skills: user.skills.map(({ skill }) => skill),
    languages: user.languages.map(({ language, ...userLanguage }) => ({
      ...language,
      createdAt: userLanguage.createdAt,
      updatedAt: userLanguage.updatedAt,
      userLanguageId: userLanguage.id,
      level: userLanguage.level,
    })),
  };
};
