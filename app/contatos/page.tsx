'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { ContactForm } from '@/components/ContactForm';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { 
  Users, 
  Plus, 
  MoreVertical, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Trash2,
  Edit2,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getSupabase, Contact, isSupabaseConfigured } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export const dynamic = 'force-dynamic';

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const { user, loading: authLoading } = useAuth();
  const configured = isSupabaseConfigured();
  const supabase = getSupabase();

  const fetchContacts = useCallback(async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    if (!supabase || !user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Error fetching contacts:', error.message || error);
    } finally {
      setLoading(false);
    }
  }, [supabase, configured, user]);

  useEffect(() => {
    if (!authLoading) {
      fetchContacts();
    }
  }, [authLoading, fetchContacts]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      if (search) {
        setSearchTerm(search);
      }
      const id = params.get('id');
      if (id) {
        setSelectedContactId(id);
      }
    }
  }, []);

  const contactToDelete = contacts.find(c => c.id === deleteConfirmId);

  const handleDeleteClick = async (id: string) => {
    setDeleteError(null);
    const contact = contacts.find(c => c.id === id);
    if (!contact || !supabase || !user) return;

    // Check if active contact is linked to deals
    if (contact.status !== 'Inativo') {
      try {
        const { data: linkedDeals } = await supabase
          .from('deals')
          .select('id')
          .eq('contact_id', id)
          .eq('user_id', user.id);

        if (linkedDeals && linkedDeals.length > 0) {
          setDeleteError(`O contato "${contact.name}" está vinculado a ${linkedDeals.length} negócio(s) ativo(s). Remova ou finalize os vínculos antes de excluir.`);
          return;
        }
      } catch (err) {
        console.error('Error checking linked deals:', err);
      }
    }

    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    if (!configured) {
      alert('Supabase não configurado.');
      setDeleteConfirmId(null);
      return;
    }
    if (!user || !supabase) {
      setDeleteConfirmId(null);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', deleteConfirmId)
        .eq('user_id', user.id);
      
      if (error) throw error;
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Erro ao excluir contato.');
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const filteredContacts = contacts.filter(c => 
    selectedContactId
      ? c.id === selectedContactId
      : c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    leads: contacts.filter(c => c.status === 'Lead').length,
    ltv: contacts.reduce((acc, curr) => acc + (curr.value || 0), 0),
    atRisk: contacts.filter(c => c.status === 'Inativo').length,
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
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Contatos</h1>
              <p className="text-on-surface-variant text-lg font-medium">Gerencie seus relacionamentos corporativos e pipeline de leads.</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setSelectedContact(null);
                  setIsFormOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all text-sm"
              >
                <Plus size={18} />
                Adicionar Contato
              </button>
            </div>
          </div>

          {/* KPI Mini Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <div className="bg-surface-container-high p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Leads Ativos</span>
              <div className="text-4xl font-extrabold text-on-surface mt-2 font-headline">{stats.leads}</div>
              <div className="mt-4 flex items-center text-[10px] font-bold text-primary">
                <TrendingUp size={12} className="mr-1" /> Atualizado agora
              </div>
            </div>
            <div className="bg-surface-container-high p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">LTV Total</span>
              <div className="text-4xl font-extrabold text-on-surface mt-2 font-headline">
                ${(stats.ltv / 1000).toFixed(1)}k
              </div>
              <div className="mt-4 flex items-center text-[10px] font-bold text-on-surface-variant">
                <Wallet size={12} className="mr-1" /> Volume de transações
              </div>
            </div>
            <div className="bg-surface-container-high p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-error-container">Inativos</span>
              <div className="text-4xl font-extrabold text-error mt-2 font-headline">{stats.atRisk}</div>
              <div className="mt-4 flex items-center text-[10px] font-bold text-error">
                <AlertTriangle size={12} className="mr-1" /> Atenção necessária
              </div>
            </div>
          </div>

          {/* Search Area */}
          <div className="bg-surface-container-low p-6 rounded-2xl mb-8">
            <div className="relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input 
                type="text" 
                placeholder="Buscar por nome, e-mail ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-surface-container-lowest border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-on-surface text-sm placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>

          {deleteError && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-error-container/20 border-2 border-error/20 rounded-2xl text-error text-[11px] font-bold flex items-center justify-between gap-2 mb-6"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-error" />
                {deleteError}
              </div>
              <button onClick={() => setDeleteError(null)} className="p-1 hover:bg-error-container/10 rounded-lg transition-colors shrink-0">
                <X size={16} />
              </button>
            </motion.div>
          )}

          {/* Table Area */}
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low/50">
                  <tr className="border-b border-outline-variant/5">
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Nome</th>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Empresa</th>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Último Contato</th>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Valor</th>
                    <th className="px-8 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  <AnimatePresence>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                          <p className="text-on-surface-variant text-xs font-bold mt-4 uppercase tracking-widest">Carregando contatos...</p>
                        </td>
                      </tr>
                    ) : filteredContacts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <p className="text-on-surface-variant text-sm font-medium">Nenhum contato encontrado.</p>
                        </td>
                      </tr>
                    ) : filteredContacts.map((contact, idx) => (
                      <motion.tr 
                        key={contact.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                          "group hover:bg-surface-container-low transition-colors duration-150",
                          idx % 2 === 1 && "bg-surface-container-low/20"
                        )}
                      >
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm relative overflow-hidden",
                              contact.avatar_color || "bg-secondary-container text-on-secondary-container"
                            )}>
                              {contact.image ? (
                                <Image 
                                  src={contact.image} 
                                  alt={contact.name} 
                                  fill 
                                  className="object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                contact.initials
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-on-surface tracking-tight leading-none group-hover:text-primary transition-colors">{contact.name}</div>
                              <div className="text-[10px] text-on-surface-variant mt-1">{contact.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm text-on-surface font-semibold tracking-tight">{contact.company || '-'}</td>
                        <td className="px-8 py-5">
                          <span className={cn(
                            "px-2 py-1 text-[9px] font-black uppercase tracking-tighter rounded",
                            contact.status === 'Lead' && "bg-primary-container text-primary",
                            contact.status === 'Cliente' && "bg-secondary-container text-on-secondary-container",
                            contact.status === 'Inativo' && "bg-error-container text-white",
                          )}>
                            {contact.status}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm text-on-surface-variant">{contact.last_contact || 'N/A'}</td>
                        <td className="px-8 py-5 text-sm font-black text-on-surface text-right font-headline">
                          ${contact.value?.toLocaleString() || '0'}
                        </td>
                        <td className="px-8 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setSelectedContact(contact);
                                setIsFormOpen(true);
                              }}
                              className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded-lg transition-all"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(contact.id)}
                              className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container/10 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <ContactForm 
        isOpen={isFormOpen}
        contact={selectedContact}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedContact(null);
        }}
        onSave={fetchContacts}
      />

      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        title="Excluir contato"
        message={`Tem certeza que deseja excluir "${contactToDelete?.name || 'este contato'}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  );
}
