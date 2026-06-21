'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Contact, getSupabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

interface ContactFormProps {
  contact?: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function ContactForm({ contact, isOpen, onClose, onSave }: ContactFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{name?: string; email?: string}>({});
  const supabase = getSupabase();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Contact>>({
    name: '',
    email: '',
    company: '',
    status: 'Lead',
  });

  // Synchronize form data when the contact prop changes or when the form opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFieldErrors({});
      if (contact) {
        setFormData(contact);
      } else {
        setFormData({
          name: '',
          email: '',
          company: '',
          status: 'Lead',
        });
      }
    }
  }, [contact, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!user || !supabase) {
      alert('Sessão expirada. Por favor, faça login novamente.');
      return;
    }

    // Duplicate check for new contacts
    if (!contact?.id && formData.email) {
      try {
        const { data: existing } = await supabase
          .from('contacts')
          .select('id')
          .eq('user_id', user.id)
          .ilike('email', formData.email);

        if (existing && existing.length > 0) {
          setFieldErrors({ email: 'Este e-mail já está cadastrado.' });
          setError('Já existe um contato cadastrado com este e-mail.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Error checking duplicate:', err);
      }
    }

    setLoading(true);

    try {
      const dataToSave = {
        ...formData,
        value: formData.value ?? 0,
        user_id: user.id,
        initials: formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '',
        avatar_color: contact?.avatar_color || `bg-${['primary', 'secondary', 'error', 'on-surface'][Math.floor(Math.random() * 4)]}-container`,
      };

      if (contact?.id) {
        const { error } = await supabase
          .from('contacts')
          .update(dataToSave)
          .eq('id', contact.id)
          .eq('user_id', user.id);
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
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-error-container/20 border-2 border-error/20 rounded-2xl text-error text-[11px] font-bold flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-error" />
                    {error}
                  </div>
                </motion.div>
              )}
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Nome Completo</label>
                <input
                  required
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: undefined });
                  }}
                  className={cn(
                    "w-full bg-surface-container-low rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20",
                    fieldErrors.name ? "border-2 border-error" : "border-none"
                  )}
                />
                {fieldErrors.name && (
                  <p className="text-[10px] text-error font-bold mt-1 ml-4 tracking-tight">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">E-mail</label>
                <input
                  required
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: undefined });
                  }}
                  className={cn(
                    "w-full bg-surface-container-low rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20",
                    fieldErrors.email ? "border-2 border-error" : "border-none"
                  )}
                />
                {fieldErrors.email && (
                  <p className="text-[10px] text-error font-bold mt-1 ml-4 tracking-tight">{fieldErrors.email}</p>
                )}
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
                    value={formData.value ?? ''}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value ? Number(e.target.value) : undefined })}
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
