'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Lock, ShieldAlert, AlertTriangle, ShieldCheck, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignInButton, SignedOut } from '@clerk/nextjs';
import { useUserTier } from '@/hooks/useUserTier';
import { useScanHistory } from '@/hooks/useScanHistory';

export default function ReportsPage() {
  const { tier, isGuest } = useUserTier();
  const { history, isLoaded, clearHistory } = useScanHistory();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';

  const totalScans = history.length;
  const threatsBlocked = history.filter((item) => item.risk === 'High Risk').length;
  const suspiciousCount = history.filter((item) => item.risk === 'Suspicious').length;
  const safeCount = history.filter((item) => item.risk === 'Safe').length;
  const showHighTargetingAlert = threatsBlocked >= 3;

  const getRiskStyles = (label: string | undefined) => {
    switch (label) {
      case 'High Risk':
        return {
          icon: ShieldAlert,
          badge: 'text-[#FFAA87] bg-[#FF8E66]/15 border-[#FF8E66]/35',
          signal: 'bg-[#FF8E66]',
        };
      case 'Suspicious':
        return {
          icon: AlertTriangle,
          badge: 'text-[#FFD38A] bg-[#FFC768]/15 border-[#FFC768]/35',
          signal: 'bg-[#FFC768]',
        };
      default:
        return {
          icon: ShieldCheck,
          badge: 'text-[#84FFD0] bg-[#6BFFC8]/15 border-[#6BFFC8]/35',
          signal: 'bg-[#6BFFC8]',
        };
    }
  };

  return (
    <div className="relative flex flex-col w-full h-full overflow-y-auto bg-[#05080f] p-4 md:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-28 -left-20 h-[28rem] w-[28rem] rounded-full bg-[#1f9fff]/20 blur-[120px]" />
        <div className="absolute top-1/3 -right-24 h-[24rem] w-[24rem] rounded-full bg-[#6BFFC8]/10 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl w-full mx-auto pb-24">
        <div className="flex items-center gap-4 mb-8 md:mb-10">
          <Link
            href={`/${currentLocale}`}
            className="p-2.5 bg-white/[0.06] hover:bg-white/[0.12] rounded-full text-white/70 hover:text-white transition-colors border border-white/15 backdrop-blur-xl"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-display">Security Command Center</h1>
            <p className="text-sm text-[#95B9E8] mt-1 tracking-wide">Persistent local scan intelligence for your live session</p>
          </div>
        </div>

        {tier !== 'Pro' ? (
          <div className="flex flex-col items-center justify-center py-10 md:py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg bg-gradient-to-br from-[#0a1320]/80 to-[#070b14]/80 border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-blue-900/20 relative overflow-hidden backdrop-blur-2xl"
            >
              <div className="mx-auto w-20 h-20 bg-blue-500/10 text-[#3357f8] flex items-center justify-center rounded-2xl mb-8 shadow-inner shadow-blue-900/20 border border-blue-500/20 relative">
                <div className="absolute inset-0 bg-[#3357f8] blur-xl opacity-20 rounded-full" />
                <Lock size={36} className="relative z-10" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">Unlock Your Full Security Profile</h2>
              <p className="text-white/60 mb-10 leading-relaxed max-w-sm mx-auto">
                Upgrade to ForgeGuard Pro to monitor your complete threat history, visualize your exposure, and receive automated alerts.
              </p>

              <SignedOut>
                <SignInButton mode="modal">
                  <button className="w-full bg-[#3357f8] hover:bg-[#243eb0] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2">
                    <Lock size={18} />
                    Sign In to Upgrade
                  </button>
                </SignInButton>
              </SignedOut>
              {!isGuest && (
                <button
                  onClick={() => console.log('Open Pricing')}
                  className="w-full bg-[#3357f8] hover:bg-[#243eb0] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                >
                  <Lock size={18} />
                  Upgrade to Pro
                </button>
              )}
            </motion.div>
          </div>
        ) : (
          <>
            {showHighTargetingAlert && (
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#FFB57E]/12 border border-[#FFB57E]/35 rounded-2xl px-5 py-5 mb-6 shadow-[0_0_30px_rgba(255,181,126,0.14)] backdrop-blur-xl"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-[#FFDAB8] font-bold text-lg">⚠️ High Targeting Volume Detected</h3>
                    <p className="text-[#FFE5CB]/85 text-sm mt-1 max-w-3xl">
                      You have encountered multiple severe threats recently. This often means your email or phone number is on an active scammer list (e.g., from a data breach).
                    </p>
                  </div>
                  <Link
                    href={`/${currentLocale}/emergency`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFB57E] hover:bg-[#ffad6d] text-[#1b1107] px-4 py-3 text-sm font-bold transition-colors"
                  >
                    <AlertCircle size={16} />
                    View Action Plan
                  </Link>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-7">
              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
                <p className="text-[#9CC8FF] text-xs uppercase tracking-[0.14em] mb-3">Total Scans</p>
                <p className="text-4xl font-semibold text-white leading-none">{totalScans}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
                <p className="text-[#FFC690] text-xs uppercase tracking-[0.14em] mb-3">Threats Blocked</p>
                <p className="text-4xl font-semibold text-white leading-none">{threatsBlocked}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
                <p className="text-[#FFD38A] text-xs uppercase tracking-[0.14em] mb-3">Suspicious</p>
                <p className="text-4xl font-semibold text-white leading-none">{suspiciousCount}</p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
                <p className="text-[#A6FFE0] text-xs uppercase tracking-[0.14em] mb-3">Safe</p>
                <p className="text-4xl font-semibold text-white leading-none">{safeCount}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 md:p-6 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between gap-4 mb-5">
                <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">Recent Threat Log</h2>
                <button
                  type="button"
                  onClick={clearHistory}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs md:text-sm text-white/60 hover:text-[#FFB7A0] hover:border-[#FF8E66]/40 hover:bg-[#FF8E66]/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Clear Scan History
                </button>
              </div>

              {!isLoaded ? (
                <div className="text-center py-12 rounded-xl border border-white/10 bg-black/30">
                  <p className="text-white/50">Loading scan history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-white/10 bg-black/30">
                  <p className="text-white/50">No scans yet. Run a scan from the home page to populate your analytics.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record, idx) => {
                    const styles = getRiskStyles(record.risk);
                    const Icon = styles.icon;

                    return (
                      <motion.div
                        key={record.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="rounded-xl border border-white/10 bg-black/30 p-4 md:p-5 hover:bg-black/45 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                          <div className="flex items-center gap-3 min-w-0 md:w-[22%]">
                            <div className={`h-9 w-9 rounded-lg ${styles.signal}/20 border border-white/10 flex items-center justify-center shrink-0`}>
                              <Icon size={18} className="text-white/90" />
                            </div>
                            <span className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.11em] px-2 py-1 rounded-md border ${styles.badge}`}>
                              {record.risk || 'Safe'}
                            </span>
                          </div>

                          <div className="md:w-[38%] min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.11em] text-white/45 mb-1">Input</p>
                            <p className="text-sm text-white/85 truncate font-mono">{record.inputPreview || 'No preview available'}</p>
                          </div>

                          <div className="md:w-[26%] min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.11em] text-white/45 mb-1">Top Reason</p>
                            <p className="text-sm text-white/80 line-clamp-1">{record.topReasons?.[0] || 'Standard analysis completed.'}</p>
                          </div>

                          <div className="md:w-[14%]">
                            <p className="text-[11px] uppercase tracking-[0.11em] text-white/45 mb-1">Date</p>
                            <p className="text-sm text-white/70">
                              {new Date(record.scannedAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
