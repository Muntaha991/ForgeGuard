'use client';
import { useAppStore } from '@/store/appStore';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, ShieldCheck, AlertTriangle, ShieldAlert, Lock, Database } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUserTier } from '@/hooks/useUserTier';
import { SignInButton, SignedOut } from '@clerk/nextjs';

export default function ReportsPage() {
  const { history } = useAppStore();
  const { tier, isGuest } = useUserTier();
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';

  // Threat Threshold Alert Logic
  const highRiskCount = history.filter(item => item.riskLabel === 'High Risk').length;
  const showThreatAlert = highRiskCount >= 5;

  // Targeted PII Alert Logic
  const targetedPiiCount = history.filter(item => item.riskLabel === 'High Risk' && item.piiWasRedacted).length;
  const showPiiAlert = targetedPiiCount > 0;

  // Helper to render the correct icon and color per row
  const getRiskStyles = (label: string) => {
    switch(label) {
      case 'High Risk':
        return { icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' };
      case 'Suspicious':
        return { icon: AlertTriangle, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' };
      default:
        return { icon: ShieldCheck, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' };
    }
  };

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto bg-black p-4 md:p-8">
      <div className="max-w-4xl w-full mx-auto pb-20">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href={`/${currentLocale}`} 
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors border border-white/10"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display">Security Analytics</h1>
        </div>

        {tier !== 'Pro' ? (
          <div className="flex flex-col items-center justify-center py-10 md:py-20">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-lg bg-[#06080b] border border-white/10 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-blue-900/10 relative overflow-hidden"
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
            {/* Threat Threshold Alert Banner */}
            {showThreatAlert && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-orange-500/10 border-l-4 border-orange-500 p-4 md:p-6 rounded-r-xl mb-4 flex gap-4 shadow-lg shadow-orange-900/10 items-start md:items-center"
              >
                <AlertCircle className="text-orange-500 shrink-0 mt-1 md:mt-0" size={28} />
                <div>
                  <h3 className="text-orange-500 font-bold text-lg mb-1 tracking-tight">High Threat Volume</h3>
                  <p className="text-orange-200/80 text-sm leading-relaxed">
                    Warning: You are being heavily targeted by threats ({highRiskCount} severe phishing attempts detected recently). Be extremely cautious with unexpected communications.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Targeted PII Attack Alert Banner */}
            {showPiiAlert && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-red-600/10 border border-red-500/30 p-5 md:p-6 rounded-xl mb-8 flex gap-4 shadow-2xl shadow-red-900/20 items-start relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Database size={100} />
                </div>
                <ShieldAlert className="text-red-500 shrink-0 mt-1" size={32} />
                <div className="relative z-10">
                  <h3 className="text-red-500 font-bold text-xl mb-2 tracking-tight">CRITICAL ALERT: Targeted PII Attack</h3>
                  <p className="text-red-200/90 text-sm leading-relaxed mb-3">
                    We have detected a pattern of severe phishing attempts that explicitly reference your personal identifiable information (PII) such as your name or partially redacted account numbers. This strongly indicates that your personal details may have been leaked in a data breach.
                  </p>
                  <Link href={`/${currentLocale}/emergency`} className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-red-900/40">
                    View Emergency Action Checklist
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 shadow-xl shadow-black/50">
                <p className="text-white/50 text-sm font-medium mb-1">Total Scans</p>
                <p className="text-3xl font-bold text-white">{history.length}</p>
              </div>
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 shadow-xl shadow-black/50">
                <p className="text-red-500/70 text-sm font-medium mb-1">High Risk</p>
                <p className="text-3xl font-bold text-red-500">{highRiskCount}</p>
              </div>
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 shadow-xl shadow-black/50">
                <p className="text-yellow-500/70 text-sm font-medium mb-1">Suspicious</p>
                <p className="text-3xl font-bold text-yellow-500">
                  {history.filter(i => i.riskLabel === 'Suspicious').length}
                </p>
              </div>
              <div className="bg-[#111111] border border-white/5 rounded-2xl p-5 shadow-xl shadow-black/50">
                <p className="text-green-500/70 text-sm font-medium mb-1">Safe</p>
                <p className="text-3xl font-bold text-green-500">
                  {history.filter(i => i.riskLabel === 'Safe').length}
                </p>
              </div>
            </div>

            {/* History List */}
            <h2 className="text-xl font-bold text-white mb-4 tracking-tight">Recent Scans</h2>
            
            {history.length === 0 ? (
              <div className="text-center py-12 bg-[#111111] border border-white/5 rounded-2xl">
                <p className="text-white/40">No scans recorded yet. Try scanning a link or message.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((record, idx) => {
                  const styles = getRiskStyles(record.riskLabel);
                  const Icon = styles.icon;
                  
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx}
                      className="bg-[#111111] border border-white/5 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Badge */}
                      <div className={`shrink-0 flex items-center justify-center w-12 h-12 rounded-full ${styles.bg} ${styles.color}`}>
                        <Icon size={22} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${styles.color} ${styles.bg} ${styles.border}`}>
                            {record.riskLabel}
                          </span>
                          <span className="text-xs text-white/40">
                            {new Date(record.analyzedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-white/80 text-sm truncate w-full font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                          {record.inputPreview}
                        </p>
                      </div>
                      
                      {/* Top Reason */}
                      <div className="md:w-1/3 shrink-0">
                        <p className="text-xs text-white/40 mb-1 font-medium uppercase tracking-wider">Top Reason</p>
                        <p className="text-white/70 text-sm line-clamp-2">
                          {record.reasons[0] || "Standard analysis completed."}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
