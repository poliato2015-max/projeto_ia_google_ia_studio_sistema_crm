'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { KPICard } from '@/components/KPICard';
import { SalesGrowthChart, LeadDistributionChart } from '@/components/DashboardCharts';
import { PriorityTasks } from '@/components/PriorityTasks';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { RiskyOpportunities } from '@/components/RiskyOpportunities';
import { Calendar, Plus, Users, TrendingUp, Handshake, Target, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getSupabase, Contact, Deal, isSupabaseConfigured } from '@/lib/supabase';
import { ContactForm } from '@/components/ContactForm';
import { useAuth } from '@/components/AuthProvider';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { loading: authLoading, session } = useAuth();
  const configured = isSupabaseConfigured();
  
  // Memoize supabase client
  const supabase = useMemo(() => getSupabase(), []);

  const fetchData = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return;
    }

    if (!supabase) {
      console.warn('Dashboard: Supabase client not available.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setFetchError(null);

      // Safety timeout for database queries (8 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        setFetchError('A conexão com o banco de dados está lenta. Tente atualizar a página.');
        setLoading(false);
      }, 8000);

      const [contRes, dealRes] = await Promise.all([
        supabase.from('contacts').select('*'),
        supabase.from('deals').select('*, contact:contacts(*)').order('created_at', { ascending: false })
      ]);

      clearTimeout(timeoutId);

      if (contRes.error) {
        console.error('Contacts Error:', contRes.error);
        // We don't throw yet, just log and continue if possible
      }
      
      if (dealRes.error) {
        console.error('Deals Error:', dealRes.error);
      }

      setContacts(contRes.data || []);
      setDeals(dealRes.data || []);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error.message || error);
      setFetchError('Ocorreu um erro ao carregar os dados. Verifique suas tabelas no Supabase.');
    } finally {
      setLoading(false);
    }
  }, [supabase, configured]);

  useEffect(() => {
    // Only fetch when auth state is stable
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  const stats = {
    totalRevenue: deals.reduce((acc, curr) => acc + (curr.value || 0), 0),
    activeLeads: contacts.filter(c => c.status === 'Lead').length,
    conversionRate: contacts.length ? Math.round((contacts.filter(c => c.status === 'Cliente').length / contacts.length) * 100) : 0,
    openDeals: deals.filter(d => d.stage !== 'Fechado').length,
  };

  const riskyDeals = deals
    .filter(d => d.health_score < 70)
    .slice(0, 5);

  const getSalesGrowthData = () => {
    if (!deals.length) return undefined;
    
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const grouped = deals.reduce((acc: any, deal) => {
      const date = new Date(deal.created_at);
      const monthIndex = date.getMonth();
      const monthName = months[monthIndex];
      acc[monthName] = (acc[monthName] || 0) + deal.value;
      return acc;
    }, {});

    // Last 6 months
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
    if (!contacts.length) return undefined;
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

  if (loading && deals.length === 0 && contacts.length === 0 && configured) {
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
            Processando...
          </h3>
          
          {fetchError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 p-4 bg-error-container/20 rounded-xl border border-error/10"
            >
              <AlertTriangle className="text-error mx-auto mb-2" size={20} />
              <p className="text-[10px] text-error font-black uppercase mb-3">{fetchError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="w-full py-2 bg-on-surface text-surface text-[9px] font-black rounded-lg flex items-center justify-center gap-2"
              >
                <RefreshCw size={12} />
                FORÇAR RECARREGAMENTO
              </button>
            </motion.div>
          )}
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <h2 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">
                Visão Executiva
              </h2>
              <p className="text-on-surface-variant mt-2 font-medium">
                Métricas de receita e performance do pipeline em tempo real.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button className="px-5 py-2.5 bg-surface-container-low text-primary font-bold rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2 text-xs">
                <Calendar size={16} />
                Este Trimestre
              </button>
            </div>
          </motion.div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <KPICard 
              label="Receita Pipeline" 
              value={`$${(stats.totalRevenue / 1000).toFixed(1)}k`} 
              trend="+14.2%" 
              isPositive={true}
              variant="primary"
              icon={TrendingUp}
            />
            <KPICard 
              label="Leads Ativos" 
              value={stats.activeLeads.toString()} 
              trend="+5.1%" 
              isPositive={true}
              icon={Users}
            />
            <KPICard 
              label="Taxa de Conversão" 
              value={`${stats.conversionRate}%`} 
              trend="-2.4%" 
              isPositive={false}
              icon={Target}
            />
            <KPICard 
              label="Negócios Abertos" 
              value={stats.openDeals.toString()} 
              trend="+12%" 
              isPositive={true}
              icon={Handshake}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/5 shadow-sm"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold font-headline text-on-surface">Crescimento Mensal de Vendas</h3>
                <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">Últimos 6 meses</span>
              </div>
              <SalesGrowthChart data={salesData} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant/5 shadow-sm"
            >
              <h3 className="text-lg font-bold font-headline text-on-surface">Distribuição por Status</h3>
              <LeadDistributionChart data={leadData} total={contacts.length} />
              
              <div className="mt-8 space-y-3">
                {(leadData || [
                  { name: 'Leads', value: 0, color: 'bg-primary' },
                  { name: 'Clientes', value: 0, color: 'bg-secondary' },
                  { name: 'Inativos', value: 0, color: 'bg-[#ffb400]' },
                ]).map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2.5 h-2.5 rounded-full", 
                        item.name === 'Leads' ? 'bg-primary' : 
                        item.name === 'Clientes' ? 'bg-secondary' : 'bg-[#ffb400]'
                      )} />
                      <span className="text-xs font-semibold text-on-surface-variant">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface">
                      {contacts.length ? Math.round((item.value / contacts.length) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <PriorityTasks />
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ActivityTimeline />
            </motion.div>
          </div>

          {/* Table */}
          <RiskyOpportunities deals={riskyDeals} />
        </div>
      </main>

      {/* FAB */}
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center group z-50 transition-colors hover:bg-primary-dim"
      >
        <Plus size={28} />
        <span className="absolute right-16 bg-on-surface text-white text-[10px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Criar Novo Lead
        </span>
      </motion.button>
      
      <ContactForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={() => fetchData()} 
      />
    </div>
  );
}
