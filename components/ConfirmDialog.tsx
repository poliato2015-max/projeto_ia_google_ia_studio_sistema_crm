'use client';

import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-on-surface/20 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div className="bg-surface rounded-2xl shadow-2xl max-w-sm w-full p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center",
                  variant === 'danger' ? "bg-error-container/10" : "bg-primary-container/10"
                )}>
                  <AlertTriangle size={20} className={variant === 'danger' ? "text-error" : "text-primary"} />
                </div>
                <button onClick={onCancel} className="p-1.5 hover:bg-surface-container-low rounded-lg transition-colors">
                  <X size={18} className="text-on-surface-variant" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-1">{title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed mb-6">{message}</p>
              <div className="flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 py-2.5 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low rounded-lg transition-all"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className={cn(
                    "flex-[2] py-2.5 text-sm font-bold text-white rounded-lg transition-all",
                    variant === 'danger'
                      ? "bg-error hover:bg-error/90 shadow-lg shadow-error/20"
                      : "bg-primary hover:bg-primary-dim shadow-lg shadow-primary/20"
                  )}
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
