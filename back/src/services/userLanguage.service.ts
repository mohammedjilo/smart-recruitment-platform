import { prisma } from "../config/db";
import { AppError } from "../utils/appError";

type LanguageLevelValue =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "FLUENT"
  | "NATIVE";

const normalizeLanguageName = (value: string) => value.trim();

const ensureLanguage = async (languageName: string) => {
  const normalizedName = normalizeLanguageName(languageName);

  if (!normalizedName) {
    throw new AppError("Language name is required", 400);
  }

  const existingLanguage = await prisma.language.findUnique({
    where: { languageName: normalizedName },
  });

  if (existingLanguage) {
    return existingLanguage;
  }

  return prisma.language.create({
    data: { languageName: normalizedName },
  });
};

export const addUserLanguage = async (
  userId: string,
  input: { languageName: string; level: LanguageLevelValue }
) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  const language = await ensureLanguage(input.languageName);

  const existingUserLanguage = await prisma.userLanguage.findUnique({
    where: {
      userId_languageId: {
        userId,
        languageId: language.id,
      },
    },
  });

  if (existingUserLanguage) {
    return prisma.userLanguage.update({
      where: { id: existingUserLanguage.id },
      data: { level: input.level },
      include: { language: true },
    });
  }

  return prisma.userLanguage.create({
    data: {
      userId,
      languageId: language.id,
      level: input.level,
    },
    include: { language: true },
  });
};

export const updateUserLanguage = async (
  userId: string,
  userLanguageId: string,
  level: LanguageLevelValue
) => {
  const existingUserLanguage = await prisma.userLanguage.findFirst({
    where: { id: userLanguageId, userId },
  });

  if (!existingUserLanguage) {
    throw new AppError("User language not found", 404);
  }

  return prisma.userLanguage.update({
    where: { id: userLanguageId },
    data: { level },
    include: { language: true },
  });
};
