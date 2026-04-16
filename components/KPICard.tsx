'use client';

import { TrendingUp, TrendingDown, PlusCircle, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface KPICardProps {
  label: string;
  value: string;
  trend: string;
  isPositive: boolean;
  icon?: LucideIcon;
  variant?: 'primary' | 'neutral';
}

export function KPICard({ label, value, trend, isPositive, icon, variant = 'neutral' }: KPICardProps) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn(
        "p-6 flex flex-col justify-between h-40 relative group overflow-hidden rounded-xl bg-surface-container-low border border-outline-variant/5",
        variant === 'primary' && "bg-surface-container-high"
      )}
    >
      {variant === 'primary' && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}
      
      <div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/70">{label}</span>
        <div className={cn(
          "text-3xl font-extrabold font-headline mt-2",
          variant === 'primary' ? "text-primary" : "text-on-surface"
        )}>
          {value}
        </div>
      </div>

      <div className={cn(
        "flex items-center gap-2 font-bold text-xs",
        isPositive ? "text-primary" : "text-error"
      )}>
        {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        <span>{trend}</span>
      </div>

      {/* Background decoration */}
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        {icon && (() => {
          const Icon = icon;
          return <Icon size={100} />;
        })()}
      </div>
    </motion.div>
  );
}
