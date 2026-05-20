'use client';

import { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Task, getSupabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';

interface TaskFormProps {
  task?: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function TaskForm({ task, isOpen, onClose, onSave }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const supabase = getSupabase();
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    due_date: new Date().toISOString().split('T')[0],
    priority: 'Média',
    status: 'pendente',
  });

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfirmDelete(false);
      if (task) {
        setFormData(task);
      } else {
        setFormData({
          title: '',
          due_date: new Date().toISOString().split('T')[0],
          priority: 'Média',
          status: 'pendente',
        });
      }
    }
  }, [task, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) return;
    setLoading(true);

    try {
      const now = new Date().toISOString();
      const dataToSave = {
        ...formData,
        user_id: user.id,
        updated_at: now,
      };

      if (task?.id) {
        const { error } = await supabase
          .from('tasks')
          .update(dataToSave)
          .eq('id', task.id)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{ ...dataToSave, created_at: now }]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!task?.id || !supabase || !user) return;
    
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)
        .eq('user_id', user.id);
      if (error) throw error;
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-surface shadow-2xl z-[70] p-8 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black font-headline text-on-surface">
                {task ? 'Editar Tarefa' : 'Nova Tarefa'}
              </h2>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="p-2 hover:bg-surface-container-low rounded-lg transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Título da Tarefa</label>
                <input
                  required
                  type="text"
                  placeholder="Ex: Follow-up com cliente"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Data de Vencimento</label>
                <input
                  required
                  type="date"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Prioridade</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-on-surface-variant mb-2 block tracking-widest">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-surface-container-low border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_progresso">Em Progresso</option>
                    <option value="concluída">Concluída</option>
                    <option value="atrasada">Atrasada</option>
                  </select>
                </div>
              </div>

              <div className="pt-8 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-on-surface-variant font-bold hover:bg-surface-container-low rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] py-3 bg-primary text-white font-bold rounded-lg shadow-lg shadow-primary/20 hover:bg-primary-dim transition-all disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Salvar Tarefa'}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
