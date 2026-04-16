'use client';

import { Phone, FileText, Mail, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

const tasks = [
  { id: 1, title: 'Follow-up: Acme Corp', time: 'Vencimento: 14:00', icon: Phone, color: 'primary' },
  { id: 2, title: 'Revisão de Contrato: Globex', time: 'Atrasado', icon: FileText, color: 'error', isAlert: true },
  { id: 3, title: 'Prospecção Fria: Startups', time: '25 pendentes', icon: Mail, color: 'secondary' },
];

export function PriorityTasks() {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-headline text-on-surface">Tarefas Prioritárias</h3>
        <button className="text-primary text-xs font-bold hover:underline">Ver Todas</button>
      </div>
      
      <div className="space-y-4">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 group hover:shadow-sm transition-all"
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
              task.color === 'primary' && "bg-primary-container text-primary group-hover:bg-primary group-hover:text-white",
              task.color === 'error' && "bg-error-container text-error group-hover:bg-error group-hover:text-white",
              task.color === 'secondary' && "bg-secondary-container text-secondary group-hover:bg-secondary group-hover:text-white",
            )}>
              <task.icon size={20} />
            </div>
            
            <div className="flex-1">
              <div className="text-sm font-bold text-on-surface tracking-tight leading-tight">{task.title}</div>
              <div className={cn(
                "text-[10px] mt-0.5",
                task.isAlert ? "text-error font-bold" : "text-on-surface-variant"
              )}>{task.time}</div>
            </div>
            
            <button className="p-1 text-on-surface-variant/40 hover:text-primary transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
