'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'forgeguard:scan-history';

export type ScanHistoryItem = {
  id: string;
  scannedAt: string;
  risk?: 'Safe' | 'Suspicious' | 'High Risk';
  confidence?: number;
  topReasons?: string[];
  actions?: string[];
  microLesson?: string;
  references?: string[];
  inputPreview?: string;
  inputType?: 'text' | 'url' | 'image' | 'pdf';
  _blocked?: boolean;
};

type IncomingScan = Omit<ScanHistoryItem, 'id' | 'scannedAt'>;

function readStoredHistory(): ScanHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScanHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistHistory(history: ScanHistoryItem[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setHistory(readStoredHistory());
    setIsLoaded(true);
  }, []);

  const addScan = useCallback((scan: IncomingScan) => {
    setHistory((prev) => {
      const nextItem: ScanHistoryItem = {
        ...scan,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        scannedAt: new Date().toISOString(),
      };
      const next = [nextItem, ...prev];
      persistHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return { history, isLoaded, addScan, clearHistory };
}
