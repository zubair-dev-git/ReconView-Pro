import React, { useState } from 'react';
import { CheckCircle2, Clock, Filter, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availablePOs: string[];
  availableChallans: string[];
  availableUnits: string[];
  totalExtractedCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availablePOs,
  availableChallans,
  availableUnits,
  totalExtractedCount,
  filteredCount,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const activeFilterCount =
    (filters.searchQuery ? 1 : 0) +
    filters.selectedPOs.length +
    filters.selectedChallans.length +
    filters.selectedUnits.length +
    (filters.verificationStatus !== 'all' ? 1 : 0) +
    (filters.minAmount || filters.maxAmount ? 1 : 0) +
    (filters.minQuantity || filters.maxQuantity ? 1 : 0);

  const handleReset = () => {
    onFilterChange({
      searchQuery: '',
      selectedPOs: [],
      selectedChallans: [],
      selectedUnits: [],
      verificationStatus: 'all',
      minAmount: '',
      maxAmount: '',
      minQuantity: '',
      maxQuantity: '',
    });
  };

  const togglePO = (po: string) => {
    const exists = filters.selectedPOs.includes(po);
    const newPOs = exists
      ? filters.selectedPOs.filter(p => p !== po)
      : [...filters.selectedPOs, po];
    onFilterChange({ ...filters, selectedPOs: newPOs });
  };

  const toggleChallan = (ch: string) => {
    const exists = filters.selectedChallans.includes(ch);
    const newChs = exists
      ? filters.selectedChallans.filter(c => c !== ch)
      : [...filters.selectedChallans, ch];
    onFilterChange({ ...filters, selectedChallans: newChs });
  };

  const toggleUnit = (u: string) => {
    const exists = filters.selectedUnits.includes(u);
    const newUnits = exists
      ? filters.selectedUnits.filter(unit => unit !== u)
      : [...filters.selectedUnits, u];
    onFilterChange({ ...filters, selectedUnits: newUnits });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
      {/* Primary Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input - rounded-full search pill */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="filter-search-input"
            type="text"
            placeholder="Search by PO, Challan #, description text, or item..."
            value={filters.searchQuery}
            onChange={e => onFilterChange({ ...filters, searchQuery: e.target.value })}
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-9 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          {filters.searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Verification Status Selector */}
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100 self-start lg:self-auto shrink-0">
          <button
            id="filter-status-all"
            type="button"
            onClick={() => onFilterChange({ ...filters, verificationStatus: 'all' })}
            className={`px-3 py-1 text-xs font-semibold rounded transition-all ${
              filters.verificationStatus === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Status
          </button>
          <button
            id="filter-status-pending"
            type="button"
            onClick={() => onFilterChange({ ...filters, verificationStatus: 'pending' })}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all ${
              filters.verificationStatus === 'pending'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            Pending
          </button>
          <button
            id="filter-status-verified"
            type="button"
            onClick={() => onFilterChange({ ...filters, verificationStatus: 'verified' })}
            className={`px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all ${
              filters.verificationStatus === 'verified'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            Reconciled
          </button>
        </div>

        {/* Toggle Advanced Filters Button */}
        <button
          id="btn-toggle-advanced-filters"
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded transition-colors ${
            showAdvanced || activeFilterCount > (filters.searchQuery ? 1 : 0)
              ? 'border-blue-300 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Reset Filters */}
        {activeFilterCount > 0 && (
          <button
            id="btn-reset-filters"
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Collapsible Section */}
      {showAdvanced && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* PO Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Filter by PO
              </label>
              {filters.selectedPOs.length > 0 && (
                <span className="text-[10px] text-blue-600 font-semibold">{filters.selectedPOs.length} selected</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
              {availablePOs.map((po, idx) => {
                const selected = filters.selectedPOs.includes(po);
                return (
                  <button
                    key={`po-filter-${po}-${idx}`}
                    type="button"
                    onClick={() => togglePO(po)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white font-medium shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {po}
                  </button>
                );
              })}
              {availablePOs.length === 0 && (
                <span className="text-xs text-slate-400">No POs found</span>
              )}
            </div>
          </div>

          {/* Challan Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Filter by Challan #
              </label>
              {filters.selectedChallans.length > 0 && (
                <span className="text-[10px] text-blue-600 font-semibold">{filters.selectedChallans.length} selected</span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
              {availableChallans.map((ch, idx) => {
                const selected = filters.selectedChallans.includes(ch);
                return (
                  <button
                    key={`ch-filter-${ch}-${idx}`}
                    type="button"
                    onClick={() => toggleChallan(ch)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      selected
                        ? 'bg-slate-900 text-white font-medium shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    {ch}
                  </button>
                );
              })}
              {availableChallans.length === 0 && (
                <span className="text-xs text-slate-400">No Challans found</span>
              )}
            </div>
          </div>

          {/* Unit & Range Filters */}
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Filter by Unit
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableUnits.map((unit, idx) => {
                  const selected = filters.selectedUnits.includes(unit);
                  return (
                    <button
                      key={`unit-filter-${unit}-${idx}`}
                      type="button"
                      onClick={() => toggleUnit(unit)}
                      className={`px-2.5 py-0.5 text-xs rounded border transition-colors ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600 font-medium'
                          : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {unit}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Min / Max Amount */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Min Amount ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={filters.minAmount}
                  onChange={e => onFilterChange({ ...filters, minAmount: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Max Amount ($)</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={e => onFilterChange({ ...filters, maxAmount: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Showing count indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
        <span>
          Showing <strong className="text-slate-900">{filteredCount}</strong> of{' '}
          {totalExtractedCount} extracted aggregated groups
        </span>
        {filteredCount < totalExtractedCount && (
          <span className="text-blue-600 font-semibold text-xs">Filter Active</span>
        )}
      </div>
    </div>
  );
};
