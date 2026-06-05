import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AttributeBarProps {
  label: string;
  value: number;
  change?: number;
  color: string;
  max?: number;
}

export function AttributeBar({ label, value, change = 0, color, max = 20 }: AttributeBarProps) {
  const [showChange, setShowChange] = useState(false);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (change !== 0) {
      setShowChange(true);
      const timer = setTimeout(() => setShowChange(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [change]);

  return (
    <div className="relative">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-slate-300">{label}</span>
        <span className="text-xs text-slate-100 font-bold">{value}</span>
      </div>
      
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <AnimatePresence>
        {showChange && change !== 0 && (
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -30 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute -top-6 right-0 text-sm font-bold ${
              change > 0 ? 'text-emerald-400' : 'text-rose-500'
            }`}
          >
            {change > 0 ? '+' : ''}{change}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
