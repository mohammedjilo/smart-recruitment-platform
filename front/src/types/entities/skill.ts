export type Skill = {
   id: string
   skillName: string
   slug: string
   createdAt: string
   updatedAt: string
}

export type UserSkill = Skill & {
   userSkillId: string
}

export type JobSkill = {
   id: string
   createdAt: string
   updatedAt: string
   jobId: string
   skillId: string
   skill: Skill
}
