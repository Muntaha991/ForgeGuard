'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, HelpCircle, Settings, PhoneIcon as Headphones, User, X, BookOpen, AlertTriangle, Zap } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/appStore';
import AuthModal from './AuthModal';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => void;
}

export default function Sidebar({ isOpen, onClose, onNewChat }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const { isLoggedIn, userProfile, userTier, login, logout, setTier, locale, setLocale } = useAppStore();

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

  return (
    <>
    <AuthModal isOpen={activeModal === 'Auth'} onClose={() => setActiveModal(null)} />
    <AnimatePresence initial={false}>
      {/* Dynamic Overlay Modal for Settings, Support, and User Profile */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl"
          >
            <button 
              onClick={() => setActiveModal(null)} 
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            {activeModal === 'Account' ? (
              <>
                <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                  {isLoggedIn ? 'Your Profile' : 'Guest Account'}
                </h2>
                <div className="text-white/70 text-sm mb-6">
                    <div className="flex flex-col gap-1 p-3 bg-white/5 rounded-lg border border-white/10">
                      <span className="font-medium text-white">{userProfile?.name}</span>
                      <span>{userProfile?.email}</span>
                      <span className={`text-xs font-medium mt-1 ${userTier === 'Pro' ? 'text-purple-400' : 'text-[#3357f8]'}`}>
                        {userTier} Tier Active
                      </span>
                    </div>
                </div>
                <button 
                  onClick={() => { logout(); setActiveModal(null); }}
                  className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-2.5 rounded-lg font-medium transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : activeModal === 'Settings' ? (
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
            ) : (
              <>
                <h2 className="text-xl font-bold text-white tracking-tight mb-2">
                  {activeModal}
                </h2>
                <p className="text-white/70 text-sm mb-6">
                  This feature is currently under active development. Stay tuned!
                </p>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}

      {isOpen && (
        <>
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
              {userTier !== 'Pro' && (
                <button 
                  onClick={() => openModal('Upgrade to Pro')}
                  className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 transition-colors text-sm font-bold mb-2 bg-white/[0.02] border border-white/5"
                >
                  <Zap size={18} className="fill-purple-400/20" />
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
                className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-red-500/10 text-red-500 hover:text-red-400 transition-colors text-sm font-medium"
              >
                <AlertTriangle size={18} />
                Emergency Help
              </button>
              
              <div className="h-px bg-white/5 my-2 mx-3" />
              
              <button 
                onClick={() => openModal(isLoggedIn ? 'Account' : 'Auth')}
                className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 text-white/90 transition-colors text-sm font-medium mt-1 mb-2"
              >
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={16} className="text-white/50" />
                </div>
                <div className="flex flex-col items-start truncate overflow-hidden">
                  <span className="truncate w-full">{isLoggedIn ? userProfile?.name : 'Guest Mode'}</span>
                  {isLoggedIn && <span className="text-xs text-white/50 truncate w-full">{userProfile?.email}</span>}
                </div>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  );
}
