import { create } from 'zustand';
import { AnalysisResult } from '@/types/models';

interface AppState {
  history: AnalysisResult[];
  locale: string;
  privacyMode: boolean;
  addHistoryItem: (item: AnalysisResult) => void;
  setLocale: (locale: string) => void;
  togglePrivacyMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  history: [],
  locale: 'en',
  privacyMode: true,
  addHistoryItem: (item) => set((state) => ({ history: [item, ...state.history] })),
  setLocale: (locale) => set({ locale }),
  togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),
}));
