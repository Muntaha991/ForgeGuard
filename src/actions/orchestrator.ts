"use server";

import { AnalysisResult } from "@/types/models";
import { redactPii } from "@/lib/utils/piiRedactor";
import { classifyInputType } from "@/lib/utils/inputClassifier";
import { fetchClassifierAnalysis } from "@/lib/services/classifier";
import { fetchTeacherLesson } from "@/lib/services/teacher";

export async function analyzeInputServer(rawInput: string, isImage: boolean = false): Promise<AnalysisResult> {
  try {
    // 1. Redact PII (Server side fallback just in case)
    const { redactedText, count } = redactPii(rawInput);
    
    // 2. Classify Input Type
    const inputType = classifyInputType(redactedText);

    // 3. Classifier LLM Call
    const classifierResult = await fetchClassifierAnalysis(redactedText, inputType);

    // 4. Teacher LLM Call
    const teacherResult = await fetchTeacherLesson(redactedText, classifierResult);

    // 5. Assemble Result
    const result: AnalysisResult = {
      riskLabel: classifierResult.riskLabel,
      confidencePercent: classifierResult.confidence,
      reasons: classifierResult.reasons,
      actionChecklist: classifierResult.actionChecklist,
      teachBackTitle: teacherResult.teachBackTitle,
      teachBackLesson: teacherResult.teachBackLesson,
      analyzedAt: new Date().toISOString(),
      inputPreview: redactedText.substring(0, 50) + (redactedText.length > 50 ? '...' : ''),
      inputType: inputType,
      piiWasRedacted: count > 0,
      piiRedactedCount: count,
    };

    return result;
  } catch (error) {
    console.error("Pipeline failed:", error);
    throw new Error(error instanceof Error ? error.message : "Analysis pipeline failed");
  }
}
