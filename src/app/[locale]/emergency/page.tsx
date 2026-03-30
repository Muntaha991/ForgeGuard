'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShieldAlert, CreditCard, LockKeyhole, PhoneCall, ChevronDown, CheckCircle, Search, UserCircle2, Briefcase, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function EmergencyPage() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';
  
  // Default the first accordion immediately to open
  const [activeTab, setActiveTab] = useState<number | null>(0);

  const checklist = [
    {
      title: 'Contact your bank immediately',
      icon: PhoneCall,
      description: 'If you shared banking details or authorized a payment, call the number on the back of your credit/debit card immediately. Inform them your account may be compromised and ask to freeze unauthorized transactions.',
      action: 'Call the official number on the back of your card.'
    },
    {
      title: 'Change your passwords',
      icon: LockKeyhole,
      description: 'If you entered a password on a suspicious site, change that password immediately. Crucially, if you use that same password anywhere else (especially for email or banking), change it there too.',
      action: 'Enable Two-Factor Authentication (2FA) wherever possible.'
    },
    {
      title: 'Freeze your credit',
      icon: CreditCard,
      description: 'If you provided your Social Security Number, ID, or significant personal information, scammers may try to open accounts in your name. Contact Equifax, Experian, and TransUnion to place a free security freeze on your credit report.',
      action: 'Visit IdentityTheft.gov for official guidance.'
    },
    {
      title: 'Run an antivirus scan',
      icon: ShieldAlert,
      description: 'If you downloaded an attachment or software, disconnect your device from the internet (turn off Wi-Fi/unplug the cable) and run a full system scan using reputable antivirus software.',
      action: 'Do not log into banking or email until the machine is clean.'
    }
  ];

  const professionals = [
    {
      id: 1,
      name: "Dr. Sarah Jenkins",
      title: "Senior Cybersecurity Consultant",
      specialty: "Device Forensics & Malware Removal",
      verified: true,
      available: "Available in 2h"
    },
    {
      id: 2,
      name: "Marcus Thorne, Esq.",
      title: "Cyber-Fraud Attorney",
      specialty: "Asset Recovery & Identity Theft",
      verified: true,
      available: "Accepting new clients"
    },
    {
      id: 3,
      name: "Elena Rodriguez",
      title: "Digital Security Specialist",
      specialty: "Account Recovery & 2FA Setup",
      verified: true,
      available: "Available immediately"
    },
    {
      id: 4,
      name: "David Chen, JD",
      title: "Fraud Litigation Attorney",
      specialty: "Financial Fraud Lawsuits",
      verified: true,
      available: "Consultations opening tomorrow"
    }
  ];

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto bg-[#020408] p-4 md:p-8">
      <div className="max-w-4xl w-full mx-auto pb-20">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href={`/${currentLocale}`} 
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-full text-blue-500 hover:text-blue-400 transition-colors border border-blue-500/20"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight font-display flex items-center gap-3">
            <ShieldAlert className="text-blue-500" />
            Emergency Toolkit
          </h1>
        </div>

        {/* Triage Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border-l-4 border-blue-500 p-6 rounded-r-xl mb-12 shadow-xl shadow-blue-900/10 backdrop-blur-md"
        >
          <h2 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
            Stay calm and take action.
          </h2>
          <p className="text-blue-200/80 text-sm leading-relaxed max-w-2xl">
            Scammers rely on fear to make you rush. Take a deep breath and immediately follow the triage steps below to secure your finances and data. 
          </p>
        </motion.div>

        {/* Triage Accordion Section */}
        <h3 className="text-xl font-bold text-white mb-6 border-b border-white/5 pb-2">Immediate Triage Steps</h3>
        <div className="flex flex-col gap-3 mb-16">
          {checklist.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-[#0A0F1A] border transition-all duration-300 rounded-2xl overflow-hidden shadow-lg ${isActive ? 'border-amber-500/30 ring-1 ring-amber-500/10' : 'border-white/5 hover:border-white/10'}`}
              >
                {/* Accordion Header */}
                <button 
                  onClick={() => setActiveTab(isActive ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between bg-black/20 hover:bg-black/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner ${isActive ? 'bg-amber-500/20 text-amber-500' : 'bg-white/5 text-white/40'}`}>
                      {idx + 1}
                    </div>
                    <h2 className={`text-lg font-bold tracking-tight transition-colors ${isActive ? 'text-white' : 'text-white/70'}`}>
                      {item.title}
                    </h2>
                  </div>
                  <ChevronDown size={20} className={`transition-transform duration-300 text-white/40 ${isActive ? 'rotate-180 text-amber-500' : ''}`} />
                </button>

                {/* Accordion Body */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-2 pb-6 border-t border-white/5 bg-black/10 relative">
                        {/* Huge faint background icon */}
                        <div className="absolute top-4 right-6 opacity-[0.03] text-white/50 pointer-events-none">
                          <Icon size={100} />
                        </div>
                        
                        <p className="text-white/60 leading-relaxed max-w-2xl text-sm mb-6 relative z-10">
                          {item.description}
                        </p>
                        
                        <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 relative z-10 shadow-inner">
                          <p className="text-xs font-bold text-amber-500/70 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            <ShieldAlert size={14} /> Critical Action
                          </p>
                          <p className="text-amber-100 font-medium text-sm">{item.action}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        {/* Business Model: Professional Directory */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Briefcase className="text-blue-500" size={24} />
                Get Professional Help (Los Angeles Area)
              </h3>
              <p className="text-white/50 text-sm mt-2 max-w-xl">
                Connect with vetted cybersecurity consultants and cyber-fraud attorneys to secure your systems and recover your stolen assets.
              </p>
            </div>
            {/* Search/Filter pill mock */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-white/50 text-sm cursor-pointer hover:bg-white/10 transition-colors w-fit">
              <Search size={16} />
              Filter professionals
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {professionals.map((pro) => (
              <motion.div 
                key={pro.id}
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="bg-[#111621]/80 backdrop-blur-xl border border-white/10 hover:border-blue-500/30 p-6 rounded-2xl flex flex-col justify-between shadow-2xl shadow-black/40 group group-hover:shadow-blue-900/10 transition-all cursor-default relative overflow-hidden"
              >
                {/* Subtle gradient hover wash */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/0 group-hover:to-blue-500/5 transition-colors duration-500 pointer-events-none" />

                <div className="flex items-start gap-4 mb-6 relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-[#1A2235] border border-white/5 flex items-center justify-center flex-shrink-0 shadow-inner">
                    <UserCircle2 size={32} className="text-white/20" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                      {pro.name}
                    </h4>
                    <span className="text-blue-400 text-sm font-medium block mb-1">{pro.title}</span>
                    <span className="text-white/40 text-xs block truncate w-48 sm:w-auto">{pro.specialty}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 relative z-10">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-2 py-1 rounded-md border border-green-500/20">
                      <CheckCircle size={12} />
                      Verified Partner
                    </div>
                    <span className="text-white/40">{pro.available}</span>
                  </div>
                  
                  <button className="w-full mt-2 bg-white/5 hover:bg-[#3357f8] text-white py-3 rounded-xl border border-white/10 hover:border-[#3357f8] font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-sm group-hover:shadow-blue-900/20">
                    <Mail size={16} />
                    Contact Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer Legal Disclaimer */}
        <div className="mt-20 pt-8 border-t border-white/5 text-center px-4">
          <p className="text-white/30 text-xs leading-relaxed max-w-2xl mx-auto italic">
            Disclaimer: ForgeGuard provides this professional directory strictly as an informational resource. We are not legally or financially liable for the services provided by third-party professionals. Information and availability listed are subject to change. Always conduct your own independent research and due diligence before hiring legal or technical counsel.
          </p>
        </div>

      </div>
    </div>
  );
}
