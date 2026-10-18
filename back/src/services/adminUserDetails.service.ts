import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";

export const getAdminUserProfessionalProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      profile: {
        select: {
          id: true,
          userId: true,
          jobTitle: true,
          summary: true,
          yearsOfExperience: true,
          cvPath: true,
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

  return {
    ...user.profile,
    skills: user.skills.map(({ skill }) => skill),
  };
};
