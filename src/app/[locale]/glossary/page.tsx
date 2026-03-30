'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, AlertTriangle, Shield, Smartphone, Globe, Mail, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlossaryPage() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';
  const [openTerm, setOpenTerm] = useState<string | null>('Phishing');

  const terms = [
    {
      term: 'Phishing',
      icon: Mail,
      definition: 'Scammers send fake emails pretending to be a company you trust (like your bank or Amazon). Their goal is to trick you into clicking a bad link or logging into a fake website to steal your password.'
    },
    {
      term: 'Smishing (SMS Phishing)',
      icon: Smartphone,
      definition: 'Exactly like phishing, but sent through text messages. They often use urgent warnings like "Your package is delayed" or "Your bank account is locked" to make you panic and click.'
    },
    {
      term: 'Social Engineering',
      icon: Shield,
      definition: 'The psychological trickery scammers use to manipulate you. Instead of hacking your computer, they "hack" your emotions, usually by creating a fake emergency or pretending to be an authority figure to get you to hand over money or information.'
    },
    {
      term: 'Spear Phishing',
      icon: AlertTriangle,
      definition: 'A highly targeted attack. Unlike generic spam, the scammer has already researched you. They will use your actual name, your job title, or specific account numbers to make the fake message look incredibly convincing.'
    },
    {
      term: 'Spoofing',
      icon: Globe,
      definition: `When a scammer falsifies their caller ID, email address, or website URL to look exactly like a legitimate source. Just because your phone says "IRS" doesn't mean it's actually them.`
    }
  ];

  return (
    <div className="relative flex flex-col w-full h-full overflow-y-auto bg-[#05080f] p-4 md:p-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-[24rem] w-[24rem] rounded-full bg-[#1f9fff]/20 blur-[110px]" />
        <div className="absolute top-1/3 -right-20 h-[20rem] w-[20rem] rounded-full bg-[#69ffe2]/10 blur-[110px]" />
      </div>

      <div className="relative max-w-5xl w-full mx-auto pb-24">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 md:mb-10">
          <Link 
            href={`/${currentLocale}`} 
            className="p-2.5 bg-white/[0.06] hover:bg-white/[0.12] rounded-full text-white/70 hover:text-white transition-colors border border-white/15 backdrop-blur-xl"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight font-display flex items-center gap-3">
              <BookOpen className="text-[#84c9ff]" />
              The ForgeGuard Glossary
            </h1>
            <p className="text-[#9ab7dd] mt-2 text-sm md:text-base max-w-3xl">
              Knowledge is your first line of defense. Learn how to spot the most common tactics scammers use.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 items-start gap-4 md:gap-5">
          {terms.map((item, idx) => {
            const Icon = item.icon;
            const isOpen = openTerm === item.term;

            return (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="self-start rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.10] to-white/[0.03] backdrop-blur-2xl shadow-[0_20px_35px_rgba(0,0,0,0.35)] overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenTerm(isOpen ? null : item.term)}
                  className="w-full px-5 py-4 md:px-6 md:py-5 flex items-center justify-between gap-4 text-left"
                >
                  <div className="min-w-0 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#49b8ff]/15 border border-[#49b8ff]/30 flex items-center justify-center text-[#7fd3ff] shrink-0">
                      <Icon size={20} />
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold text-white leading-tight">{item.term}</h2>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-white/60 shrink-0 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 md:px-6 md:pb-6">
                    <div className="h-px bg-white/10 mb-4" />
                    <p className="text-white/80 leading-relaxed text-sm md:text-base">
                      {item.definition}
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 p-5 md:p-6 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-center backdrop-blur-2xl">
          <p className="text-white/70">
            Tip: If a message feels urgent, emotional, or "too official," pause and verify through a trusted channel first.
          </p>
        </div>
      </div>
    </div>
  );
}
