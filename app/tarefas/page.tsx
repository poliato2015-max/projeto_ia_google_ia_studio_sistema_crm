'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

const initialTasks = [
  { id: 1, title: 'Ligar para novo lead UserX', due: 'Hoje', priority: 'Alta', status: 'pendente' },
  { id: 2, title: 'Preparar proposta para MicroSystems', due: 'Amanhã', priority: 'Média', status: 'pendente' },
  { id: 3, title: 'Atualizar CRM com notas de reunião', due: 'Ontem', priority: 'Baixa', status: 'atrasada' },
  { id: 4, title: 'Revisar contrato da CloudSoft', due: '18/04', priority: 'Alta', status: 'pendente' },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'concluída' ? 'pendente' : 'concluída' } : t));
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <Sidebar />
      
      <main className="pt-20 md:ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface mb-2">Central de Tarefas</h1>
              <p className="text-on-surface-variant text-lg font-medium">Gerencie suas atividades de acompanhamento.</p>
            </div>
            <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dim transition-all shadow-lg shadow-primary/20">
              <Plus size={20} /> Nova Tarefa
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task, i) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex items-center justify-between group hover:bg-surface-container-high transition-colors",
                  task.status === 'concluída' && "opacity-60"
                )}
              >
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                      task.status === 'concluída' ? "bg-primary border-primary text-white" : "border-outline-variant hover:border-primary"
                    )}
                  >
                    {task.status === 'concluída' && <CheckCircle2 size={14} />}
                  </button>
                  <div>
                    <h3 className={cn(
                      "font-bold text-on-surface tracking-tight",
                      task.status === 'concluída' && "line-through"
                    )}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] font-bold text-on-surface-variant flex items-center gap-1 uppercase tracking-widest">
                        <Clock size={12} /> {task.due}
                      </span>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded uppercase",
                        task.priority === 'Alta' ? "bg-error-container text-white" : "bg-secondary-container text-on-secondary-container"
                      )}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
                
                {task.status === 'atrasada' && (
                  <div className="bg-error/10 text-error p-2 rounded-lg flex items-center gap-2 text-xs font-bold">
                    <AlertCircle size={14} /> Em Atraso
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
