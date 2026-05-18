'use client';

import { useState, useEffect, useCallback } from 'react';
import { Phone, FileText, Mail, MoreVertical, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSupabase, Task } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

export function PriorityTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = getSupabase();

  const fetchPriorityTasks = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .neq('status', 'concluída')
        .order('due_date', { ascending: true })
        .limit(3);
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching priority tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchPriorityTasks();
  }, [fetchPriorityTasks]);

  const getTaskIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('ligar') || t.includes('call') || t.includes('telefone') || t.includes('follow-up')) return Phone;
    if (t.includes('email') || t.includes('e-mail') || t.includes('mensagem') || t.includes('prospecção')) return Mail;
    return FileText;
  };

  const getTaskColor = (task: Task) => {
    const today = new Date().toISOString().split('T')[0];
    if (task.due_date < today && task.status !== 'concluída') return 'error';
    if (task.priority === 'Alta') return 'primary';
    return 'secondary';
  };

  return (
    <div className="bg-surface-container-low rounded-2xl p-6 border border-outline-variant/10 h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold font-headline text-on-surface">Tarefas Prioritárias</h3>
        <Link href="/tarefas" className="text-primary text-xs font-bold hover:underline">Ver Todas</Link>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="text-primary animate-spin" size={24} />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10 text-on-surface-variant/40">
          <p className="text-xs font-bold uppercase tracking-widest">Sem tarefas urgentes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => {
            const Icon = getTaskIcon(task.title);
            const color = getTaskColor(task);
            const today = new Date().toISOString().split('T')[0];
            const isOverdue = task.due_date < today;
            
            return (
              <div 
                key={task.id} 
                className="bg-surface-container-lowest p-4 rounded-xl flex items-center gap-4 group hover:shadow-sm transition-all"
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  color === 'primary' && "bg-primary-container text-primary group-hover:bg-primary group-hover:text-white",
                  color === 'error' && "bg-error-container text-error group-hover:bg-error group-hover:text-white",
                  color === 'secondary' && "bg-secondary-container text-secondary group-hover:bg-secondary group-hover:text-white",
                )}>
                  <Icon size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-on-surface tracking-tight leading-tight truncate">{task.title}</div>
                  <div className={cn(
                    "text-[10px] mt-0.5 flex items-center gap-1",
                    isOverdue ? "text-error font-bold" : "text-on-surface-variant"
                  )}>
                    {isOverdue ? 'Atrasado' : `Vencimento: ${new Date(task.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}`}
                  </div>
                </div>
                
                <Link 
                  href="/tarefas"
                  className="p-1 text-on-surface-variant/40 hover:text-primary transition-colors"
                >
                  <MoreVertical size={18} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
