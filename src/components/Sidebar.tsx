'use client';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, HelpCircle, Settings, PhoneIcon as Headphones, User, X } from 'lucide-react';
import { cn } from './ChatInput';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => void;
}

export default function Sidebar({ isOpen, onClose, onNewChat }: SidebarProps) {
  // We use CSS variables defined in globals.css
  return (
    <AnimatePresence initial={false}>
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
            <div className="flex items-center justify-between px-2 mb-8">
              <div className="flex items-center gap-3">
                <Image src="/forge-logo.svg" alt="ForgeGuard Logo" width={28} height={28} />
                <span className="text-xl font-bold tracking-tight text-white font-display">ForgeGuard</span>
              </div>
              <button onClick={onClose} className="md:hidden text-white/50 hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Main Action */}
            <button 
              onClick={() => {
                if (onNewChat) onNewChat();
                if (window.innerWidth < 768) onClose(); // Auto-close sidebar on mobile after clicking
              }}
              className="w-full flex items-center gap-2 bg-[#3357f8] hover:bg-[#243eb0] text-white py-3 px-4 rounded-xl transition-colors font-medium text-sm mb-6"
            >
              <Plus size={18} />
              New chat
            </button>

            {/* Top Links */}
            <div className="flex flex-col gap-1 mb-8">
              <button className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-medium">
                <FileText size={18} />
                My Reports
              </button>
              <button className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-medium">
                <HelpCircle size={18} />
                How ForgeGuard Works
              </button>
            </div>

           

            {/* Footer Buttons */}
            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-1">
              <button className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-medium">
                <Settings size={18} />
                Settings
              </button>
              <button className="w-full flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/5 text-white/70 hover:text-white transition-colors text-sm font-medium">
                <Headphones size={18} />
                Support
              </button>
              
              <div className="h-px bg-white/5 my-2 mx-3" />
              
              <button className="w-full flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 text-white/90 transition-colors text-sm font-medium mt-1">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={16} className="text-white/50" />
                </div>
                Username
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
