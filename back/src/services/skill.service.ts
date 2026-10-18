import { prisma } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { z } from "zod";
import { skillSchema } from "../validation/skill.validation.js";

type SkillInput = z.infer<typeof skillSchema>;
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
export const removeUserSkill = async (userId: string, skillId: string) => {
  const userSkill = await prisma.userSkill.findUnique({
    where: {
      userId_skillId: {
        userId,
        skillId,
      },
    },
  });

  if (!userSkill) {
    throw new AppError("Skill is not associated with this user", 404);
  }

  await prisma.userSkill.delete({
    where: {
      userId_skillId: {
        userId,
        skillId,
      },
    },
  });

  return {
    message: "Skill removed successfully",
  };
};
export const createSkill = async (input: SkillInput) => {
  const skillName = input.skillName.trim();
  const slug = normalizeSkill(skillName);

  const existingSkill = await prisma.skill.findUnique({
    where: { slug },
  });

  if (existingSkill) {
    throw new AppError("Skill already exists", 409);
  }

  return prisma.skill.create({
    data: {
      skillName,
      slug,
    },
  });
};

export const updateSkill = async (
  skillId: string,
  input: Partial<SkillInput>
) => {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  const nextSkillName = input.skillName?.trim();
  const data = nextSkillName
    ? {
        skillName: nextSkillName,
        slug: normalizeSkill(nextSkillName),
      }
    : {};

  return prisma.skill.update({
    where: { id: skillId },
    data,
  });
};

export const deleteSkill = async (skillId: string) => {
  const skill = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!skill) {
    throw new AppError("Skill not found", 404);
  }

  await prisma.skill.delete({ where: { id: skillId } });
  return { message: "Skill deleted successfully" };
};
