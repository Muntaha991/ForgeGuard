'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from './ChatInput';
import { RiskLevel } from './RiskBadge';
import { useTranslations } from 'next-intl';

interface ActionChecklistProps {
  level: RiskLevel;
  reasons: string[];
  actions: string[];
  microLesson: string;
}

export default function ActionChecklist({ level, reasons, actions, microLesson }: ActionChecklistProps) {
  const t = useTranslations('ActionChecklist');
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  const renderReasonText = (text: string) => {
    const colonIndex = text.indexOf(':');
    if (colonIndex !== -1) {
      return (
        <span className="text-white/80 text-[15px] leading-relaxed">
          <strong className="text-white font-semibold">{text.substring(0, colonIndex + 1)}</strong>
          {text.substring(colonIndex + 1)}
        </span>
      );
    }
    return <span className="text-white/80 text-[15px] leading-relaxed">{text}</span>;
  };

  return (
    <div className="w-full flex flex-col gap-8 text-left mt-4 mb-20 font-sans">
      
      {/* Top Reasons Section */}
      {reasons && reasons.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-3">
          <h3 className="text-[17px] font-medium text-white mb-1">
            {level === 'Safe' ? t('whySafe') : t('whyFlagged')}
          </h3>
          <div className="flex flex-col gap-3">
            {reasons.map((reason, i) => (
              <motion.div variants={item} key={i} className="bg-[#121214] rounded-xl border border-white/5 px-5 py-4 w-full">
                {renderReasonText(reason)}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Checklist Section */}
      {actions && actions.length > 0 && (
        <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-3">
          <h3 className="text-[17px] font-medium text-white mb-1">
            {level === 'Safe' ? t('actionSafe') : t('actionFlagged')}
          </h3>
          <div className="flex flex-col gap-3">
            {actions.map((action, i) => (
              <motion.div variants={item} key={i} className="flex items-start gap-4 bg-[#121214] rounded-xl border border-white/5 px-5 py-4 w-full">
                <div className="shrink-0 mt-1">
                  <div className="w-[18px] h-[18px] rounded flex items-center justify-center bg-blue-600">
                    <span className="text-white text-[10px] font-bold select-none">✓</span>
                  </div>
                </div>
                <span className="text-white/80 text-[15px] leading-relaxed">{action}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Micro-Lesson */}
      {microLesson && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
          <h3 className="text-[17px] font-medium text-white mb-1">
            {t('lesson')}
          </h3>
          <div className="bg-[#101736] rounded-xl border border-blue-500/10 px-5 py-4 w-full flex items-start gap-4">
            <div className="shrink-0 mt-0.5">
              <Lightbulb className="text-blue-400" size={20} />
            </div>
            <p className="text-blue-100/90 text-[15px] leading-relaxed">
              {microLesson}
            </p>
          </div>
        </motion.div>
      )}

    </div>
  );
}
