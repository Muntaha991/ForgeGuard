'use client';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type RiskLevel = 'Safe' | 'Suspicious' | 'High Risk';

interface RiskBadgeProps {
  level: RiskLevel;
  confidence: number;
}

export default function RiskBadge({ level, confidence }: RiskBadgeProps) {
  const t = useTranslations('RiskBadge');
  
  let colorClass = '';
  let Icon = ShieldCheck;
  let title = '';

  switch (level) {
    case 'Safe':
      colorClass = 'text-green-500';
      Icon = ShieldCheck;
      title = t('safe');
      break;
    case 'Suspicious':
      colorClass = 'text-yellow-500';
      Icon = AlertTriangle;
      title = t('suspicious');
      break;
    case 'High Risk':
      colorClass = 'text-red-500';
      Icon = AlertTriangle;
      title = t('high');
      break;
  }


  return (
    <div className="flex flex-col gap-4 w-full text-left">
      <div className={`flex items-center gap-2 ${colorClass} text-sm font-semibold uppercase tracking-wider`}>
        <Icon size={16} />
        <span>{level}</span>
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {title}
      </h1>

      <div className="w-full flex flex-col gap-2 mt-4">
        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${confidence}%` }} 
          />
        </div>
        <div className="flex justify-between items-center text-sm font-medium">
          <span className="text-gray-400">Confidence level</span>
          <span className="text-white">{confidence}%</span>
        </div>
      </div>
    </div>
  );
}
