import { prisma } from "../config/db";
import { AppError } from "../utils/appError";

export const getAllLanguages = async () => {
  return prisma.language.findMany({
    orderBy: { languageName: "asc" },
  });
};

export const createLanguage = async (languageName: string) => {
  const normalizedName = languageName.trim();

  if (!normalizedName) {
    throw new AppError("Language name is required", 400);
  }

  const existing = await prisma.language.findUnique({
    where: { languageName: normalizedName },
  });

  if (existing) {
    throw new AppError("Language already exists", 409);
  }

  return prisma.language.create({
    data: { languageName: normalizedName },
  });
};

export const updateLanguage = async (
  languageId: string,
  languageName: string
) => {
  const normalizedName = languageName.trim();

  if (!normalizedName) {
    throw new AppError("Language name is required", 400);
  }

  const existingLanguage = await prisma.language.findUnique({
    where: { id: languageId },
  });

  if (!existingLanguage) {
    throw new AppError("Language not found", 404);
  }

  const duplicate = await prisma.language.findUnique({
    where: { languageName: normalizedName },
  });

  if (duplicate && duplicate.id !== languageId) {
    throw new AppError("Language already exists", 409);
  }

  return prisma.language.update({
    where: { id: languageId },
    data: { languageName: normalizedName },
  });
};

export const deleteLanguage = async (languageId: string) => {
  const existingLanguage = await prisma.language.findUnique({
    where: { id: languageId },
  });

  if (!existingLanguage) {
    throw new AppError("Language not found", 404);
  }

  await prisma.language.delete({ where: { id: languageId } });

  return { message: "Language deleted successfully" };
};
