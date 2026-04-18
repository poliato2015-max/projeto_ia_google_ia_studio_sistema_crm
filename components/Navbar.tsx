'use client';

import { Search, Bell, Settings, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { getSupabase, Contact } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<{ initials: string; color: string } | null>(null);
  const supabase = getSupabase();

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
        <div className="relative group hidden sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input 
            type="text" 
            placeholder="Busca rápida..."
            className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 w-64 text-sm focus:ring-2 focus:ring-primary/20 transition-all focus:bg-surface-container-lowest"
          />
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
