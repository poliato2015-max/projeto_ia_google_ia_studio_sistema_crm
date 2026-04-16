'use client';

import { Filter, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Deal } from '@/lib/supabase';

interface RiskyOpportunitiesProps {
  deals: Deal[];
}

export function RiskyOpportunities({ deals }: RiskyOpportunitiesProps) {
  return (
    <div className="mt-12 bg-surface-container-lowest rounded-2xl overflow-hidden border border-outline-variant/5 shadow-sm">
      <div className="p-6 flex justify-between items-center bg-surface-container-low/30 border-b border-outline-variant/10">
        <h3 className="text-lg font-bold font-headline text-on-surface">Oportunidades em Risco</h3>
        <button className="p-2 hover:bg-surface-container-high rounded-lg transition-colors text-on-surface-variant">
          <Filter size={18} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-wider text-on-surface-variant/50 border-b border-outline-variant/5">
              <th className="px-8 py-4">Negócio</th>
              <th className="px-8 py-4">Valor</th>
              <th className="px-8 py-4">Cliente / Conta</th>
              <th className="px-8 py-4">Índice de Saúde</th>
              <th className="px-8 py-4">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {deals.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-10 text-center text-on-surface-variant text-sm font-medium">Nenhum negócio em risco detectado.</td>
              </tr>
            ) : deals.map((deal) => (
              <tr key={deal.id} className="hover:bg-surface-container-low transition-colors group">
                <td className="px-8 py-5">
                  <div className="font-bold text-on-surface tracking-tight leading-none group-hover:text-primary transition-colors">{deal.title}</div>
                  <div className="text-[10px] text-on-surface-variant mt-1">{deal.stage}</div>
                </td>
                <td className="px-8 py-5 font-headline font-semibold text-on-surface">${deal.value.toLocaleString()}</td>
                <td className="px-8 py-5 text-sm text-on-surface-variant font-medium">
                  {deal.contact?.name}
                  <span className="block text-[10px] opacity-60 font-bold">{deal.contact?.company || 'Pessoa Física'}</span>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "px-2 py-1 text-[9px] font-black rounded uppercase tracking-tighter",
                      deal.health_score < 40 ? "bg-error-container text-white" : "bg-secondary-container text-on-secondary-container"
                    )}>
                      {deal.health_score < 40 ? 'Crítico' : 'Atenção'}
                    </span>
                    <div className="w-16 h-1.5 bg-surface-container-low rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full", deal.health_score < 40 ? "bg-error" : "bg-secondary")} 
                        style={{ width: `${deal.health_score}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <button className="text-primary text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Intervir <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
