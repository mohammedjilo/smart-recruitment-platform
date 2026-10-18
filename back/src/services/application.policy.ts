import { AppError } from "../utils/appError";
import { isDateOnOrAfterToday } from "@smart-recruitment/validation";

/**
 * Pure Application rules. These checks intentionally do not access HTTP or
 * Prisma so they can be reused before and inside persistence boundaries.
 */

type ApplicationQuestion = {
  id: string;
  question: string;
  type: string;
  required: boolean;
  options: unknown;
  minSelection: number | null;
  maxSelection: number | null;
  minNumber: number | null;
  maxNumber: number | null;
};

type ApplicationAnswer = {
  questionId: string;
  answer: string | string[];
};

const getOptions = (options: unknown) =>
  Array.isArray(options) &&
  options.every((option) => typeof option === "string")
    ? options
    : [];

const isAnswerValid = (
  answer: ApplicationAnswer["answer"],
  question: ApplicationQuestion
) => {
  const options = getOptions(question.options);
  if (question.type === "YES_NO") {
    return (
      typeof answer === "string" &&
      ["YES", "NO", "true", "false"].includes(answer)
    );
  }
  if (question.type === "TEXT") return typeof answer === "string";
  if (question.type === "NUMBER") {
    if (typeof answer !== "string" || answer.trim() === "") return false;
    const value = Number(answer);
    return (
      Number.isFinite(value) &&
      (question.minNumber === null || value >= question.minNumber) &&
      (question.maxNumber === null || value <= question.maxNumber)
    );
  }
  if (question.type === "SINGLE_CHOICE") {
    return typeof answer === "string" && options.includes(answer);
  }
  if (question.type === "MULTIPLE_CHOICE") {
    if (
      !Array.isArray(answer) ||
      answer.some((value) => !options.includes(value))
    )
      return false;
    return (
      (question.minSelection === null ||
        answer.length >= question.minSelection) &&
      (question.maxSelection === null || answer.length <= question.maxSelection)
    );
  }
  return false;
};

export const validateAnswerForQuestion = isAnswerValid;

export const assertJobAcceptsApplications = (
  status: string,
  deadline: Date
) => {
  /** Applications require both an OPEN job and a future deadline. */
  if (status !== "OPEN") {
    throw new AppError(
      "This job is not accepting applications",
      409,
      "JOB_NOT_OPEN"
    );
  }
  if (!isDateOnOrAfterToday(deadline)) {
    throw new AppError(
      "This job deadline has passed",
      409,
      "JOB_DEADLINE_PASSED"
    );
  }
};

export const validateApplicationAnswers = (
  questions: ApplicationQuestion[],
  answers: ApplicationAnswer[]
) => {
  /** Validates question ownership, required answers, types, options, and ranges. */
  const questionMap = new Map(
    questions.map((question) => [question.id, question])
  );
  for (const answer of answers) {
    const question = questionMap.get(answer.questionId);
    if (!question) {
      throw new AppError(
        "Question does not belong to this job",
        400,
        "QUESTION_JOB_MISMATCH"
      );
    }
    if (!isAnswerValid(answer.answer, question)) {
      throw new AppError(
        `Invalid answer for question "${question.question}"`,
        400,
        "INVALID_QUESTION_ANSWER"
      );
    }
  }

  for (const question of questions) {
    const answer = answers.find((item) => item.questionId === question.id);
    if (
      question.required &&
      (!answer ||
        answer.answer === "" ||
        (Array.isArray(answer.answer) && answer.answer.length === 0))
    ) {
      throw new AppError(
        `Question "${question.question}" is required`,
        400,
        "REQUIRED_QUESTION_MISSING"
      );
    }
  }
};

export const buildQuestionSnapshot = (questions: ApplicationQuestion[]) =>
  questions.map((question) => ({
    id: question.id,
    question: question.question,
    type: question.type,
    required: question.required,
    options: question.options,
    minSelection: question.minSelection,
    maxSelection: question.maxSelection,
    minNumber: question.minNumber,
    maxNumber: question.maxNumber,
  }));
