import { ClassifierResponse } from "@/types/models";
import { CLASSIFIER_SYSTEM_PROMPT } from "../constants/prompts";
import { extractJson } from "../utils/jsonExtractor";

export async function fetchClassifierAnalysis(
  input: string, 
  inputType: string
): Promise<ClassifierResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  const userPrompt = `Input Type: ${inputType}\nInput Content:\n${input}\n\nPlease analyze this input according to the system instructions.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: CLASSIFIER_SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || "";
  
  return extractJson(rawContent) as ClassifierResponse;
}
