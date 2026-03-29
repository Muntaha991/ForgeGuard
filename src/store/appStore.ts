import { create } from 'zustand';
import { AnalysisResult } from '@/types/models';

export type UserTier = 'Guest' | 'Free' | 'Pro';

interface AppState {
  // Auth & Tier state
  isLoggedIn: boolean;
  userProfile: { name: string; email: string } | null;
  userTier: UserTier;
  login: () => void;
  logout: () => void;
  setTier: (tier: UserTier) => void;
  
  // App state
  history: AnalysisResult[];
  locale: string;
  privacyMode: boolean;
  addHistoryItem: (item: AnalysisResult) => void;
  setLocale: (locale: string) => void;
  togglePrivacyMode: () => void;
}

// Helper to generate mock history data for the dashboard
const generateMockHistory = (): AnalysisResult[] => {
  const mockItems: AnalysisResult[] = [];
  const now = new Date();
  
  // 6 High Risk Items. Make 3 of them contain redacted PII to trigger the Targeted Threat Alert.
  for (let i = 0; i < 6; i++) {
    const isTargeted = i < 3; // First 3 are targeted PII attacks
    mockItems.push({
      riskLabel: 'High Risk',
      confidencePercent: 95 + i,
      reasons: ['Urgent tone detected', 'Suspicious URL domain', isTargeted ? 'Phishing attempt referencing personal information' : 'Requests sensitive info'],
      actionChecklist: ['Do not click links', 'Report sender', isTargeted ? 'Monitor your financial accounts' : 'Block number'],
      teachBackTitle: 'Spotting Phishing Links',
      teachBackLesson: 'Always verify the domain name before clicking.',
      analyzedAt: new Date(now.getTime() - i * 86400000).toISOString(),
      inputPreview: isTargeted 
        ? `URGENT REDACTED_NAME: Your REDACTED_BANK account ending in REDACTED_NUM is locked. Click here: http://secure-update-account-${i}.xyz`
        : `URGENT: Your account will be locked in 24 hours. Click here: http://secure-update-account-${i}.xyz`,
      inputType: 'url',
      piiWasRedacted: isTargeted,
      piiRedactedCount: isTargeted ? 3 : 0,
    });
  }
  
  // 2 Safe Items
  for (let i = 0; i < 2; i++) {
    mockItems.push({
      riskLabel: 'Safe',
      confidencePercent: 88,
      reasons: ['Known safe sender', 'Standard language'],
      actionChecklist: ['Safe to open'],
      teachBackTitle: 'Safe Communication',
      teachBackLesson: 'This message uses standard protocols.',
      analyzedAt: new Date(now.getTime() - (i + 10) * 86400000).toISOString(),
      inputPreview: `Hey, just checking in about our meeting tomorrow.`,
      inputType: 'text',
      piiWasRedacted: true,
      piiRedactedCount: 1,
    });
  }
  
  return mockItems;
};

export const useAppStore = create<AppState>((set) => ({
  // Initial Auth State
  isLoggedIn: false,
  userProfile: null,
  userTier: 'Guest',
  login: () => set({ isLoggedIn: true, userTier: 'Pro', userProfile: { name: 'John Doe', email: 'john.doe@example.com' } }),
  logout: () => set({ isLoggedIn: false, userTier: 'Guest', userProfile: null }),
  setTier: (tier) => set({ userTier: tier }),

  // Initial App State
  history: generateMockHistory(),
  locale: 'en',
  privacyMode: true,
  addHistoryItem: (item) => set((state) => ({ history: [item, ...state.history] })),
  setLocale: (locale) => set({ locale }),
  togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),
}));
