'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, FileText, Bell, CheckCircle2, Loader2, Info } from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import Image from 'next/image';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(false); // start with signup by default as a growth tactic
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAppStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // Simulate network request for authenticating or creating an account
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      login(); // updates Zustand store
      onClose(); // auto-close modal
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-gradient-to-br from-[#0a0f18]/90 to-[#020408]/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/20 backdrop-blur-xl flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Left Side: Value Proposition */}
          <div className="md:w-5/12 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 flex flex-col justify-center bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-8">
              <Image src="/forge-logo.svg" alt="ForgeGuard" width={32} height={32} />
              <span className="text-2xl font-bold text-white tracking-tight font-display">ForgeGuard</span>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
              Create your free account today.
            </h2>
            <p className="text-blue-200/60 mb-8">
              Join thousands protecting their data and finances with our AI-powered safety coach.
            </p>

            <ul className="space-y-5">
              <li className="flex items-start gap-4">
                <div className="mt-1 p-1 bg-green-500/20 text-green-400 rounded-full relative">
                  <div className="absolute inset-0 bg-green-500 blur-md opacity-30 shadow-lg"/>
                  <CheckCircle2 size={16} className="relative z-10" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Save Search History</h4>
                  <p className="text-white/50 text-sm">Access your analyzed URLs and emails anytime.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 p-1 bg-blue-500/20 text-blue-400 rounded-full relative">
                  <div className="absolute inset-0 bg-blue-500 blur-md opacity-30 shadow-lg"/>
                  <FileText size={16} className="relative z-10" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Security Analytics</h4>
                  <p className="text-white/50 text-sm">Visualize your threat exposure over time.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="mt-1 p-1 bg-purple-500/20 text-purple-400 rounded-full relative">
                  <div className="absolute inset-0 bg-purple-500 blur-md opacity-30 shadow-lg"/>
                  <Bell size={16} className="relative z-10" />
                </div>
                <div>
                  <h4 className="text-white font-medium">Targeted Threat Alerts</h4>
                  <p className="text-white/50 text-sm">Get notified if you're targeted by advanced scams.</p>
                </div>
              </li>
            </ul>

            <div className="mt-12 p-4 bg-white/5 rounded-xl border border-white/10 flex gap-3 text-sm text-white/70">
              <Info className="shrink-0 text-[#3357f8]" size={20} />
              <p>Your privacy is guaranteed. We use strictly PII-redacted analysis.</p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-7/12 p-8 md:p-12 flex flex-col justify-center">
            
            <h3 className="text-3xl font-bold text-white mb-6">
              {isLogin ? 'Welcome back' : 'Get started'}
            </h3>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <button disabled className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors opacity-60 cursor-not-allowed">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button disabled className="flex items-center justify-center gap-2 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors opacity-60 cursor-not-allowed">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.8 3.59-.8 1.54 0 2.8.41 3.75 1.44a4.54 4.54 0 00-2.21 3.82c0 2.89 2.51 3.9 2.62 3.96a6.52 6.52 0 01-2.83 3.75zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <span className="text-sm font-medium">Apple</span>
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-white/40 text-sm">or</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5 ml-1">Email address</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#3357f8] focus:ring-1 focus:ring-[#3357f8] transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-white/70 text-sm font-medium mb-1.5 ml-1">Password</label>
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-[#3357f8] focus:ring-1 focus:ring-[#3357f8] transition-all duration-300"
                />
              </div>

              {!isLogin && (
                <div className="text-xs text-white/40 ml-1">
                  Must be at least 8 characters long.
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3357f8] hover:bg-[#243eb0] text-white font-bold py-3.5 mt-2 rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Lock size={18} />
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  </>
                )}
                {/* Subtle shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12" />
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-white/50">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-white hover:text-[#3357f8] font-bold transition-colors ml-1"
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
