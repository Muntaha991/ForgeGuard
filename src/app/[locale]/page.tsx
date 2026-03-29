'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Menu, Globe, Download, Image as ImageIcon, ChevronDown, ShieldCheck, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInput, { AnalysisPayload, cn } from '@/components/ChatInput';
import RiskBadge, { RiskLevel } from '@/components/RiskBadge';
import ActionChecklist from '@/components/ActionChecklist';
import Sidebar from '@/components/Sidebar';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { downloadReportAsPDF } from '@/lib/utils/pdfDownloader';
import { Capacitor } from '@capacitor/core';

type AnalysisResult = {
  risk: RiskLevel;
  confidence: number;
  topReasons: string[];
  actions: string[];
  microLesson: string;
  references?: string[];
  inputPreview?: string;
  inputType?: 'text' | 'url' | 'image' | 'pdf';
  _blocked?: boolean;
};

type StoredViewState = {
  result: AnalysisResult | null;
  error: string;
  privacyRedacted: boolean;
  lastPayload: AnalysisPayload | null;
  reanalyzeOnMount: boolean;
};

const VIEW_STATE_KEY = 'forgeguard:view-state';
const SKIP_LOCALE_SWITCH_MOTION_KEY = 'forgeguard:skip-locale-switch-motion';

export default function Home() {
  const [disableMotion, setDisableMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return sessionStorage.getItem(SKIP_LOCALE_SWITCH_MOTION_KEY) === '1';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRelocalizing, setIsRelocalizing] = useState(false);
  const [error, setError] = useState('');
  const [privacyRedacted, setPrivacyRedacted] = useState(false);
  const [lastPayload, setLastPayload] = useState<AnalysisPayload | null>(null);

  // Handle responsive sidebar defaults after hydration
  useEffect(() => {
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  // Auto-dismiss privacy toast after 6 seconds — only starts AFTER loading finishes
  useEffect(() => {
    if (privacyRedacted && !isLoading) {
      const timer = setTimeout(() => setPrivacyRedacted(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [privacyRedacted, isLoading]);

  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('HomePage');
  const isNativePlatform = Capacitor.isNativePlatform();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [typedTitle, setTypedTitle] = useState('');
  const [titlePhraseIndex, setTitlePhraseIndex] = useState(0);
  const [isDeletingTitle, setIsDeletingTitle] = useState(false);

  const titlePhrases = [
    t('cue1'),
    t('cue2'),
    t('cue3'),
  ];
  const shouldAnimate = !disableMotion;

  useEffect(() => {
    if (!disableMotion) return;

    sessionStorage.removeItem(SKIP_LOCALE_SWITCH_MOTION_KEY);
    const frame = requestAnimationFrame(() => setDisableMotion(false));
    return () => cancelAnimationFrame(frame);
  }, [disableMotion]);

  useEffect(() => {
    setTypedTitle('');
    setTitlePhraseIndex(0);
    setIsDeletingTitle(false);
  }, [locale]);

  useEffect(() => {
    const currentPhrase = titlePhrases[titlePhraseIndex] || '';
    const isPhraseComplete = typedTitle === currentPhrase;
    const isPhraseEmpty = typedTitle.length === 0;

    let timeoutId: ReturnType<typeof setTimeout>;

    if (!isDeletingTitle && isPhraseComplete) {
      timeoutId = setTimeout(() => setIsDeletingTitle(true), 1300);
    } else if (isDeletingTitle && isPhraseEmpty) {
      timeoutId = setTimeout(() => {
        setIsDeletingTitle(false);
        setTitlePhraseIndex((prev) => (prev + 1) % titlePhrases.length);
      }, 220);
    } else {
      const speed = isDeletingTitle ? 40 : 60;
      timeoutId = setTimeout(() => {
        setTypedTitle((prev) => {
          if (isDeletingTitle) {
            return currentPhrase.slice(0, Math.max(prev.length - 1, 0));
          }
          return currentPhrase.slice(0, prev.length + 1);
        });
      }, speed);
    }

    return () => clearTimeout(timeoutId);
  }, [typedTitle, isDeletingTitle, titlePhraseIndex, titlePhrases]);

  const runAnalysis = async (payload: AnalysisPayload, targetLocale: string) => {
    setIsLoading(true);
    setIsRelocalizing(false);
    setError('');
    setResult(null);
    setPrivacyRedacted(!!payload.wasRedacted);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, locale: targetLocale }),
      });
      if (!response.ok) throw new Error('Analysis failed.');
      setResult(await response.json());
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Error occurred');
      } else {
        setError('Error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const rerunForLocale = async (payload: AnalysisPayload, targetLocale: string) => {
    setIsRelocalizing(true);
    setError('');
    setPrivacyRedacted(!!payload.wasRedacted);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, locale: targetLocale }),
      });
      if (!response.ok) throw new Error('Analysis failed.');
      setResult(await response.json());
    } catch {
      // Keep showing the previous result if translation re-run fails.
    } finally {
      setIsRelocalizing(false);
    }
  };

  useEffect(() => {
    const savedState = sessionStorage.getItem(VIEW_STATE_KEY);
    if (!savedState) return;

    sessionStorage.removeItem(VIEW_STATE_KEY);

    try {
      const parsedState = JSON.parse(savedState) as StoredViewState;
      setResult(parsedState.result);
      setError(parsedState.error);
      setPrivacyRedacted(parsedState.privacyRedacted);
      setLastPayload(parsedState.lastPayload);

      if (parsedState.reanalyzeOnMount && parsedState.lastPayload) {
        void rerunForLocale(parsedState.lastPayload, locale);
      }
    } catch {
      // Ignore malformed session state and fall back to defaults.
    }
  }, []);

  const switchLocale = (newLocale: string) => {
    if (newLocale === locale) {
      setDropdownOpen(false);
      return;
    }

    const reanalyzeOnMount = !!(result && lastPayload && !isLoading);
    const stateToStore: StoredViewState = {
      result,
      error,
      privacyRedacted,
      lastPayload,
      reanalyzeOnMount,
    };

    try {
      sessionStorage.setItem(VIEW_STATE_KEY, JSON.stringify(stateToStore));
      sessionStorage.setItem(SKIP_LOCALE_SWITCH_MOTION_KEY, '1');
    } catch {
      // If persistence fails (e.g. storage limits), continue with navigation.
    }

    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/') || '/');
    setDropdownOpen(false);
  };

  const handleAnalyze = async (payload: AnalysisPayload) => {
    setLastPayload(payload);
    await runAnalysis(payload, locale);
  };

  const handleNewChat = () => {
    setResult(null);
    setError('');
  };

  return (
    <div className="flex w-full h-full font-sans bg-black">

      {/* Sidebar Overlay/Structure */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} onNewChat={handleNewChat} />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 relative flex flex-col h-full overflow-y-auto bg-cover bg-bottom",
          result
            ? "bg-[#06080b] bg-none"
            : "bg-[url('/mobile-background.png')] md:bg-[url('/desktop-background.png')]"
        )}
      >

        {/* Top Navigation */}
        <div style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 1.5rem)' }} className="w-full flex justify-between items-center px-6 pb-6 mb-2 sm:mb-6 relative z-50 pointer-events-auto">
          <button
            onClick={() => result ? handleNewChat() : setSidebarOpen(!sidebarOpen)}
            className="w-11 h-11 rounded-full bg-zinc-900 border border-white/5 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            {result ? <ArrowLeft size={20} /> : <Menu size={20} />}
          </button>

          {result && (
            <h2 className="text-white font-medium text-lg absolute left-1/2 transform -translate-x-1/2 tracking-wide hidden sm:block text-center">
              {t('report')}
              {isRelocalizing && (
                <span className="block text-xs font-normal tracking-normal text-white/60 mt-1">
                  {t('translating')}
                </span>
              )}
            </h2>
          )}

          <div className="relative ml-auto z-50">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-900 border border-white/5 backdrop-blur-md text-white/90 hover:bg-zinc-800 transition-colors text-sm font-semibold tracking-wide"
            >
              <Globe size={18} />
              {locale === 'en' ? 'ENG' : 'ESP'}
              <ChevronDown size={14} className="ml-1 opacity-70" />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={shouldAnimate ? { opacity: 0, y: -10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldAnimate ? { opacity: 0, y: -10 } : undefined}
                  className="absolute top-full right-0 mt-2 w-36 bg-[#121214] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 flex flex-col"
                >
                  <button
                    onClick={() => switchLocale('en')}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${locale === 'en' ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                  >
                    English (ENG)
                  </button>
                  <div className="h-px w-full bg-white/5" />
                  <button
                    onClick={() => switchLocale('es')}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${locale === 'es' ? 'bg-white/10 text-white font-medium' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                  >
                    Español (ESP)
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Dynamic Main Body */}
        <div style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 5rem)' }} className={`flex-1 flex flex-col items-center ${!result ? 'justify-center -mt-20' : ''} px-6 md:px-12 w-full relative z-20`}>

          <AnimatePresence mode="wait">
            {!result && !isLoading && !error && (
              <motion.div
                key="empty"
                initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldAnimate ? { opacity: 0, scale: 0.95 } : undefined}
                className="w-full flex flex-col items-center"
              >
                {/* Center Logo & Text */}
                <div className="mb-4 text-white flex justify-center">
                  <Image src="/forge-logo.svg" alt="ForgeGuard Logo" width={48} height={48} priority />
                </div>
                <h1 className="text-3xl md:text-[40px] font-display font-semibold text-white tracking-tight leading-tight mb-8 text-center drop-shadow-md">
                  {typedTitle}
                  <motion.span
                    aria-hidden="true"
                    animate={shouldAnimate ? { opacity: [1, 0, 1] } : { opacity: 1 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
                    className="inline-block ml-1 align-middle text-white/80"
                  >
                    |
                  </motion.span>
                </h1>

                <div className="w-full max-w-2xl px-4">
                  <ChatInput onSend={handleAnalyze} isLoading={isLoading} />
                </div>
              </motion.div>
            )}

            {isLoading && (
              <motion.div
                key="loading"
                initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldAnimate ? { opacity: 0, scale: 0.95 } : undefined}
                className="w-full flex flex-col items-center justify-center transform translate-y-[-2rem]"
              >
                <div className="mb-6 text-white flex justify-center">
                  <Image src="/forge-logo.svg" alt="Analyzing" width={56} height={56} priority className="animate-spin" style={{ animationDuration: "3s" }} />
                </div>
                <h1 className="text-3xl md:text-[40px] font-display font-semibold text-white tracking-tight leading-tight mb-8 text-center drop-shadow-md">
                  {t('loading')}
                </h1>
              </motion.div>
            )}

            {!isLoading && (error || result) && (
              <motion.div
                key="results"
                initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[800px] flex flex-col items-start gap-2"
              >
                {error && (
                  <div className="text-red-400 bg-red-400/10 px-6 py-4 rounded-xl border border-red-500/20 w-full text-center mb-8">
                    {error}
                  </div>
                )}

                {result && result._blocked ? (
                  <div className="w-full flex flex-col items-start gap-4 pt-4">
                    <span className="text-red-500 text-sm font-bold tracking-widest uppercase">Action Not Permitted</span>
                    <h1 className="text-white text-3xl sm:text-4xl font-extrabold leading-tight">This request violates safety guidelines.</h1>
                    <p className="text-white/60 text-base leading-relaxed max-w-lg">ForgeGuard&apos;s capabilities are restricted strictly to defensive analysis and education.</p>
                    <a href="#" className="text-white underline underline-offset-4 text-sm font-medium hover:text-white/80 transition-colors">View our Terms of Service.</a>
                  </div>
                ) : result && (
                  <div className="w-full relative flex flex-col pt-2 sm:pt-4">
                    {isRelocalizing && (
                      <div className="sm:hidden w-full text-center text-xs text-white/60 mb-3">
                        {t('translating')}
                      </div>
                    )}
                    <div id="forgeguard-report" className="w-full flex flex-col bg-[#06080b] sm:p-4 sm:-m-4 rounded-xl">
                      {/* User Input Preview Bubble */}
                      {(result.inputType === 'image' || result.inputPreview) && (
                        <div className="w-full flex justify-end mb-4">
                          <div className="max-w-[85%] md:max-w-[70%] bg-[#3B54EE] text-white px-5 py-2 rounded-2xl rounded-tr-sm shadow-xl shadow-blue-500/10 border border-white/10">
                            {result.inputType === 'image' ? (
                              <div className="w-full max-w-sm h-32 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-500 border border-white/10 flex flex-col items-center justify-center gap-2 shadow-inner">
                                <ImageIcon size={28} className="text-white/40" />
                                <span className="text-white/40 text-xs font-semibold tracking-wide uppercase">Image Analyzed</span>
                              </div>
                            ) : result.inputType === 'pdf' ? (
                              <div className="w-full max-w-sm h-32 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-white/10 flex flex-col items-center justify-center gap-2 shadow-inner">
                                <ImageIcon size={28} className="text-white/40" />
                                <span className="text-white/40 text-xs font-semibold tracking-wide uppercase">PDF Analyzed</span>
                              </div>
                            ) : (
                              <p className="whitespace-pre-wrap text-[15px] leading-relaxed break-words">
                                {result.inputPreview}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <RiskBadge level={result.risk} confidence={result.confidence} />
                      <ActionChecklist level={result.risk} reasons={result.topReasons} actions={result.actions} microLesson={result.microLesson} />
                    </div>

                    {/* PDF Download Button (Only for High Risk) */}
                    {result.risk === 'High Risk' && (
                      <motion.div
                        initial={shouldAnimate ? { opacity: 0, y: 10 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full flex justify-center mt-2 mb-8"
                      >
                        <button
                          onClick={() => downloadReportAsPDF('forgeguard-report', 'ForgeGuard-Security-Report.pdf')}
                          className="flex items-center gap-2 bg-red-600/90 hover:bg-red-500 text-white px-6 py-3.5 rounded-xl font-medium transition-all shadow-lg shadow-red-500/10 hover:shadow-red-500/20 active:scale-95 border border-red-500/50"
                        >
                          <Download size={18} />
                          {isNativePlatform ? t('sharePdf') : t('downloadPdf')}
                        </button>
                      </motion.div>
                    )}
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

          {/* Privacy Mode Toast — OUTSIDE AnimatePresence */}
          {privacyRedacted && (isLoading || result) && (
            <motion.div
              initial={shouldAnimate ? { opacity: 0, x: 20 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="fixed bottom-6 right-6 z-50 bg-[#0f1a2e] border border-blue-500/20 rounded-2xl px-5 py-3.5 flex items-start gap-3 shadow-xl shadow-blue-500/5 max-w-sm"
            >
              <ShieldCheck size={20} className="text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-white text-sm font-semibold">Privacy Mode Active:</p>
                <p className="text-white/50 text-xs leading-relaxed">Personal details (names, emails) are being redacted before analysis.</p>
              </div>
              <button onClick={() => setPrivacyRedacted(false)} className="text-white/30 hover:text-white transition-colors shrink-0 mt-0.5">
                <X size={14} />
              </button>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
