'use client';

import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { SalesGrowthChart, LeadDistributionChart } from '@/components/DashboardCharts';

export default function MetricsPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Sidebar />
      
      <main className="pt-20 md:ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Métricas de Performance</h1>
            <p className="text-on-surface-variant text-lg font-medium">Análise aprofundada de conversão e crescimento orgânico.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
             {[
               { label: 'Custo por Lead', value: '$12.40', trend: '-8%', icon: Target },
               { label: 'CAC Total', value: '$840', trend: '+2.4%', icon: Users },
               { label: 'Taxa de Retenção', value: '94%', trend: '+1.1%', icon: TrendingUp },
               { label: 'ROI Médio', value: '4.8x', trend: '+12%', icon: BarChart3 },
             ].map((stat, i) => (
               <motion.div 
                 key={stat.label}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10"
               >
                 <div className="flex justify-between items-start mb-4">
                   <div className="p-2 bg-primary/10 rounded-lg text-primary">
                     <stat.icon size={20} />
                   </div>
                   <span className="text-[10px] font-black text-primary flex items-center gap-0.5">
                     {stat.trend} <ArrowUpRight size={10} />
                   </span>
                 </div>
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</span>
                 <div className="text-2xl font-black font-headline text-on-surface mt-1">{stat.value}</div>
               </motion.div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/5 shadow-sm">
              <h3 className="text-xl font-black text-on-surface font-headline mb-8">Evolução de Conversão</h3>
              <SalesGrowthChart />
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/5 shadow-sm">
              <h3 className="text-xl font-black text-on-surface font-headline mb-8">Composição do Pipeline</h3>
              <LeadDistributionChart />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
