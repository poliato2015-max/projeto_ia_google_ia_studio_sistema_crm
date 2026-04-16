'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { DealForm } from '@/components/DealForm';
import { 
  Plus, 
  Search, 
  Handshake,
  TrendingUp,
  Target,
  BadgeDollarSign,
  Trash2,
  Edit2,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { getSupabase, Deal, isSupabaseConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const configured = isSupabaseConfigured();
  const supabase = getSupabase();

  const fetchDeals = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('deals')
        .select(`
          *,
          contact:contacts (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeals(data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, configured]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este negócio permanentemente?')) return;
    try {
      const { error } = await supabase.from('deals').delete().eq('id', id);
      if (error) throw error;
      fetchDeals();
    } catch (error) {
      console.error('Error deleting deal:', error);
    }
  };

  const filteredDeals = deals.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.contact?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.contact?.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalValue: deals.reduce((acc, curr) => acc + (curr.value || 0), 0),
    avgProbability: deals.length ? Math.round(deals.reduce((acc, curr) => acc + (curr.probability || 0), 0) / deals.length) : 0,
    activePipe: deals.filter(d => d.stage !== 'Fechado').length,
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Sidebar />
      
      <main className="pt-20 md:ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Negócios</h1>
              <p className="text-on-surface-variant text-lg font-medium">Pipeline de vendas e previsão de fechamento.</p>
            </div>
            <button 
              onClick={() => {
                setSelectedDeal(null);
                setIsFormOpen(true);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all text-sm"
            >
              <Plus size={18} />
              Novo Negócio
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface-container-high p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Pipeline Ativo</span>
              <div className="text-4xl font-extrabold text-on-surface mt-2 font-headline">{stats.activePipe}</div>
              <div className="mt-4 flex items-center text-[10px] font-bold text-primary">
                <Target size={12} className="mr-1" /> Foco comercial
              </div>
            </div>
            <div className="bg-surface-container-high p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Valor Total</span>
              <div className="text-4xl font-extrabold text-on-surface mt-2 font-headline">
                ${(stats.totalValue / 1000).toFixed(1)}k
              </div>
              <div className="mt-4 flex items-center text-[10px] font-bold text-on-surface-variant">
                <BadgeDollarSign size={12} className="mr-1" /> Em negociação
              </div>
            </div>
            <div className="bg-surface-container-high p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-on-surface-variant" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Probabilidade Base</span>
              <div className="text-4xl font-extrabold text-on-surface mt-2 font-headline">{stats.avgProbability}%</div>
              <div className="mt-4 flex items-center text-[10px] font-bold text-primary">
                <TrendingUp size={12} className="mr-1" /> Taxa média de sucesso
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-surface-container-low p-6 rounded-2xl mb-8">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input 
                type="text" 
                placeholder="Buscar negócio ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface text-sm placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>

          {/* Pipeline List */}
          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                <p className="mt-4 text-[10px] font-black uppercase text-on-surface-variant tracking-widest">Carregando pipeline...</p>
              </div>
            ) : filteredDeals.length === 0 ? (
              <div className="py-20 text-center bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/30">
                <p className="text-on-surface-variant font-medium">Nenhum negócio no momento.</p>
              </div>
            ) : filteredDeals.map((deal) => (
              <motion.div 
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 hover:border-primary/20 transition-all flex flex-col md:flex-row items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-on-surface group-hover:text-primary transition-colors tracking-tight">{deal.title}</h3>
                    <span className={cn(
                      "px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded",
                      deal.stage === 'Fechado' ? "bg-secondary-container text-on-secondary-container" : "bg-primary-container text-primary"
                    )}>
                      {deal.stage}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant flex items-center gap-2">
                    <span className="font-bold">{deal.contact?.name}</span>
                    <span className="opacity-30">|</span>
                    <span>{deal.contact?.company || 'Pessoa Física'}</span>
                  </p>
                </div>

                <div className="hidden lg:block w-32">
                  <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest block mb-1">Saúde</span>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        deal.health_score > 70 ? "bg-primary" : deal.health_score > 40 ? "bg-secondary" : "bg-error"
                      )} 
                      style={{ width: `${deal.health_score}%` }} 
                    />
                  </div>
                </div>

                <div className="text-right w-40">
                  <div className="text-lg font-black font-headline text-on-surface">${deal.value.toLocaleString()}</div>
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{deal.probability}% Probabilidade</div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setSelectedDeal(deal);
                      setIsFormOpen(true);
                    }}
                    className="p-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(deal.id)}
                    className="p-3 text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="p-3 text-on-surface-variant group-hover:text-primary transition-colors cursor-pointer ml-4">
                    <ArrowRight size={20} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <DealForm 
        isOpen={isFormOpen}
        deal={selectedDeal}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedDeal(null);
        }}
        onSave={fetchDeals}
      />
    </div>
  );
}
