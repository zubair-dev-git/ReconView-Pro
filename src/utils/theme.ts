import { ThemeDefinition, ThemeId } from '../types';

export const THEMES: ThemeDefinition[] = [
  {
    id: 'slate',
    name: 'Corporate Slate',
    category: 'Enterprise Classic',
    description: 'Crisp cobalt & deep slate blue engineered for high-density corporate reconciliation.',
    isDark: false,
    swatches: ['#0f172a', '#2563eb', '#f8fafc'],
    primaryColor: '#2563eb',
    headerBg: 'bg-slate-900',
    headerBorder: 'border-slate-800',
    accentBadgeBg: 'bg-blue-600',
  },
  {
    id: 'emerald',
    name: 'Emerald Ledger',
    category: 'Financial & Audit',
    description: 'Audited financial theme with deep pine headers and emerald balance highlights.',
    isDark: false,
    swatches: ['#062e26', '#059669', '#f4f8f6'],
    primaryColor: '#059669',
    headerBg: 'bg-[#062e26]',
    headerBorder: 'border-[#0a4539]',
    accentBadgeBg: 'bg-emerald-600',
  },
  {
    id: 'nordic',
    name: 'Nordic Frost',
    category: 'Modern Precision',
    description: 'High-clarity steel graphite and Arctic cyan for clean, distraction-free data scanning.',
    isDark: false,
    swatches: ['#0f172a', '#0284c7', '#f1f5f9'],
    primaryColor: '#0284c7',
    headerBg: 'bg-slate-900',
    headerBorder: 'border-slate-800',
    accentBadgeBg: 'bg-sky-600',
  },
  {
    id: 'obsidian',
    name: 'Executive Obsidian',
    category: 'High-Contrast Dark',
    description: 'Refined dark mode with pitch obsidian surfaces, soft indigo accents, and anti-glare typography.',
    isDark: true,
    swatches: ['#090d16', '#6366f1', '#111827'],
    primaryColor: '#6366f1',
    headerBg: 'bg-[#090d16]',
    headerBorder: 'border-slate-800',
    accentBadgeBg: 'bg-indigo-600',
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    category: 'Logistics & Supply',
    description: 'Warm espresso tones and burnished amber crafted for warehouse & delivery reconciliation.',
    isDark: false,
    swatches: ['#1c1917', '#d97706', '#fafaf9'],
    primaryColor: '#d97706',
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
