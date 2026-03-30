'use client';
import { useAppStore } from '@/store/appStore';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ShieldCheck, AlertTriangle, ShieldAlert, Lock, Database, Radar, Shield, Activity, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserTier } from '@/hooks/useUserTier';
import { SignInButton, SignedOut } from '@clerk/nextjs';

export default function ReportsPage() {
  const { history } = useAppStore();
  const { tier, isGuest } = useUserTier();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';
  const recentThreats = history.slice(0, 8);

  // Threat Threshold Alert Logic
  const highRiskCount = history.filter(item => item.riskLabel === 'High Risk').length;
  const showThreatAlert = highRiskCount >= 5;

  // Targeted PII Alert Logic
  const targetedPiiCount = history.filter(item => item.riskLabel === 'High Risk' && item.piiWasRedacted).length;
  const showPiiAlert = targetedPiiCount > 0;

  // Demo KPI data for hackathon visuals
  const dashboardKpis = {
    totalScans: 142,
    threatsBlocked: 28,
    riskScore: 34,
    mostTargetedApp: 'Banking / SMS',
  };

  const threatMix30Days = [
    { label: 'Week 1', safe: 61, phishing: 23, scams: 16 },
    { label: 'Week 2', safe: 68, phishing: 20, scams: 12 },
    { label: 'Week 3', safe: 74, phishing: 16, scams: 10 },
    { label: 'Week 4', safe: 79, phishing: 13, scams: 8 },
  ];

  const riskLabel = dashboardKpis.riskScore >= 70 ? 'High' : dashboardKpis.riskScore >= 40 ? 'Medium' : 'Low';
  const riskHue = riskLabel === 'High' ? '#FF8E66' : riskLabel === 'Medium' ? '#FFC768' : '#6BFFC8';
  const ringRadius = 46;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (dashboardKpis.riskScore / 100) * ringCircumference;

  const getRiskStyles = (label: string) => {
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
        <div className="absolute -bottom-24 left-1/4 h-[20rem] w-[20rem] rounded-full bg-[#FF8E66]/10 blur-[110px]" />
      </div>

      <div className="relative max-w-6xl w-full mx-auto pb-24">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 md:mb-10">
          <Link 
            href={`/${currentLocale}`} 
            className="p-2.5 bg-white/[0.06] hover:bg-white/[0.12] rounded-full text-white/70 hover:text-white transition-colors border border-white/15 backdrop-blur-xl"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-display">Security Command Center</h1>
            <p className="text-sm text-[#95B9E8] mt-1 tracking-wide">Live threat telemetry and account exposure intelligence</p>
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
              
              <h2 className="text-3xl font-bold text-white mb-4 tracking-tight">
                Unlock Your Full Security Profile
              </h2>
              <p className="text-white/60 mb-10 leading-relaxed max-w-sm mx-auto">
                Upgrade to ForgeGuard Pro to monitor your complete threat history, visualize your exposure, and receive automated alerts when you are targeted by advanced scams.
              </p>
              
              <SignedOut>
                <SignInButton mode="modal">
                  <button 
                    className="w-full bg-[#3357f8] hover:bg-[#243eb0] text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2"
                  >
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
            {(showThreatAlert || showPiiAlert) && (
              <div className="grid grid-cols-1 gap-4 mb-7">
                {showThreatAlert && (
                  <motion.div 
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#FFB57E]/10 border border-[#FFB57E]/30 rounded-2xl px-5 py-4 flex gap-3 shadow-[0_0_30px_rgba(255,181,126,0.12)] backdrop-blur-xl"
                  >
                    <AlertCircle className="text-[#FFB57E] shrink-0 mt-0.5" size={22} />
                    <p className="text-sm text-[#FFDAB8] leading-relaxed">
                      Elevated threat activity detected with <span className="font-bold text-white">{highRiskCount}</span> high-risk events in your recent scan stream.
                    </p>
                  </motion.div>
                )}
                {showPiiAlert && (
                  <motion.div 
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#FF8E66]/10 border border-[#FF8E66]/35 rounded-2xl px-5 py-4 flex gap-3 shadow-[0_0_30px_rgba(255,142,102,0.14)] backdrop-blur-xl"
                  >
                    <Database className="text-[#FF9E7A] shrink-0 mt-0.5" size={22} />
                    <p className="text-sm text-[#FFD2C4] leading-relaxed">
                      Targeted personal-data phishing signatures were found. Open your emergency playbook for immediate containment actions.
                      <Link href={`/${currentLocale}/emergency`} className="ml-2 text-white font-semibold underline underline-offset-4">
                        Open checklist
                      </Link>
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-7">
              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
                <p className="text-[#9CC8FF] text-xs uppercase tracking-[0.14em] mb-3">Total Scans</p>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-semibold text-white leading-none">{dashboardKpis.totalScans}</p>
                  <Shield className="text-[#49B8FF]" size={24} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
                <p className="text-[#FFC690] text-xs uppercase tracking-[0.14em] mb-3">Threats Blocked</p>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-semibold text-white leading-none">{dashboardKpis.threatsBlocked}</p>
                  <Radar className="text-[#FFB57E]" size={24} />
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
                <p className="text-[#A3D3FF] text-xs uppercase tracking-[0.14em] mb-3">Overall Risk Score</p>
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20">
                    <svg className="h-20 w-20 -rotate-90">
                      <circle cx="40" cy="40" r={ringRadius} className="fill-none stroke-white/10" strokeWidth="8" />
                      <circle
                        cx="40"
                        cy="40"
                        r={ringRadius}
                        className="fill-none"
                        stroke={riskHue}
                        strokeWidth="8"
                        strokeDasharray={ringCircumference}
                        strokeDashoffset={ringOffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">{dashboardKpis.riskScore}</div>
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-white">{riskLabel}</p>
                    <p className="text-xs text-white/60 uppercase tracking-[0.12em]">Current posture</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
                <p className="text-[#A6FFE0] text-xs uppercase tracking-[0.14em] mb-3">Most Targeted App</p>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xl font-semibold text-white leading-tight">{dashboardKpis.mostTargetedApp}</p>
                  <Smartphone className="text-[#6BFFC8]" size={24} />
                </div>
              </div>
            </div>

            {/* Visual Analytics */}
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 md:p-6 shadow-[0_20px_35px_rgba(0,0,0,0.35)] mb-7">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">30-Day Threat Distribution</h2>
                  <p className="text-sm text-[#9AB7DD] mt-1">Safe vs phishing vs scam attempts across recent scan windows</p>
                </div>
                <Activity className="text-[#49B8FF]" size={22} />
              </div>

              <div className="space-y-4">
                {threatMix30Days.map((slice) => (
                  <div key={slice.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-white/80 font-medium">{slice.label}</span>
                      <span className="text-xs text-white/50">{slice.safe + slice.phishing + slice.scams} scans</span>
                    </div>
                    <div className="h-3 rounded-full overflow-hidden border border-white/10 bg-black/40 flex">
                      <div className="h-full bg-[#6BFFC8]" style={{ width: `${slice.safe}%` }} />
                      <div className="h-full bg-[#FFC768]" style={{ width: `${slice.phishing}%` }} />
                      <div className="h-full bg-[#FF8E66]" style={{ width: `${slice.scams}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                <div className="rounded-xl border border-[#6BFFC8]/35 bg-[#6BFFC8]/10 px-3.5 py-3 text-sm text-[#C5FFE8]">Safe traffic is dominant and trending up.</div>
                <div className="rounded-xl border border-[#FFC768]/35 bg-[#FFC768]/10 px-3.5 py-3 text-sm text-[#FFE1B0]">Phishing attempts remain moderate.</div>
                <div className="rounded-xl border border-[#FF8E66]/35 bg-[#FF8E66]/10 px-3.5 py-3 text-sm text-[#FFD0C2]">Scam spikes are concentrated in mobile channels.</div>
              </div>
            </div>

            {/* Recent Threat Log */}
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl p-5 md:p-6 shadow-[0_20px_35px_rgba(0,0,0,0.35)]">
              <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight mb-5">Recent Threat Log</h2>

              {recentThreats.length === 0 ? (
                <div className="text-center py-12 rounded-xl border border-white/10 bg-black/30">
                  <p className="text-white/50">No scans recorded yet. Try scanning a link or message.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentThreats.map((record, idx) => {
                    const styles = getRiskStyles(record.riskLabel);
                    const Icon = styles.icon;

                    return (
                      <motion.div
                        key={`${record.analyzedAt}-${idx}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="rounded-xl border border-white/10 bg-black/30 p-4 md:p-5 hover:bg-black/45 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                          <div className="flex items-center gap-3 min-w-0 md:w-[22%]">
                            <div className={`h-9 w-9 rounded-lg ${styles.signal}/20 border border-white/10 flex items-center justify-center shrink-0`}>
                              <Icon size={18} className="text-white/90" />
                            </div>
                            <span className={`inline-flex items-center text-[11px] font-semibold uppercase tracking-[0.11em] px-2 py-1 rounded-md border ${styles.badge}`}>
                              {record.riskLabel}
                            </span>
                          </div>

                          <div className="md:w-[38%] min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.11em] text-white/45 mb-1">Source</p>
                            <p className="text-sm text-white/85 truncate font-mono">{record.inputPreview}</p>
                          </div>

                          <div className="md:w-[26%] min-w-0">
                            <p className="text-[11px] uppercase tracking-[0.11em] text-white/45 mb-1">Top Reason</p>
                            <p className="text-sm text-white/80 line-clamp-1">{record.reasons[0] || 'Standard analysis completed.'}</p>
                          </div>

                          <div className="md:w-[14%]">
                            <p className="text-[11px] uppercase tracking-[0.11em] text-white/45 mb-1">Date</p>
                            <p className="text-sm text-white/70">
                              {new Date(record.analyzedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
