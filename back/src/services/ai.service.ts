import { AppError } from "../utils/appError";
import { aiClient } from "../infrastructure/ai/client.js";
import {
  aiMatchSchema,
  aiRecommendationBatchSchema,
} from "../validation/ai.validation";

const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS) || 8000;

const withAiTimeout = async <T>(operation: Promise<T>) => {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(
          () =>
            reject(
              new AppError("AI request timed out", 504, "AI_TIMEOUT", undefined, {
                source: "google-ai",
                classification: "unexpected",
              })
            ),
          AI_TIMEOUT_MS
        );
      }),
    ]);
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      "AI service is unavailable",
      503,
      "AI_UNAVAILABLE",
      undefined,
      { cause: error, source: "google-ai", classification: "unexpected" }
    );
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

const parseAiResponse = <T>(
  text: string,
  schema: { parse: (input: unknown) => T }
): T => {
  try {
    return schema.parse(JSON.parse(text));
  } catch (error) {
    throw new AppError(
      "AI service returned an invalid response",
      502,
      "AI_INVALID_RESPONSE",
      undefined,
      { cause: error, source: "google-ai", classification: "unexpected" }
    );
  }
};

export async function calculateMatch(
  job: any,
  candidate: any,
  cvFile?: Express.Multer.File
) {
  const jobSkills = job.skills?.map((item: any) => item.skill.skillName) ?? [];

  const jobQuestions =
    job.applicationQuestions?.map((question: any) => ({
      question: question.question,

      type: question.type,

      required: question.required,
    })) ?? [];

  const prompt = `
You are an AI recruitment matching assistant.

Your task is to evaluate how well a candidate
matches a job.

Return ONLY valid JSON.

The JSON format MUST be:

{
  "score": number,
  "recommendation": string,
  "strengths": string[],
  "missingSkills": string[]
}

The score must be between 0 and 100.

Evaluate the candidate based ONLY on
professional qualifications and job-related
information.

Do NOT use:
- name
- email
- phone
- age
- gender
- nationality
- race
- religion
- any other protected personal information

JOB

Title:
${job.title}

Description:
${job.description ?? ""}

Required Experience:
${job.experienceRequired ?? 0}

Required Skills:
${jobSkills.join(", ")}

Job Questions:
${JSON.stringify(jobQuestions, null, 2)}


CANDIDATE

Resume Type:
${candidate.resumeType}


Professional Profile:
${JSON.stringify(candidate.profile, null, 2)}


Questions and Answers:
${JSON.stringify(candidate.questionsAndAnswers, null, 2)}


SCORING CRITERIA

Skills: 40%
Experience: 30%
Education: 10%
Projects/Profile evidence: 10%
Job Questions: 10%


IMPORTANT

Do not penalize the candidate simply because
information is missing from the resume.

Only include a skill in missingSkills if it is
explicitly required by the job and there is
reasonable evidence that the candidate does not
have it.

The recommendation should be concise and useful
for a recruiter.
`;

  const contents: any[] = [
    {
      text: prompt,
    },
  ];

  // ============================================================
  // PDF Resume
  // ============================================================

  if (cvFile) {
    contents.push({
      inlineData: {
        mimeType: cvFile.mimetype,

        data: cvFile.buffer.toString("base64"),
      },
    });
  }

  const response = await withAiTimeout(
    Promise.resolve().then(() =>
      aiClient.models.generateContent({
        // model: "gemini-flash-latest",
        model: "gemini-3.1-flash-lite",
        contents,
      })
    )
  );

  const text = response.text?.trim();

  if (!text) {
    throw new AppError(
      "Recommendation service is unavailable",
      502,
      "AI_UNAVAILABLE",
      undefined,
      { source: "google-ai", classification: "unexpected" }
    );
  }

  // ============================================================
  // Remove markdown JSON fences if Gemini adds them
  // ============================================================

  const cleanedText = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return parseAiResponse(cleanedText, aiMatchSchema);
}

export async function rankRecommendationCandidates(
  candidate: { skills: string[]; yearsOfExperience: number; jobTitle: string },
  jobs: Array<{
    id: string;
    title: string;
    description: string;
    experienceRequired: number;
    skills: string[];
  }>
) {
  const prompt = `
You rank eligible jobs for a candidate. Return ONLY valid JSON with this shape:
{"recommendations":[{"jobId":"uuid","score":0,"recommendation":"short text","strengths":["..."],"missingSkills":["..."]}]}

Rules:
- Rank only the supplied job ids. Do not invent ids.
- score must be between 0 and 100.
- Use only professional qualifications. Ignore identity and contact information.
- Compare candidate skills and yearsOfExperience with each job's required skills and experienceRequired.

CANDIDATE:
${JSON.stringify(candidate)}

JOBS:
${JSON.stringify(jobs)}
`;

  const response = await withAiTimeout(
    Promise.resolve().then(() =>
      aiClient.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: [{ text: prompt }],
      })
    )
  );
  const text = response.text?.trim();
  if (!text)
    throw new AppError(
      "AI returned an empty response",
      502,
      "AI_INVALID_RESPONSE",
      undefined,
      { source: "google-ai", classification: "unexpected" }
    );
  const cleanedText = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = parseAiResponse(cleanedText, aiRecommendationBatchSchema);
  const allowedIds = new Set(jobs.map((job) => job.id));
  return parsed.recommendations.filter((recommendation) =>
    allowedIds.has(recommendation.jobId)
  );
}
