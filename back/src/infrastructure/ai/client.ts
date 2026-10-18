import { GoogleGenAI } from "@google/genai";

/** Infrastructure-only AI client; prompts and business decisions stay in services. */

export const aiClient = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
