'use client';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, AlertTriangle, Shield, Smartphone, Globe, Mail } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function GlossaryPage() {
  const pathname = usePathname();
  const currentLocale = pathname?.split('/')[1] || 'en';

  const terms = [
    {
      term: 'Phishing',
      icon: Mail,
      definition: 'A type of scam where attackers send fraudulent emails pretending to be a reputable company (like your bank) to trick you into revealing personal information, such as passwords or credit card numbers.',
      example: 'An email claiming your account is locked and providing a link to "verify your identity."'
    },
    {
      term: 'Smishing',
      icon: Smartphone,
      definition: 'Similar to phishing, but the scam is conducted through SMS text messages rather than email.',
      example: 'A text message saying a package could not be delivered with a link to pay a "redelivery fee."'
    },
    {
      term: 'Social Engineering',
      icon: Shield,
      definition: 'The psychological manipulation of people into performing actions or divulging confidential information. Scammers rely on creating a false sense of urgency or fear.',
      example: 'Someone calling you pretending to be from IT support, asking for your password to "fix" an issue.'
    },
    {
      term: 'Spear Phishing',
      icon: AlertTriangle,
      definition: 'A highly targeted phishing attack. Instead of sending out thousands of generic emails, the scammer researches you specifically (often using data from breaches) to make the email look incredibly convincing.',
      example: 'An email appearing to be from your actual boss, asking you to urgently wire money to a vendor.'
    },
    {
      term: 'Spoofing',
      icon: Globe,
      definition: 'When a scammer falsifies their caller ID, email address, or website URL to make it look like they are someone you trust.',
      example: 'A phone call where the caller ID literally says the name of your bank, but it is actually a scammer overseas.'
    }
  ];

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
          <h1 className="text-3xl font-bold text-white tracking-tight font-display flex items-center gap-3">
            <BookOpen className="text-white/50" />
            Scam Glossary
          </h1>
        </div>

        <p className="text-white/60 mb-10 text-lg leading-relaxed">
          Understanding the language of scammers is your first line of defense. 
          Here are clear, jargon-free definitions of common tactics used to steal your money and data.
        </p>

        <div className="flex flex-col gap-6">
          {terms.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-[#111111] border border-white/5 p-6 rounded-2xl shadow-xl shadow-black/50"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Icon size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-white">{item.term}</h2>
                </div>
                <p className="text-white/80 leading-relaxed mb-4">
                  {item.definition}
                </p>
                <div className="bg-white/5 p-4 rounded-lg border-l-2 border-white/20">
                  <p className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1">Example</p>
                  <p className="text-white/70 italic">&quot;{item.example}&quot;</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
          <p className="text-white/60">
            Encountered a term you don't see here? Ask ForgeGuard in a New Chat to explain it!
          </p>
        </div>
      </div>
    </div>
  );
}
