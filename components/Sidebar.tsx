'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Handshake, 
  BarChart3, 
  ClipboardList, 
  HelpCircle, 
  LogOut 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Contatos', icon: Users, href: '/contatos' },
  { name: 'Negócios', icon: Handshake, href: '/negocios' },
  { name: 'Métricas', icon: BarChart3, href: '/metricas' },
  { name: 'Tarefas', icon: ClipboardList, href: '/tarefas' },
];

const secondaryItems = [
  { name: 'Central de Ajuda', icon: HelpCircle, href: '/ajuda' },
  { name: 'Sair', icon: LogOut, href: '/sair' },
];

import { useAuth } from '@/components/AuthProvider';

export function Sidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-surface-container-low dark:bg-slate-900 py-8 px-4 z-30 pt-20">
      <div className="mb-8 px-2">
        <h1 className="text-xl font-black text-primary font-headline">Portal de Vendas</h1>
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Nível Enterprise</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-surface-container-highest text-primary font-bold" 
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
              )}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-sm font-medium tracking-tight leading-none">{item.name}</span>
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 pt-6 border-t border-outline-variant/15">
        <Link
          href="/ajuda"
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all"
        >
          <HelpCircle size={18} />
          <span className="text-sm font-medium tracking-tight leading-none">Central de Ajuda</span>
        </Link>
        <button
          onClick={() => {
            console.log('Sidebar: LogOut clicked');
            signOut();
          }}
          className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-high rounded-xl transition-all w-full text-left"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium tracking-tight leading-none">Sair</span>
        </button>
      </div>
    </aside>
  );
}
