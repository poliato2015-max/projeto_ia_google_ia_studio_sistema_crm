'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Contact, getSupabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface ContactFormProps {
  contact?: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ContactForm({ contact, isOpen, onClose, onSave }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabase();
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    email: '',
    company: '',
    status: 'Lead',
    value: 0,
  });

  // Synchronize form data when the contact prop changes or when the form opens
  useEffect(() => {
    if (isOpen) {
      if (contact) {
        setFormData(contact);
      } else {
        setFormData({
          name: '',
          email: '',
          company: '',
          status: 'Lead',
          value: 0,
        });
      }
    }
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        initials: formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '',
        avatar_color: contact?.avatar_color || `bg-${['primary', 'secondary', 'error', 'on-surface'][Math.floor(Math.random() * 4)]}-container`,
      };

      if (contact?.id) {
        const { error } = await supabase
          .from('contacts')
          .update(dataToSave)
          .eq('id', contact.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert([dataToSave]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Erro ao salvar contato. Verifique sua configuração do Supabase.');
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
                {contact ? 'Editar Contato' : 'Novo Contato'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Nome Completo</label>
                <input
                  required
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">E-mail</label>
                <input
                  required
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Empresa</label>
                <input
                  type="text"
                  value={formData.company || ''}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Cliente">Cliente</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Valor do Contrato</label>
                  <input
                    type="number"
                    value={formData.value || 0}
                    onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
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
                  className="flex-[2] py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Contato'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
