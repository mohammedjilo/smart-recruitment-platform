import { prisma } from "../config/db";
import { AppError } from "../utils/appError";
import { rankRecommendationCandidates } from "./ai.service";
import type { AiRecommendation } from "../validation/ai.validation";
import {
  getErrorDiagnostics,
  writeStructuredLog,
} from "../utils/structuredLogger.js";

/**
 * Stateless recommendation engine. It reads current profile/jobs, performs a
 * deterministic local pre-ranking, optionally asks AI to score a small batch,
 * and never persists recommendations as business records.
 */

const LOCAL_CANDIDATE_LIMIT = 30;
const AI_CANDIDATE_LIMIT = 10;
const RESULT_LIMIT = 5;

type RecommendationJob = {
  id: string;
  title: string;
  description: string;
  salary: number | null;
  experienceRequired: number;
  slug: string;
  deadline: Date;
  createdAt: Date;
  company: {
    id: string;
    companyName: string;
    slug: string | null;
    logoUrl: string | null;
    location: string | null;
  };
  skills: Array<{ skill: { skillName: string } }>;
};

type RecommendationUser = {
  profile: {
    jobTitle: string | null;
    yearsOfExperience: number | null;
  } | null;
  skills: Array<{ skill: { skillName: string } }>;
};

const normalize = (value: string) => value.trim().toLowerCase();

const localScore = (job: RecommendationJob, user: RecommendationUser) => {
  const userSkills = new Set(
    user.skills.map(({ skill }) => normalize(skill.skillName))
  );
  const jobSkills = job.skills.map(({ skill }) => normalize(skill.skillName));
  const matchingSkills = jobSkills.filter((skill) =>
    userSkills.has(skill)
  ).length;
  const skillScore =
    jobSkills.length === 0 ? 0 : matchingSkills / jobSkills.length;
  const experience = user.profile?.yearsOfExperience ?? 0;
  const experienceScore = Math.min(
    experience / Math.max(job.experienceRequired, 1),
    1
  );
  const title = normalize(user.profile?.jobTitle ?? "");
  const titleScore = title && normalize(job.title).includes(title) ? 1 : 0;
  return skillScore * 0.6 + experienceScore * 0.3 + titleScore * 0.1;
};

const toFallbackRecommendation = (
  job: RecommendationJob,
  score: number
): AiRecommendation => ({
  jobId: job.id,
  score: Math.round(score * 100),
  recommendation: "Matches your current professional profile.",
  strengths: [],
  missingSkills: [],
});

const toResponse = (
  job: RecommendationJob,
  recommendation: AiRecommendation
) => ({
  id: job.id,
  title: job.title,
  slug: job.slug,
  salary: job.salary,
  experienceRequired: job.experienceRequired,
  deadline: job.deadline,
  skills: job.skills.map(({ skill }) => skill.skillName),
  createdAt: job.createdAt,
  company: job.company,
  matchScore: recommendation.score,
  recommendation: recommendation.recommendation,
  strengths: recommendation.strengths,
  missingSkills: recommendation.missingSkills,
});

export const getRecommendedJobs = async (
  userId: string,
  requestId?: string
) => {
  /** AI is called at most once; deterministic ranking remains the fallback. */
  const now = new Date();
  const [user, jobs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        profile: { select: { jobTitle: true, yearsOfExperience: true } },
        skills: { select: { skill: { select: { skillName: true } } } },
      },
    }),
    prisma.job.findMany({
      where: {
        status: "OPEN",
        deadline: { gt: now },
        applications: { none: { userId } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        salary: true,
        experienceRequired: true,
        slug: true,
        deadline: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            companyName: true,
            slug: true,
            logoUrl: true,
            location: true,
          },
        },
        skills: { select: { skill: { select: { skillName: true } } } },
      },
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
      take: LOCAL_CANDIDATE_LIMIT,
    }),
  ]);

  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  if (jobs.length === 0) return [];

  const rankedLocally = jobs
    .map((job) => ({ job, score: localScore(job, user) }))
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.job.deadline.getTime() - right.job.deadline.getTime()
    );
  const aiCandidates = rankedLocally.slice(0, AI_CANDIDATE_LIMIT);
  const candidate = {
    jobTitle: user.profile?.jobTitle ?? "",
    yearsOfExperience: user.profile?.yearsOfExperience ?? 0,
    skills: user.skills.map(({ skill }) => skill.skillName),
  };
  const aiJobs = aiCandidates.map(({ job }) => ({
    id: job.id,
    title: job.title,
    description: job.description,
    experienceRequired: job.experienceRequired,
    skills: job.skills.map(({ skill }) => skill.skillName),
  }));

  let recommendations: AiRecommendation[];
  try {
    recommendations = await rankRecommendationCandidates(candidate, aiJobs);
  } catch (error) {
    writeStructuredLog("warn", "recommendation.ai_fallback", {
      source: "google-ai",
      ...(requestId ? { requestId } : {}),
      errorCode: error instanceof AppError ? error.code : "AI_UNAVAILABLE",
      ...getErrorDiagnostics(error),
    });
    recommendations = aiCandidates.map(({ job, score }) =>
      toFallbackRecommendation(job, score)
    );
  }

  const recommendationById = new Map(
    recommendations.map((recommendation) => [
      recommendation.jobId,
      recommendation,
    ])
  );
  return aiCandidates
    .map(({ job, score }) => ({
      job,
      recommendation:
        recommendationById.get(job.id) ?? toFallbackRecommendation(job, score),
    }))
    .sort(
      (left, right) => right.recommendation.score - left.recommendation.score
    )
    .slice(0, RESULT_LIMIT)
    .map(({ job, recommendation }) => toResponse(job, recommendation));
};
