import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
const normalizeSkill = (skill: string) => {
  return skill.trim().toLowerCase().replace(/\s+/g, "-");
};
export const addUserSkills = async (userId: string, skills: string[]) => {
  if (!skills || skills.length === 0) {
    throw new AppError("At least one skill is required", 400);
  }

  const uniqueSkills = Array.from(
    new Map(
      skills
        .map((skill) => skill.trim())
        .filter(Boolean)
        .map((skill) => [normalizeSkill(skill), skill])
    ).values()
  );

  return prisma.$transaction(async (tx) => {
    const skillRecords = [];

    for (const skillName of uniqueSkills) {
      const slug = normalizeSkill(skillName);

      const skill = await tx.skill.upsert({
        where: {
          slug,
        },

        update: {},

        create: {
          skillName,
          slug,
        },
      });

      skillRecords.push(skill);
    }

    await tx.userSkill.createMany({
      data: skillRecords.map((skill) => ({
        userId,
        skillId: skill.id,
      })),
      skipDuplicates: true,
    });

    return skillRecords;
  });
};
export const updateUserSkills = async (userId: string, skills: string[]) => {
  if (!skills || skills.length === 0) {
    throw new AppError("At least one skill is required", 400);
  }

  const uniqueSkills = Array.from(
    new Map(
      skills
        .map((skill) => skill.trim())
        .filter(Boolean)
        .map((skill) => [normalizeSkill(skill), skill])
    ).values()
  );

  return prisma.$transaction(async (tx) => {
    const skillRecords = [];

    for (const skillName of uniqueSkills) {
      const slug = normalizeSkill(skillName);

      const skill = await tx.skill.upsert({
        where: {
          slug,
        },

        update: {},

        create: {
          skillName,
          slug,
        },
      });

      skillRecords.push(skill);
    }

    await tx.userSkill.deleteMany({
      where: {
        userId,
      },
    });

    await tx.userSkill.createMany({
      data: skillRecords.map((skill) => ({
        userId,
        skillId: skill.id,
      })),

      skipDuplicates: true,
    });

    return skillRecords;
  });
};
