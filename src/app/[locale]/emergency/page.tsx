'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, AlertTriangle, ShieldAlert, CreditCard, LockKeyhole, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function EmergencyPage() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';

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
      description: 'If you entered a password on a suspicious site, change that password immediately. crucially, if you use that same password anywhere else (especially for email or banking), change it there too.',
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

  return (
    <div className="flex flex-col w-full h-full overflow-y-auto bg-[#0a0000] p-4 md:p-8">
      <div className="max-w-4xl w-full mx-auto pb-20">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-4">
          <Link 
            href={`/${currentLocale}`} 
            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-full text-red-500 hover:text-red-400 transition-colors border border-red-500/20"
          >
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold text-red-500 tracking-tight font-display flex items-center gap-3">
            <AlertTriangle className="text-red-500" />
            Emergency Toolkit
          </h1>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border-l-4 border-red-500 p-6 rounded-r-xl mb-12 shadow-xl shadow-red-900/10"
        >
          <h2 className="text-red-500 font-bold text-xl mb-2">Did you click a malicious link or share data?</h2>
          <p className="text-red-200/90 text-sm leading-relaxed">
            Do not panic. Scammers rely on fear to make you rush. Take a deep breath and immediately follow the steps below depending on what information you shared.
          </p>
        </motion.div>

        <div className="flex flex-col gap-6">
          {checklist.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#110505] border border-red-500/10 p-6 rounded-2xl shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                  {<Icon size={120} />}
                </div>
                
                <div className="flex items-start gap-4 mb-4 relative z-10">
                  <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-red-500 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-red-900/40">
                    {idx + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{item.title}</h2>
                    <p className="text-white/60 leading-relaxed max-w-2xl mt-2 text-sm">{item.description}</p>
                  </div>
                </div>
                
                <div className="ml-16 bg-red-500/10 p-4 rounded-lg border-l-2 border-red-500 relative z-10">
                  <p className="text-sm font-bold text-red-400 uppercase tracking-wider mb-1">Critical Action</p>
                  <p className="text-red-200 font-medium">{item.action}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
