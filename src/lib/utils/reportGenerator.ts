import { AnalysisResult } from "@/types/models";

export function generateReport(result: AnalysisResult): string {
  let report = `### Security Analysis Report\n`;
  report += `**Risk Level:** ${result.riskLabel} (${result.confidencePercent}% Confidence)\n\n`;
  report += `**Analyzed At:** ${new Date(result.analyzedAt).toLocaleString()}\n`;
  report += `**Input Type:** ${result.inputType}\n\n`;

  report += `#### Top 3 Reasons:\n`;
  result.reasons.forEach((reason, index) => {
    report += `${index + 1}. ${reason}\n`;
  });
  report += `\n`;

  report += `#### Recommended Actions:\n`;
  result.actionChecklist.forEach((action, index) => {
    report += `- ${action}\n`;
  });
  report += `\n`;

  report += `#### ${result.teachBackTitle}\n`;
  report += `${result.teachBackLesson}\n`;

  return report;
}
