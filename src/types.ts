import { Timestamp } from 'firebase/firestore';

export interface ShoppingItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Timestamp | Date | null;
  userId: string;
  userName?: string;
  userPhoto?: string;
  category?: string;
  quantity?: string;
  familyGroup?: string;
}

export interface QuickAddItem {
  id: string;
  text: string;
  category?: ItemCategory;
  familyGroup?: string;
  createdAt?: Timestamp | Date | null;
}

export type ItemCategory = 
  | '食品'
  | '日用品'
  | 'その他';

export interface CategoryInfo {
  id: ItemCategory;
  label: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: '食品', label: '食品', iconName: 'Apple', badgeBg: 'bg-sky-100', badgeText: 'text-sky-800' },
  { id: '日用品', label: '日用品', iconName: 'ShoppingBag', badgeBg: 'bg-indigo-100', badgeText: 'text-indigo-800' },
  { id: 'その他', label: 'その他', iconName: 'Tag', badgeBg: 'bg-slate-100', badgeText: 'text-slate-800' },
];

export const normalizeCategory = (cat?: string): ItemCategory => {
  if (!cat) return 'その他';
  if (cat === '食品' || cat === '日用品' || cat === 'その他') return cat;
  if (['野菜・果物', '肉・魚', '乳製品・卵', '惣菜・パン', '飲料・お菓子'].includes(cat)) return '食品';
  if (['日用品・コスメ'].includes(cat)) return '日用品';
  return 'その他';
};

export const QUICK_SUGGESTIONS = [
  { text: '牛乳', category: '食品' as ItemCategory },
  { text: '卵 (10個入)', category: '食品' as ItemCategory },
  { text: '食パン', category: '食品' as ItemCategory },
  { text: '納豆', category: '食品' as ItemCategory },
  { text: 'キャベツ', category: '食品' as ItemCategory },
  { text: '豚肉スライス', category: '食品' as ItemCategory },
  { text: 'ティッシュ', category: '日用品' as ItemCategory },
  { text: 'トイレットペーパー', category: '日用品' as ItemCategory },
  { text: 'お茶 2L', category: '食品' as ItemCategory },
];
