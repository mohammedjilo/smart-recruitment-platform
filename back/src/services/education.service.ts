import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { z } from "zod";
import { educationSchema } from "../validation/education.validation.js";

type EducationInput = z.infer<typeof educationSchema>;

const getProfileOrThrow = async (userId: string) => {
  
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Professional profile not found", 404);
  }

  return profile;
};

export const createEducation = async (
  userId: string,
  input: EducationInput
) => {

  const profile = await getProfileOrThrow(userId);

  return prisma.education.create({
    data: {
      profileId: profile.id,
      university: input.university,
      degree: input.degree,
      major: input.major,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
    },
  });
};

export const updateEducation = async (
  userId: string,
  educationId: string,
  input: Partial<EducationInput>
) => {
  const profile = await getProfileOrThrow(userId);

  const education = await prisma.education.findFirst({
    where: { id: educationId, profileId: profile.id },
  });

  if (!education) {
    throw new AppError("Education not found", 404);
  }

  return prisma.education.update({
    where: { id: educationId },
    data: {
      ...(input.university !== undefined && { university: input.university }),
      ...(input.degree !== undefined && { degree: input.degree }),
      ...(input.major !== undefined && { major: input.major }),
      ...(input.startDate !== undefined && {
        startDate: new Date(input.startDate),
      }),
      ...(input.endDate !== undefined && {
        endDate: input.endDate ? new Date(input.endDate) : null,
      }),
    },
  });
};
