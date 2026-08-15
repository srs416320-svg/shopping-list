import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, ChevronDown, ChevronUp, Trash2, AlertTriangle } from 'lucide-react';
import { ShoppingItem } from '../types';
import { ShoppingListItem } from './ShoppingListItem';

interface CompletedSectionProps {
  completedItems: ShoppingItem[];
  onToggleComplete: (id: string, currentCompleted: boolean) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onClearAllCompleted: () => Promise<void>;
  isUpdating: boolean;
}

export const CompletedSection: React.FC<CompletedSectionProps> = ({
  completedItems,
  onToggleComplete,
  onDeleteItem,
  onClearAllCompleted,
  isUpdating,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (completedItems.length === 0) return null;

  const handleConfirmClear = async () => {
    setIsDeleting(true);
    try {
      await onClearAllCompleted();
      setShowConfirmModal(false);
    } catch (err) {
      console.error('Batch delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-200/80 space-y-3">
      {/* Header and Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 py-1"
        >
          <CheckCircle className="w-4 h-4 text-sky-500" />
          <span>完了済み ({completedItems.length}件)</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <button
          id="clear-all-completed-btn"
          type="button"
          onClick={() => setShowConfirmModal(true)}
          disabled={isUpdating || isDeleting}
          className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200/60 font-medium flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>完了済みを一括削除</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-xl border border-slate-100"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">完了済みを一括削除</h3>
                <p className="text-xs text-slate-500 mt-1">
                  完了した買い出しアイテム {completedItems.length} 件をすべて削除します。よろしいですか？
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                キャンセル
              </button>
              <button
                id="confirm-clear-btn"
                type="button"
                onClick={handleConfirmClear}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isDeleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                <span>削除する</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Completed Items list */}
      {isOpen && (
        <div className="space-y-2">
          <AnimatePresence>
            {completedItems.map((item) => (
              <ShoppingListItem
                key={item.id}
                item={item}
                onToggleComplete={onToggleComplete}
                onDeleteItem={onDeleteItem}
                isUpdating={isUpdating}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
