'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Contact, Deal, getSupabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';

interface DealFormProps {
  deal?: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function DealForm({ deal, isOpen, onClose, onSave }: DealFormProps) {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [formData, setFormData] = useState<Partial<Deal>>(
    deal || {
      title: '',
      value: 0,
      stage: 'Prospecção',
      probability: 20,
      health_score: 100,
      contact_id: null,
    }
  );

  const supabase = getSupabase();

  useEffect(() => {
    if (isOpen) {
      const fetchContacts = async () => {
        const { data } = await supabase.from('contacts').select('*').order('name');
        setContacts(data || []);
      };
      fetchContacts();
    }
  }, [isOpen, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (deal?.id) {
        const { error } = await supabase.from('deals').update(formData).eq('id', deal.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('deals').insert([formData]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving deal:', error);
      alert('Erro ao salvar negócio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-[70] p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black font-headline text-on-surface">
                {deal ? 'Editar Negócio' : 'Novo Negócio'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Título do Negócio</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Expansão Licenças Nexus"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Cliente / Lead Relacionado</label>
                <select
                  required
                  value={formData.contact_id || ''}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 appearance-none"
                >
                  <option value="">Selecione um contato</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.company || 'Pessoa Física'})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Valor</label>
                  <input
                    required
                    type="number"
                    value={formData.value || 0}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Probabilidade (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.probability || 0}
                    onChange={(e) => setFormData({ ...formData, probability: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Estágio</label>
                <select
                  value={formData.stage}
                  onChange={(e) => setFormData({ ...formData, stage: e.target.value as any })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Prospecção">Prospecção</option>
                  <option value="Qualificação">Qualificação</option>
                  <option value="Proposta">Proposta</option>
                  <option value="Negociação">Negociação</option>
                  <option value="Fechado">Fechado</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Previsão de Fechamento</label>
                <input
                  type="date"
                  value={formData.expected_close_date || ''}
                  onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="pt-8 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={18} className="animate-spin" />}
                  {loading ? 'Salvando...' : 'Salvar Negócio'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
