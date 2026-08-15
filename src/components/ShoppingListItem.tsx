import React from 'react';
import { motion } from 'motion/react';
import { Check, Trash2, Tag, User } from 'lucide-react';
import { ShoppingItem, CATEGORIES, normalizeCategory } from '../types';

interface ShoppingListItemProps {
  item: ShoppingItem;
  onToggleComplete: (id: string, currentCompleted: boolean) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  isUpdating: boolean;
}

export const ShoppingListItem: React.FC<ShoppingListItemProps> = ({
  item,
  onToggleComplete,
  onDeleteItem,
  isUpdating,
}) => {
  const normCat = normalizeCategory(item.category);
  const categoryConfig = CATEGORIES.find((c) => c.id === normCat) || CATEGORIES[CATEGORIES.length - 1];

  const handleCheckboxClick = () => {
    if (isUpdating) return;
    onToggleComplete(item.id, item.completed);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;
    onDeleteItem(item.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-xl border transition-all ${
        item.completed
          ? 'bg-slate-50/80 border-slate-200/60 opacity-60'
          : 'bg-white border-slate-200 shadow-xs hover:border-sky-300'
      }`}
    >
      {/* Left section: Large checkbox + item content */}
      <div 
        onClick={handleCheckboxClick} 
        className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer py-0.5 select-none"
      >
        {/* Big Touch-friendly Checkbox */}
        <div
          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
            item.completed
              ? 'bg-sky-500 border-sky-500 text-white shadow-xs'
              : 'border-slate-300 group-hover:border-sky-500 bg-white'
          }`}
        >
          {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
        </div>

        {/* Item Text & Badges */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-base font-semibold leading-tight break-words ${
                item.completed ? 'line-through text-slate-400 font-normal' : 'text-slate-800'
              }`}
            >
              {item.text}
            </span>

            {/* Quantity Badge if available */}
            {item.quantity && (
              <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-700 font-medium rounded-full border border-amber-200/60 shrink-0">
                {item.quantity}
              </span>
            )}
          </div>

          {/* Sub-info: Category & Added By */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 flex-wrap">
            <span className={`px-2 py-0.5 rounded-md font-medium text-[10px] ${categoryConfig.badgeBg} ${categoryConfig.badgeText}`}>
              {normCat}
            </span>

            {item.userName && (
              <span className="flex items-center gap-1 text-slate-400">
                <User className="w-3 h-3 text-slate-300" />
                <span>{item.userName}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right action: Delete button */}
      <button
        type="button"
        onClick={handleDeleteClick}
        disabled={isUpdating}
        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-2 shrink-0 active:scale-95"
        title="削除"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
