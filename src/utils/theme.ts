import { ThemeDefinition, ThemeId } from '../types';

export const THEMES: ThemeDefinition[] = [
  {
    id: 'slate',
    name: 'Corporate Slate',
    category: 'Enterprise Classic',
    description: 'Soft mist & slate blue matte surfaces engineered for glare-free corporate reconciliation.',
    isDark: false,
    swatches: ['#1e293b', '#2563eb', '#f5f7fa'],
    primaryColor: '#2563eb',
    headerBg: 'bg-slate-900',
    headerBorder: 'border-slate-800',
    accentBadgeBg: 'bg-blue-600',
  },
  {
    id: 'emerald',
    name: 'Emerald Ledger',
    category: 'Financial & Audit',
    description: 'Audited financial theme with calming sage canvas and pale mint parchment highlights.',
    isDark: false,
    swatches: ['#0d3830', '#059669', '#f2f7f4'],
    primaryColor: '#059669',
    headerBg: 'bg-[#0d3830]',
    headerBorder: 'border-[#165347]',
    accentBadgeBg: 'bg-emerald-600',
  },
  {
    id: 'nordic',
    name: 'Nordic Frost',
    category: 'Modern Precision',
    description: 'Soft Arctic twilight & frosted morning mist for clean, low-strain data scanning.',
    isDark: false,
    swatches: ['#152238', '#0284c7', '#f0f5fa'],
    primaryColor: '#0284c7',
    headerBg: 'bg-slate-900',
    headerBorder: 'border-slate-800',
    accentBadgeBg: 'bg-sky-600',
  },
  {
    id: 'obsidian',
    name: 'Executive Obsidian',
    category: 'Anti-Glare Dark',
    description: 'Deep velvet charcoal surfaces with anti-glare silver text and soft indigo accents.',
    isDark: true,
    swatches: ['#0e1420', '#6366f1', '#192233'],
    primaryColor: '#6366f1',
    headerBg: 'bg-[#0e1420]',
    headerBorder: 'border-slate-800',
    accentBadgeBg: 'bg-indigo-600',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    category: 'E-Reader Parchment',
    description: 'Warm antique linen & amber parchment designed for maximum eye relaxation.',
    isDark: false,
    swatches: ['#28231d', '#c26a05', '#f7f3ec'],
    primaryColor: '#c26a05',
    headerBg: 'bg-stone-900',
    headerBorder: 'border-stone-800',
    accentBadgeBg: 'bg-amber-600',
  },
];

export const DEFAULT_THEME: ThemeId = 'slate';
export const THEME_STORAGE_KEY = 'reconview_pro_theme_v1';

export function getInitialTheme(): ThemeId {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
  if (saved && THEMES.some(t => t.id === saved)) {
    return saved;
  }
  return DEFAULT_THEME;
}

export function saveTheme(theme: ThemeId): void {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
