import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { ItemCategory, CATEGORIES } from '../types';

interface CategoryFilterProps {
  selectedCategory: ItemCategory | 'ALL';
  onSelectCategory: (cat: ItemCategory | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  activeCount,
}) => {
  return (
    <div className="space-y-2.5">
      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="リスト内を検索..."
          className="w-full h-9 pl-9 pr-8 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-200 placeholder:text-slate-400"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Horizontal Category Scroll Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
        <button
          type="button"
          onClick={() => onSelectCategory('ALL')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'ALL'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          すべて ({activeCount})
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? `${cat.badgeBg} ${cat.badgeText} font-bold ring-2 ring-sky-500/50 shadow-xs`
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
