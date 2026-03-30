'use client';
import { Fragment, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Settings, X, BookOpen, AlertTriangle, Zap, LogIn, Loader2 } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useUserTier } from '@/hooks/useUserTier';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => void;
}

export default function Sidebar({ isOpen, onClose, onNewChat }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isUpgradingTier, setIsUpgradingTier] = useState(false);
  const { userTier, user, isPro } = useUserTier();
  const { locale, setLocale } = useAppStore();

  // Helper to extract current locale (e.g., 'en' or 'es')
  const currentLocale = pathname?.split('/')[1] || 'en';

  const handleNavigation = (path: string) => {
    router.push(`/${currentLocale}${path}`);
    if (window.innerWidth < 768) onClose();
  };

  const handleNewChat = () => {
    // 1. Triggers parent reset if provided (e.g., clearing chat context/state)
    if (onNewChat) onNewChat();
    // 2. Navigates back to the root locale path to ensure a fresh session
    router.push(`/${currentLocale}`);
    if (window.innerWidth < 768) onClose();
  };

  const openModal = (modalName: string) => {
    setActiveModal(modalName);
    if (window.innerWidth < 768) onClose();
  };

  const handleSubscribeNow = async () => {
    if (!user || isUpgradingTier) return;

    setIsUpgradingTier(true);
    try {
      const response = await fetch('/api/account/tier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'pro' }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorPayload?.error || 'Unable to activate Pro tier.');
      }

      await user.reload();
      setActiveModal(null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpgradingTier(false);
    }
  };

  return (
    <>
    <AnimatePresence initial={false}>
      {/* Dynamic Overlay Modal for Settings, Upgrade, and User Profile */}
      {activeModal && (
        <div
          key={`overlay-modal-${activeModal}`}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`relative w-full shadow-2xl ${
              activeModal === 'Upgrade to Pro'
                ? 'max-w-5xl rounded-3xl border border-[#44D6FF]/30 bg-gradient-to-br from-white/[0.10] via-white/[0.06] to-white/[0.04] backdrop-blur-2xl p-7 md:p-10'
                : 'max-w-md rounded-2xl border border-white/10 bg-[#111111] p-6'
            }`}
          >
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            {activeModal === 'Settings' ? (
              <>
                <h2 className="text-xl font-bold text-white tracking-tight mb-4">
                  Settings
                </h2>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/70 mb-2">Language</label>
                  <select 
                    value={locale} 
                    onChange={(e) => {
                      const newLocale = e.target.value;
                      setLocale(newLocale);
                      // the pathname should always start with /en, /es etc.
                      router.push(`/${newLocale}${pathname.substring(pathname.indexOf('/', 1) !== -1 ? pathname.indexOf('/', 1) : pathname.length)}`);
                      setActiveModal(null);
                    }}
                    className="w-full bg-[#1A1A1A] border border-white/10 rounded-lg p-2.5 text-white outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="en">English (en)</option>
                    <option value="es">Español (es)</option>
                  </select>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </>
            ) : activeModal === 'Upgrade to Pro' ? (
              <>
                <div className="mb-7 pr-8">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                    Pricing & Features
                  </h2>
                  <p className="text-sm md:text-base text-white/70 mt-2">
                    Pick the plan that matches your protection needs. Upgrade anytime.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-2xl border border-white/15 bg-black/35 p-6 backdrop-blur-xl">
                    <p className="text-white/70 text-sm font-medium uppercase tracking-[0.12em] mb-2">Basic</p>
                    <div className="flex items-end gap-2 mb-5">
                      <span className="text-4xl font-bold text-white">$0</span>
                    </div>
                    <ul className="space-y-3 text-sm text-white/80">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                        Instant scam detection
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-white/60" />
                        Private, untracked scans
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[#44D6FF]/70 bg-[#44D6FF]/10 p-6 backdrop-blur-xl shadow-[0_0_35px_rgba(68,214,255,0.18)]">
                    <p className="text-[#7BE5FF] text-sm font-semibold uppercase tracking-[0.12em] mb-2">ForgeGuard Pro</p>
                    <div className="flex items-end gap-2 mb-5">
                      <span className="text-4xl font-bold text-white">$4.99</span>
                      <span className="text-white/70 mb-1">/mo</span>
                    </div>
                    <ul className="space-y-3 text-sm text-white/90 mb-6">
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#44D6FF]" />
                        Unlimited daily scans
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#44D6FF]" />
                        Full Security Analytics dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#44D6FF]" />
                        Targeted PII attack detection
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-[#44D6FF]" />
                        Priority processing
                      </li>
                    </ul>
                    <SignedOut>
                      <SignInButton mode="modal">
                        <button
                          type="button"
                          className="w-full rounded-xl bg-[#44D6FF] px-4 py-3 text-sm font-bold text-[#02131A] shadow-[0_0_25px_rgba(68,214,255,0.45)] transition-all hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(68,214,255,0.6)]"
                        >
                          Sign In to Subscribe
                        </button>
                      </SignInButton>
                    </SignedOut>
                    <SignedIn>
                      <button
                        type="button"
                        onClick={handleSubscribeNow}
                        disabled={isUpgradingTier}
                        className="w-full rounded-xl bg-[#44D6FF] px-4 py-3 text-sm font-bold text-[#02131A] shadow-[0_0_25px_rgba(68,214,255,0.45)] transition-all hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(68,214,255,0.6)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-[0_0_25px_rgba(68,214,255,0.45)] flex items-center justify-center gap-2"
                      >
                        {isUpgradingTier ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Activating Pro...
                          </>
                        ) : (
                          'Subscribe Now'
                        )}
                      </button>
                    </SignedIn>
                  </div>
                </div>
              </>
            ) : null}
          </motion.div>
        </div>
      )}

      {isOpen && (
        <Fragment key="sidebar-open">
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[100] md:hidden backdrop-blur-sm"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed top-0 left-0 h-full w-[280px] bg-[#0A0A0A] border-r border-white/5 z-[101] flex flex-col px-4 md:relative md:z-auto"
            style={{ 
              paddingTop: 'max(env(safe-area-inset-top, 0px), 1.5rem)',
              paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 1.5rem)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-2 mb-8 mt-2">
              <div 
                className="flex items-center gap-3 cursor-pointer" 
                onClick={handleNewChat}
              >
                <Image src="/forge-logo.svg" alt="ForgeGuard Logo" width={28} height={28} />
                <span className="text-xl font-bold tracking-tight text-white font-display">ForgeGuard</span>
              </div>
              <button onClick={onClose} className="md:hidden text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Main Actions */}
            <div className="flex flex-col gap-2 mb-6">
              <button 
                onClick={handleNewChat}
                className="w-full flex items-center gap-2 bg-[#3357f8] hover:bg-[#243eb0] text-white py-3 px-4 rounded-xl transition-colors font-medium text-sm shadow-lg shadow-blue-900/20"
              >
                <Plus size={18} />
                New chat
              </button>
            </div>

            {/* Top Links */}
            <div className="flex flex-col gap-1 mb-8">
              <button 
                onClick={() => handleNavigation('/reports')}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <FileText size={18} />
                Security Analytics
              </button>
              <button 
                onClick={() => handleNavigation('/glossary')}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <BookOpen size={18} />
                Scam Glossary
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-1">
              {!isPro && (
                <button 
                  onClick={() => openModal('Upgrade to Pro')}
                  className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg bg-white/[0.02] border border-[#44D6FF]/30 text-[#44D6FF] hover:text-[#7BE5FF] hover:bg-[#44D6FF]/10 hover:shadow-[0_0_20px_rgba(68,214,255,0.25)] transition-all text-sm font-bold mb-2"
                >
                  <Zap size={18} className="fill-[#44D6FF]/25" />
                  Upgrade to Pro
                </button>
              )}
              <button 
                onClick={() => openModal('Settings')}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <Settings size={18} />
                Settings
              </button>
              <button 
                onClick={() => handleNavigation('/emergency')}
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-medium"
              >
                <AlertTriangle size={18} />
                Emergency Help
              </button>
              
              <div className="h-px bg-white/5 my-2 mx-3" />

              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-white/5 hover:bg-[#44D6FF]/15 border border-white/10 hover:border-[#44D6FF]/40 text-white/90 hover:text-[#7BE5FF] transition-colors text-sm font-semibold mt-1 mb-2"
                  >
                    <LogIn size={16} />
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <div className="w-full flex items-center gap-3 py-2 px-3 rounded-lg bg-white/5 border border-white/10 mt-1 mb-2">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'h-8 w-8',
                        userButtonTrigger: 'focus:shadow-none',
                      },
                    }}
                  />
                  <div className="min-w-0 flex flex-col">
                    <span className="truncate text-sm font-semibold text-white">
                      {user?.fullName || user?.firstName || user?.username || 'User'}
                    </span>
                    <span className="text-xs text-white/60">{userTier} Tier</span>
                  </div>
                </div>
              </SignedIn>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
    </>
  );
}
