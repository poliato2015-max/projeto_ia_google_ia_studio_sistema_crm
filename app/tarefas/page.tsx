'use client';

import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Plus,
  Loader2,
  Trash2,
  Edit2,
  RefreshCcw,
  Search
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { getSupabase, Task } from '@/lib/supabase';
import { TaskForm } from '@/components/TaskForm';
import { useAuth } from '@/components/AuthProvider';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const supabase = getSupabase();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const search = params.get('search');
      if (search) {
        setSearchTerm(search);
      }
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const toggleTask = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!supabase || !user) return;
    const newStatus = task.status === 'concluída' ? 'pendente' : 'concluída';
    const now = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          updated_at: now
        })
        .eq('id', task.id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus as any, updated_at: now } : t));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!supabase || !user) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      setTasks(prev => prev.filter(t => t.id !== id));
      setDeletingId(null);
      setActiveTaskId(null);
    } catch (error: any) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(null);
  };

  const handleEdit = (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsFormOpen(true);
  };

  const handleNew = () => {
    setSelectedTask(null);
    setIsFormOpen(true);
  };

  const getStatusLabel = (task: Task) => {
    const today = new Date().toISOString().split('T')[0];
    if (task.status === 'concluída') return { label: 'Concluída', color: 'text-primary' };
    if (task.due_date < today) return { label: 'Em Atraso', color: 'text-error' };
    
    const labels: Record<string, string> = {
      'pendente': 'Pendente',
      'em_progresso': 'Em Andamento',
      'atrasada': 'Atrasada'
    };
    
    return { 
      label: labels[task.status] || task.status, 
      color: 'text-on-surface-variant' 
    };
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <button 
              onClick={handleNew}
              className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dim transition-all shadow-lg shadow-primary/20"
            >
              <Plus size={20} /> Nova Tarefa
            </button>
          </div>

          {/* Área de Busca */}
          {tasks.length > 0 && (
            <div className="mb-6 max-w-md relative group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input 
                type="text" 
                placeholder="Pesquisar tarefas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all focus:bg-surface-container-lowest text-on-surface font-medium" 
              />
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="text-primary animate-spin mb-4" size={48} />
              <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs">Carregando tarefas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-low rounded-3xl border-2 border-dashed border-outline-variant/20">
              <ClipboardList className="mx-auto text-on-surface-variant/20 mb-4" size={64} />
              <h3 className="text-xl font-bold text-on-surface">Nenhuma tarefa encontrada</h3>
              <p className="text-on-surface-variant mt-2 mb-8">Comece criando sua primeira atividade de acompanhamento.</p>
              <button 
                onClick={handleNew}
                className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
              >
                <Plus size={18} /> Criar agora
              </button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-low rounded-3xl border border-outline-variant/10">
              <ClipboardList className="mx-auto text-on-surface-variant/20 mb-4" size={48} />
              <h3 className="text-lg font-bold text-on-surface">Nenhuma tarefa correspondente</h3>
              <p className="text-on-surface-variant mt-2">Nenhuma tarefa encontrada com o termo &quot;{searchTerm}&quot;.</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="mt-6 inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2.5 rounded-xl font-bold hover:bg-primary/15 transition-all text-xs uppercase tracking-widest"
              >
                Limpar pesquisa
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTasks.map((task, i) => {
                const isOverdue = task.status !== 'concluída' && task.due_date < new Date().toISOString().split('T')[0];
                const isActive = activeTaskId === task.id;
                const statusInfo = getStatusLabel(task);
                
                return (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setActiveTaskId(isActive ? null : task.id)}
                    className={cn(
                      "bg-surface-container-low p-6 rounded-3xl border transition-all cursor-pointer",
                      isActive 
                        ? "border-primary/40 bg-surface-container-high ring-1 ring-primary/20 shadow-lg shadow-primary/5" 
                        : "border-outline-variant/10 hover:bg-surface-container-high",
                      task.status === 'concluída' && !isActive && "opacity-40"
                    )}
                  >
                    <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_180px_220px] items-center gap-4 md:gap-8">
                      <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                        <div className={cn(
                          "w-10 h-10 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
                          task.status === 'concluída' ? "bg-primary border-primary text-white" : "border-outline-variant"
                        )}>
                          {task.status === 'concluída' ? <CheckCircle2 size={24} /> : <div className="w-2 h-2 rounded-full bg-outline-variant" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className={cn(
                            "text-lg md:text-xl font-bold text-on-surface tracking-tight mb-1 truncate",
                            task.status === 'concluída' && "opacity-50"
                          )}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              "text-[10px] md:text-xs font-bold flex items-center gap-1.5 uppercase tracking-widest",
                              isOverdue ? "text-error" : "text-on-surface-variant"
                            )}>
                              <Clock size={14} /> {new Date(task.due_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </span>
                            <span className={cn(
                              "text-[9px] md:text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider",
                              task.priority === 'Alta' ? "bg-error-container text-white" : 
                              task.priority === 'Média' ? "bg-secondary-container text-on-secondary-container" :
                              "bg-surface-container-highest text-on-surface-variant"
                            )}>
                              {task.priority}
                            </span>
                            {task.updated_at && (
                              <span className="text-[9px] font-bold text-on-surface-variant/40 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-on-surface-variant/20" />
                                Atualizado às {new Date(task.updated_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-start gap-1 w-[120px] md:w-[150px]">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">Status</span>
                        <div className={cn(
                          "text-xs md:text-sm font-bold flex items-center gap-2",
                          statusInfo.color
                        )}>
                          {isOverdue && <AlertCircle size={14} />}
                          {statusInfo.label}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end min-w-[100px]">
                        {isActive && (
                          <div className="flex items-center gap-2">
                            {deletingId === task.id ? (
                              <div className="flex flex-col items-center gap-2 animate-in zoom-in-95 duration-200">
                                <span className="text-[10px] font-bold text-error uppercase tracking-[0.1em]">Confirma exclusão?</span>
                                <div className="flex items-center gap-2 bg-error/10 p-1.5 rounded-xl border border-error/20">
                                  <button 
                                    onClick={(e) => deleteTask(e, task.id)}
                                    className="bg-error text-white text-[10px] font-bold uppercase px-4 py-2 rounded-lg hover:bg-error-dim transition-all shadow-sm"
                                  >
                                    Sim
                                  </button>
                                  <button 
                                    onClick={cancelDelete}
                                    className="bg-surface-container-highest text-on-surface-variant text-[10px] font-bold uppercase px-4 py-2 rounded-lg hover:bg-surface-container-low transition-all"
                                  >
                                    Não
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 animate-in fade-in slide-in-from-right-4 duration-300">
                                <button 
                                  onClick={(e) => toggleTask(e, task)}
                                  className="p-3 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative group/btn"
                                  title={task.status === 'concluída' ? 'Reabrir' : 'Concluir'}
                                >
                                  {task.status === 'concluída' ? <RefreshCcw size={18} /> : <CheckCircle2 size={18} />}
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-widest z-10 transition-all">
                                    {task.status === 'concluída' ? 'Reabrir' : 'Concluir'}
                                  </span>
                                </button>

                                <button 
                                  onClick={(e) => handleEdit(e, task)}
                                  className="p-3 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-xl transition-all relative group/btn"
                                  title="Editar"
                                >
                                  <Edit2 size={18} />
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-widest z-10 transition-all">
                                    Editar
                                  </span>
                                </button>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setDeletingId(task.id); }}
                                  className="p-3 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-xl transition-all relative group/btn"
                                  title="Excluir"
                                >
                                  <Trash2 size={18} />
                                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] px-2 py-1 rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none font-bold uppercase tracking-widest z-10 transition-all">
                                    Excluir
                                  </span>
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          
          <TaskForm 
            isOpen={isFormOpen} 
            task={selectedTask}
            onClose={() => setIsFormOpen(false)} 
            onSave={fetchTasks} 
          />
        </div>
      </main>
    </div>
  );
}
