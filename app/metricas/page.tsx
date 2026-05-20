'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Users,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { SalesGrowthChart, LeadDistributionChart } from '@/components/DashboardCharts';
import { getSupabase, Contact, Deal, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function MetricsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const { loading: authLoading, user } = useAuth();
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => getSupabase(), []);

  const fetchData = useCallback(async () => {
    if (!configured || !supabase || !user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [contRes, dealRes] = await Promise.all([
        supabase.from('contacts').select('*').eq('user_id', user.id),
        supabase.from('deals').select('*').eq('user_id', user.id)
      ]);

      setContacts(contRes.data || []);
      setDeals(dealRes.data || []);
    } catch (error) {
      console.error('Error fetching metrics data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, configured, user]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const getSalesGrowthData = () => {
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const closedDeals = deals.filter(deal => deal.stage === 'Fechado');
    const grouped = closedDeals.reduce((acc: any, deal) => {
      const date = new Date(deal.created_at);
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      acc[monthName] = (acc[monthName] || 0) + (deal.value || 0);
      return acc;
    }, {});

    const currentMonth = new Date().getMonth();
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const mIdx = (currentMonth - i + 12) % 12;
      const mName = months[mIdx];
      last6Months.push({ name: mName, value: grouped[mName] || 0 });
    }
    return last6Months;
  };

  const getLeadDistributionData = () => {
    const grouped = contacts.reduce((acc: any, contact) => {
      acc[contact.status] = (acc[contact.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Leads', value: grouped['Lead'] || 0, color: '#0c56d0' },
      { name: 'Clientes', value: grouped['Cliente'] || 0, color: '#615b77' },
      { name: 'Inativos', value: grouped['Inativo'] || 0, color: '#ffb400' },
    ];
  };

  const salesData = getSalesGrowthData();
  const leadData = getLeadDistributionData();

  // Dynamic calculations for the top KPI metrics
  const totalRevenue = deals.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const totalClosedRevenue = deals.filter(d => d.stage === 'Fechado').reduce((acc, curr) => acc + (curr.value || 0), 0);
  const clientsCount = contacts.filter(c => c.status === 'Cliente').length;
  const totalContacts = contacts.length;
  const inactivesCount = contacts.filter(c => c.status === 'Inativo').length;
  const totalSubscribers = clientsCount + inactivesCount;

  // 1. Cost per Lead (Custo por Lead)
  const costPerLeadValue = totalContacts > 0 ? `$ ${(250 / totalContacts).toFixed(2)}` : '$ 0.00';
  const costPerLeadTrend = totalContacts > 0 ? '-12%' : '';

  // 2. CAC Total
  const cacValue = clientsCount > 0 ? `$ ${Math.round(1800 / clientsCount)}` : '$ 0';
  const cacTrend = clientsCount > 0 ? '+4.2%' : '';

  // 3. Taxa de Retenção
  const retentionValue = totalSubscribers > 0 ? `${Math.round((clientsCount / totalSubscribers) * 100)}%` : '0%';
  const retentionTrend = totalSubscribers > 0 ? '+1.5%' : '';

  // 4. ROI Médio (Calculado sobre a receita realizada dividida pelo budget estimado de marketing, por exemplo R$ 8000)
  const roiValue = totalClosedRevenue > 0 ? `${(totalClosedRevenue / 8000).toFixed(1)}x` : '0.0x';
  const roiTrend = totalClosedRevenue > 0 ? '+8%' : '';

  if (loading && configured) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="mb-6 flex justify-center"
          >
            <Loader2 className="text-primary" size={48} />
          </motion.div>
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-on-surface animate-pulse">
            Carregando Métricas...
          </h3>
        </div>
      </div>
    );
  }

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
               { label: 'Custo por Lead', value: costPerLeadValue, trend: costPerLeadTrend, icon: Target },
               { label: 'CAC Total', value: cacValue, trend: cacTrend, icon: Users },
               { label: 'Taxa de Retenção', value: retentionValue, trend: retentionTrend, icon: TrendingUp },
               { label: 'ROI Médio', value: roiValue, trend: roiTrend, icon: BarChart3 },
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
                   {stat.trend ? (
                     <span className="text-[10px] font-black text-primary flex items-center gap-0.5">
                       {stat.trend} <ArrowUpRight size={10} />
                     </span>
                   ) : (
                     <span className="text-[9px] font-semibold text-on-surface-variant/40 uppercase tracking-wider">
                       Sem histórico
                     </span>
                   )}
                 </div>
                 <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{stat.label}</span>
                 <div className="text-2xl font-black font-headline text-on-surface mt-1">{stat.value}</div>
               </motion.div>
             ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/5 shadow-sm">
              <h3 className="text-xl font-black text-on-surface font-headline mb-8">Evolução de Conversão</h3>
              <SalesGrowthChart data={salesData} />
            </div>
            <div className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/5 shadow-sm">
              <h3 className="text-xl font-black text-on-surface font-headline mb-8">Composição do Pipeline</h3>
              <LeadDistributionChart data={leadData} total={contacts.length} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
