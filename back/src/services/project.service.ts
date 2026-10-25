import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { z } from "zod";
import { projectSchema } from "../validation/project.validation.js";

type ProjectInput = z.infer<typeof projectSchema>;

const getProfileOrThrow = async (userId: string) => {
  const profile = await prisma.professionalProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new AppError("Professional profile not found", 404);
  }

  return profile;
};

export const createProject = async (userId: string, input: ProjectInput) => {
  const profile = await getProfileOrThrow(userId);

  return prisma.project.create({
    data: {
      profileId: profile.id,
      title: input.title,
      description: input.description ?? null,
    },
  });
};

export const updateProject = async (
  userId: string,
  projectId: string,
  input: Partial<ProjectInput>
) => {
  const profile = await getProfileOrThrow(userId);

  const project = await prisma.project.findFirst({
    where: { id: projectId, profileId: profile.id },
  });

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && {
        description: input.description ?? null,
      }),
    },
  });
};
