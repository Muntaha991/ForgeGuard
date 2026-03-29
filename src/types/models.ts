export type RiskLabel = 'Safe' | 'Suspicious' | 'High Risk';

export interface ClassifierResponse {
  riskLabel: RiskLabel;
  confidence: number;
  reasons: string[];
  actionChecklist: string[];
}

export interface TeacherResponse {
  teachBackTitle: string;
  teachBackLesson: string;
}

export interface AnalysisResult {
  riskLabel: RiskLabel;
  confidencePercent: number;
  reasons: string[];
  actionChecklist: string[];
  teachBackTitle: string;
  teachBackLesson: string;
  analyzedAt: string; // ISO String
  inputPreview: string;
  inputType: string;
  piiWasRedacted: boolean;
  piiRedactedCount: number;
}
