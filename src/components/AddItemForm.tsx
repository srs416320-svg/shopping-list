import React, { useState } from 'react';
import { Plus, Tag, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { ItemCategory, CATEGORIES, QUICK_SUGGESTIONS, QuickAddItem } from '../types';

interface AddItemFormProps {
  onAddItem: (text: string, category?: ItemCategory, quantity?: string) => Promise<void>;
  isSubmitting: boolean;
  quickItems?: QuickAddItem[];
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, isSubmitting, quickItems = [] }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<ItemCategory | ''>('食品');
  const [quantity, setQuantity] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(true);

  const displayQuickItems = quickItems.length > 0
    ? quickItems.map(q => ({ text: q.text, category: q.category || ('その他' as ItemCategory) }))
    : QUICK_SUGGESTIONS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    await onAddItem(text.trim(), category || undefined, quantity.trim() || undefined);
    setText('');
    setQuantity('');
  };

  const handleQuickAdd = async (presetText: string, presetCat: ItemCategory) => {
    if (isSubmitting) return;
    await onAddItem(presetText, presetCat);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
      {/* Primary Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            id="item-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="買うものを入力 (例: 牛乳、人参...)"
            className="flex-1 h-12 px-4 rounded-xl border border-slate-300 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none text-slate-800 text-base placeholder:text-slate-400 bg-slate-50/50"
            disabled={isSubmitting}
          />
          <button
            id="add-item-btn"
            type="submit"
            disabled={!text.trim() || isSubmitting}
            className="h-12 px-5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold rounded-xl shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span className="hidden sm:inline text-sm">追加</span>
              </>
            )}
          </button>
        </div>

        {/* Detailed Options toggle (Category & Quantity) */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-slate-500 hover:text-sky-700 font-medium flex items-center gap-1 py-1 px-1.5 rounded-md hover:bg-slate-100 transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-sky-600" />
            <span>カテゴリ・数量を指定 {showDetails ? '▲' : '▼'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowQuickAdd(!showQuickAdd)}
            className="text-slate-400 hover:text-slate-600 flex items-center gap-1 py-1 px-1.5 rounded-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>よく買うもの</span>
          </button>
        </div>

        {/* Category & Quantity Expansion */}
        {showDetails && (
          <div className="pt-2 border-t border-slate-100 space-y-3 animate-fadeIn">
            {/* Category Select Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">カテゴリ</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                        isSelected
                          ? `${cat.badgeBg} ${cat.badgeText} ring-2 ring-sky-500/50 font-semibold`
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity / Note Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">数量・メモ（任意）</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="例: 2本、1パック、特売のもの"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-sky-500 bg-slate-50"
              />
            </div>
          </div>
        )}
      </form>

      {/* 1-Tap Quick Suggestions Pills */}
      {showQuickAdd && (
        <div className="pt-2 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            1タップで追加（よく見る定番品）:
          </div>
          <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-0.5">
            {displayQuickItems.map((item, idx) => (
              <button
                key={`${item.text}-${idx}`}
                type="button"
                onClick={() => handleQuickAdd(item.text, item.category)}
                disabled={isSubmitting}
                className="px-2.5 py-1 bg-sky-50/80 hover:bg-sky-100/80 text-sky-800 border border-sky-200/60 text-xs font-medium rounded-full transition-all active:scale-95 disabled:opacity-50 shrink-0 flex items-center gap-1"
              >
                <span>+ {item.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
