export interface RawRow {
  id: string;
  sl: string | number;
  po: string;
  item: string;
  challan: string;
  text: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  isChecked?: boolean;
}

export interface ExtractedRow {
  id: string; // generated unique key for the group (e.g., po_challan_unit_text)
  po: string;
  unit: string;
  challan: string;
  text: string;
  sumUnitPrice: number;
  sumQuantity: number;
  sumAmount: number;
  rawRowCount: number;
  rawRowIds: string[];
  rawRows: RawRow[];
  isChecked: boolean;
  checkedAt?: string;
  notes?: string;
}

export interface ChallanGroup {
  challan: string;
  poList: string[];
  units: string[];
  totalQuantity: number;
  totalAmount: number;
  totalUnitPriceSum: number;
  extractedRowCount: number;
  checkedRowCount: number;
  isFullyChecked: boolean;
  extractedRows: ExtractedRow[];
}

export interface FilterState {
  searchQuery: string;
  selectedPOs: string[];
  selectedChallans: string[];
  selectedUnits: string[];
  verificationStatus: 'all' | 'pending' | 'verified';
  minAmount: string;
  maxAmount: string;
  minQuantity: string;
  maxQuantity: string;
}

export type TabType = 'extracted' | 'challan_audit' | 'raw_data' | 'summary';

export interface ColumnMapping {
  sl: string;
  po: string;
  item: string;
  challan: string;
  text: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  amount: string;
}

export type ThemeId = 'slate' | 'emerald' | 'nordic' | 'obsidian' | 'amber';

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  category: string;
  description: string;
  isDark: boolean;
  swatches: string[];
  primaryColor: string;
  headerBg: string;
  headerBorder: string;
  accentBadgeBg: string;
}
