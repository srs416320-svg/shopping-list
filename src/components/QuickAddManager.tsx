import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Plus, Trash2, Tag, ChevronDown, ChevronUp, RotateCcw, Check, ShoppingBag } from 'lucide-react';
import { QuickAddItem, ItemCategory, CATEGORIES } from '../types';

interface QuickAddManagerProps {
  quickItems: QuickAddItem[];
  onAddQuickItem: (text: string, category: ItemCategory) => Promise<void>;
  onDeleteQuickItem: (id: string) => Promise<void>;
  onRestoreDefaults: () => Promise<void>;
  onAddShoppingItem: (text: string, category?: ItemCategory) => Promise<void>;
  isSubmitting: boolean;
}

export const QuickAddManager: React.FC<QuickAddManagerProps> = ({
  quickItems,
  onAddQuickItem,
  onDeleteQuickItem,
  onRestoreDefaults,
  onAddShoppingItem,
  isSubmitting,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [newText, setNewText] = useState('');
  const [newCategory, setNewCategory] = useState<ItemCategory>('食品');
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || isAddingNew) return;

    setIsAddingNew(true);
    try {
      await onAddQuickItem(newText.trim(), newCategory);
      setNewText('');
    } catch (err) {
      console.error('Failed to add quick item', err);
    } finally {
      setIsAddingNew(false);
    }
  };

  const handleTapAdd = async (item: QuickAddItem) => {
    if (isSubmitting) return;

    // Trigger visual check animation
    setAddedItemIds((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [item.id]: false }));
    }, 1200);

    await onAddShoppingItem(item.text, item.category);
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await onRestoreDefaults();
    } catch (err) {
      console.error('Failed to restore default quick items', err);
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="pt-4 border-t border-slate-200/80 space-y-3">
      {/* Section Toggle Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-sky-700 py-1"
        >
          <div className="p-1 bg-amber-100 text-amber-600 rounded-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>ワンタップ追加の品目管理 ({quickItems.length}件)</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {quickItems.length < 5 && (
          <button
            type="button"
            onClick={handleRestore}
            disabled={isRestoring}
            className="text-[11px] text-slate-500 hover:text-sky-700 hover:bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1 transition-colors"
            title="標準定番品目を一括復元"
          >
            <RotateCcw className="w-3 h-3" />
            <span>定番品目を復元</span>
          </button>
        )}
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4"
        >
          <p className="text-xs text-slate-500">
            よく買いたい品目を事前登録しておくと、買い出し前に<strong>タップ1回で買い物リストに追加</strong>できます。
          </p>

          {/* Quick Item List Pills */}
          {quickItems.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
              <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">登録されているワンタップ品目がありません</p>
              <button
                type="button"
                onClick={handleRestore}
                disabled={isRestoring}
                className="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 px-3 py-1.5 rounded-lg border border-sky-200 inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>定番サンプル品目をセット追加</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {quickItems.map((item) => {
                  const isRecentlyAdded = addedItemIds[item.id];
                  const categoryInfo = CATEGORIES.find((c) => c.id === item.category);

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                        isRecentlyAdded
                          ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                          : 'bg-slate-50 hover:bg-sky-50/60 text-slate-700 border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      {/* Tap to add to shopping list */}
                      <button
                        type="button"
                        onClick={() => handleTapAdd(item)}
                        disabled={isSubmitting}
                        className="flex items-center gap-1.5 active:scale-95 transition-transform"
                        title="買い物リストに追加"
                      >
                        {isRecentlyAdded ? (
                          <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                        ) : (
                          <Plus className="w-3.5 h-3.5 text-sky-600 stroke-[2.5]" />
                        )}
                        <span className="font-semibold">{item.text}</span>

                        {categoryInfo && !isRecentlyAdded && (
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${categoryInfo.badgeBg} ${categoryInfo.badgeText}`}>
                            {categoryInfo.label}
                          </span>
                        )}
                      </button>

                      {/* Delete from Quick Add list */}
                      <button
                        type="button"
                        onClick={() => onDeleteQuickItem(item.id)}
                        className={`p-1 rounded-full transition-colors ${
                          isRecentlyAdded
                            ? 'text-white/80 hover:text-white hover:bg-sky-600'
                            : 'text-slate-300 hover:text-rose-600 hover:bg-rose-50'
                        }`}
                        title="ワンタップ品目から削除"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* New Quick Item Registration Form */}
          <form onSubmit={handleRegister} className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-sky-600" />
              <span>新しいワンタップ品目を追加・登録</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                placeholder="例: マヨネーズ、ヨーグルト"
                className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 bg-slate-50"
              />
              <button
                type="submit"
                disabled={!newText.trim() || isAddingNew}
                className="h-10 px-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isAddingNew ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>登録</span>
                  </>
                )}
              </button>
            </div>

            {/* Category selector chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNewCategory(cat.id)}
                  className={`px-2 py-0.5 text-[11px] rounded-md transition-colors ${
                    newCategory === cat.id
                      ? `${cat.badgeBg} ${cat.badgeText} font-bold ring-1 ring-sky-400`
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
};
