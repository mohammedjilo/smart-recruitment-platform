import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { z } from "zod";
import { experienceSchema } from "../validation/experience.validation.js";

type ExperienceInput = z.infer<typeof experienceSchema>;

const getProfileOrThrow = async (userId: string) => {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Professional profile not found", 404);
  }

  return profile;
};

export const createExperience = async (
  userId: string,
  input: ExperienceInput
) => {
  const profile = await getProfileOrThrow(userId);

  return prisma.experience.create({
    data: {
      profileId: profile.id,
      companyName: input.companyName,
      position: input.position,
      description: input.description ?? null,
      startDate: new Date(input.startDate),
      endDate: input.endDate ? new Date(input.endDate) : null,
    },
  });
};

export const updateExperience = async (
  userId: string,
  experienceId: string,
  input: Partial<ExperienceInput>
) => {
  const profile = await getProfileOrThrow(userId);

  const experience = await prisma.experience.findFirst({
    where: { id: experienceId, profileId: profile.id },
  });

  if (!experience) {
    throw new AppError("Experience not found", 404);
  }

  return prisma.experience.update({
    where: { id: experienceId },
    data: {
      ...(input.companyName !== undefined && {
        companyName: input.companyName,
      }),
      ...(input.position !== undefined && { position: input.position }),
      ...(input.description !== undefined && {
        description: input.description ?? null,
      }),
      ...(input.startDate !== undefined && {
        startDate: new Date(input.startDate),
      }),
      ...(input.endDate !== undefined && {
        endDate: input.endDate ? new Date(input.endDate) : null,
      }),
    },
  });
};
