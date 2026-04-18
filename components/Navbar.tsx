'use client';

import { Search, Bell, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';

import { useAuth } from '@/components/AuthProvider';

export function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 fixed top-0 right-0 left-0 bg-surface/80 backdrop-blur-md z-40 px-8 flex items-center justify-between border-b border-outline-variant/10">
      <div className="flex items-center gap-8">
        <div className="w-64">
           {/* Sidebar takes this space on desktop */}
           <span className="text-2xl font-bold tracking-tight text-primary md:hidden">Executive Lens</span>
        </div>
        
        <div className="hidden md:flex items-center gap-6 h-full">
          <nav className="flex items-center gap-6">
            <a href="#" className="text-primary font-bold border-b-2 border-primary h-16 flex items-center px-1">Dashboard</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors h-16 flex items-center px-1">Leads</a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors h-16 flex items-center px-1">Previsão</a>
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
            <p className="text-sm font-bold leading-none truncate max-w-[150px]">{user?.email?.split('@')[0] || 'Carregando...'}</p>
            <p className="text-[10px] text-on-surface-variant leading-none mt-1 uppercase tracking-widest">{user?.email || 'Acesso Restrito'}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-container relative bg-primary/10 flex items-center justify-center">
               {user?.email ? (
                 <Image 
                  src={`https://picsum.photos/seed/${user.id}/100/100`} 
                  alt="Perfil" 
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
               ) : (
                 <div className="text-primary font-black text-xs">EL</div>
               )}
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
