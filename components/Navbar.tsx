'use client';

import { Search, Bell, Settings, LogOut, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase, Contact } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ initials: string; color: string } | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    contacts: Contact[];
    deals: any[];
    tasks: any[];
  }>({ contacts: [], deals: [], tasks: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const supabase = getSupabase();

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      const trimmed = query.trim();
      if (trimmed.length < 2 || !user?.id || !supabase) {
        setResults({ contacts: [], deals: [], tasks: [] });
        return;
      }

      setIsSearching(true);
      try {
        const { data: contactsData } = await supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user.id)
          .or(`name.ilike.%${trimmed}%,company.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
          .limit(5);

        const { data: dealsData } = await supabase
          .from('deals')
          .select('*')
          .eq('user_id', user.id)
          .ilike('title', `%${trimmed}%`)
          .limit(5);

        const { data: tasksData } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .ilike('title', `%${trimmed}%`)
          .limit(5);

        setResults({
          contacts: contactsData || [],
          deals: dealsData || [],
          tasks: tasksData || [],
        });
      } catch (error) {
        console.error('Error in global quick search:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, user, supabase]);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!user?.email || !supabase) return;

      try {
        const { data, error } = await supabase
          .from('contacts')
          .select('initials, avatar_color')
          .eq('email', user.email)
          .single();

        if (data) {
          setProfile({
            initials: data.initials || '',
            color: data.avatar_color || 'bg-primary'
          });
        } else {
          // Generate fallback initials from email
          const initials = user.email.split('@')[0].slice(0, 2).toUpperCase();
          setProfile({ initials, color: 'bg-primary' });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }

    fetchUserProfile();
  }, [user, supabase]);

  return (
    <header className="h-16 fixed top-0 right-0 left-0 bg-surface/80 backdrop-blur-md z-40 px-8 flex items-center justify-between border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <div className="w-64">
           {/* Sidebar takes this space on desktop */}
           <span className="text-2xl font-bold tracking-tight text-primary md:hidden">Executive Lens</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 h-full">
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-primary font-bold border-b-2 border-primary h-16 flex items-center px-1">Dashboard</Link>
            <Link href="/contatos" className="text-on-surface-variant hover:text-primary transition-colors h-16 flex items-center px-1">Contatos</Link>
            <Link href="/negocios" className="text-on-surface-variant hover:text-primary transition-colors h-16 flex items-center px-1">Negócios</Link>
          </nav>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden sm:block z-50">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant z-10" />
          <input 
            type="text" 
            placeholder="Busca rápida..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 w-64 text-sm focus:ring-2 focus:ring-primary/20 transition-all focus:bg-surface-container-lowest text-on-surface relative z-10"
          />

          {showDropdown && (
            <div 
              className="fixed inset-0 z-0 bg-transparent" 
              onClick={() => setShowDropdown(false)}
            />
          )}

          {showDropdown && query.trim().length >= 2 && (
            <div className="absolute top-full right-0 mt-2 bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl z-20 p-4 max-h-[350px] overflow-y-auto w-[320px] md:w-[400px]">
              {isSearching ? (
                <div className="flex items-center justify-center py-6 gap-2 text-on-surface-variant text-xs font-bold leading-none uppercase tracking-widest animate-pulse">
                  <Loader2 className="animate-spin text-primary" size={14} />
                  <span>Pesquisando...</span>
                </div>
              ) : results.contacts.length === 0 && results.deals.length === 0 && results.tasks.length === 0 ? (
                <div className="text-center py-6 text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">
                  Nenhum registro encontrado
                </div>
              ) : (
                <div className="space-y-4">
                  {results.contacts.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-widest mb-2 px-1 border-b border-outline-variant/10 pb-1">
                        Contatos ({results.contacts.length})
                      </h4>
                      <div className="space-y-1">
                        {results.contacts.map((contact) => (
                          <button
                            key={contact.id}
                            onClick={() => {
                              window.location.href = `/contatos?search=${encodeURIComponent(contact.name)}`;
                              setShowDropdown(false);
                              setQuery('');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-low transition-all text-xs flex items-center justify-between group"
                          >
                            <div className="truncate pr-2">
                              <div className="font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                                {contact.name}
                              </div>
                              <div className="text-[10px] text-on-surface-variant truncate">
                                {contact.company || 'Pessoa Física'} • {contact.email}
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded bg-primary-container text-primary shrink-0">
                              {contact.status}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.deals.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-widest mb-2 px-1 border-b border-outline-variant/10 pb-1">
                        Negócios ({results.deals.length})
                      </h4>
                      <div className="space-y-1">
                        {results.deals.map((deal) => (
                          <button
                            key={deal.id}
                            onClick={() => {
                              window.location.href = `/negocios?search=${encodeURIComponent(deal.title)}`;
                              setShowDropdown(false);
                              setQuery('');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-low transition-all text-xs flex items-center justify-between group"
                          >
                            <div className="truncate pr-2">
                              <div className="font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                                {deal.title}
                              </div>
                              <div className="text-[10px] text-on-surface-variant truncate">
                                LTV: ${deal.value?.toLocaleString() || '0'}
                              </div>
                            </div>
                            <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded bg-secondary-container text-on-secondary-container shrink-0">
                              {deal.stage}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.tasks.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-on-surface-variant/60 tracking-widest mb-2 px-1 border-b border-outline-variant/10 pb-1">
                        Tarefas ({results.tasks.length})
                      </h4>
                      <div className="space-y-1">
                        {results.tasks.map((task) => (
                          <button
                            key={task.id}
                            onClick={() => {
                              window.location.href = `/tarefas?search=${encodeURIComponent(task.title)}`;
                              setShowDropdown(false);
                              setQuery('');
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-surface-container-low transition-all text-xs flex items-center justify-between group"
                          >
                            <div className="truncate pr-2">
                              <div className="font-bold text-on-surface group-hover:text-primary transition-colors truncate">
                                {task.title}
                              </div>
                              <div className="text-[10px] text-on-surface-variant truncate">
                                Vencimento: {new Date(task.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                            <span className={cn(
                              "px-1.5 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded shrink-0",
                              task.priority === 'Alta' ? "bg-error text-white" : 
                              task.priority === 'Média' ? "bg-secondary-container text-on-secondary-container" :
                              "bg-surface-container-highest text-on-surface-variant"
                            )}>
                              {task.priority}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
            <Settings size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/15">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-bold text-on-surface leading-none truncate max-w-[200px] mb-1">{user?.email || 'Carregando...'}</p>
            <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Acesso Ativo</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-black text-xs transition-transform hover:scale-105 border-2 border-primary/10 shadow-sm text-white",
              profile?.color || "bg-primary"
            )}>
              {profile?.initials || 'EL'}
            </div>
            <button 
              onClick={() => {
                console.log('Navbar: LogOut clicked');
                signOut();
              }}
              className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-full transition-all"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
