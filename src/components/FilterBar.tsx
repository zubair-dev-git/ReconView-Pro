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
    <div
      className="border rounded-xl p-4 shadow-sm space-y-3 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        borderColor: 'var(--theme-card-border)',
      }}
    >
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
            className="w-full border rounded-full pl-10 pr-9 py-1.5 text-sm focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-primary)',
            }}
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
        <div
          className="inline-flex rounded-lg border p-0.5 self-start lg:self-auto shrink-0"
          style={{
            borderColor: 'var(--theme-card-border)',
            backgroundColor: 'var(--theme-card-subtle)',
          }}
        >
          <button
            id="filter-status-all"
            type="button"
            onClick={() => onFilterChange({ ...filters, verificationStatus: 'all' })}
            className="px-3 py-1 text-xs font-semibold rounded transition-all"
            style={{
              backgroundColor: filters.verificationStatus === 'all' ? 'var(--theme-card-bg)' : 'transparent',
              color: filters.verificationStatus === 'all' ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
              boxShadow: filters.verificationStatus === 'all' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
            }}
          >
            All Status
          </button>
          <button
            id="filter-status-pending"
            type="button"
            onClick={() => onFilterChange({ ...filters, verificationStatus: 'pending' })}
            className="px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all"
            style={{
              backgroundColor: filters.verificationStatus === 'pending' ? 'var(--theme-header-bg)' : 'transparent',
              color: filters.verificationStatus === 'pending' ? '#ffffff' : 'var(--theme-text-secondary)',
            }}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            Pending
          </button>
          <button
            id="filter-status-verified"
            type="button"
            onClick={() => onFilterChange({ ...filters, verificationStatus: 'verified' })}
            className="px-3 py-1 text-xs font-semibold rounded flex items-center gap-1 transition-all"
            style={{
              backgroundColor: filters.verificationStatus === 'verified' ? 'var(--theme-primary)' : 'transparent',
              color: filters.verificationStatus === 'verified' ? '#ffffff' : 'var(--theme-text-secondary)',
            }}
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
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded transition-colors"
          style={{
            backgroundColor: showAdvanced || activeFilterCount > (filters.searchQuery ? 1 : 0) ? 'var(--theme-primary-light)' : 'var(--theme-card-subtle)',
            borderColor: showAdvanced || activeFilterCount > (filters.searchQuery ? 1 : 0) ? 'var(--theme-primary)' : 'var(--theme-card-border)',
            color: showAdvanced || activeFilterCount > (filters.searchQuery ? 1 : 0) ? 'var(--theme-primary-text)' : 'var(--theme-text-secondary)',
          }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span
              className="w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
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
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-500 hover:text-rose-700 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Advanced Filter Collapsible Section */}
      {showAdvanced && (
        <div
          className="pt-3 border-t grid grid-cols-1 md:grid-cols-3 gap-4 text-xs"
          style={{ borderColor: 'var(--theme-card-border)' }}
        >
          {/* PO Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>
                Filter by PO
              </label>
              {filters.selectedPOs.length > 0 && (
                <span className="text-[10px] font-semibold" style={{ color: 'var(--theme-primary)' }}>
                  {filters.selectedPOs.length} selected
                </span>
              )}
            </div>
            <div
              className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--theme-card-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              {availablePOs.map((po, idx) => {
                const selected = filters.selectedPOs.includes(po);
                return (
                  <button
                    key={`po-filter-${po}-${idx}`}
                    type="button"
                    onClick={() => togglePO(po)}
                    className="px-2 py-0.5 text-xs rounded transition-colors border"
                    style={{
                      backgroundColor: selected ? 'var(--theme-primary)' : 'var(--theme-card-bg)',
                      color: selected ? '#ffffff' : 'var(--theme-text-primary)',
                      borderColor: selected ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                    }}
                  >
                    {po}
                  </button>
                );
              })}
              {availablePOs.length === 0 && (
                <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>No POs found</span>
              )}
            </div>
          </div>

          {/* Challan Multi-select */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--theme-text-muted)' }}>
                Filter by Challan #
              </label>
              {filters.selectedChallans.length > 0 && (
                <span className="text-[10px] font-semibold" style={{ color: 'var(--theme-primary)' }}>
                  {filters.selectedChallans.length} selected
                </span>
              )}
            </div>
            <div
              className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-lg border"
              style={{
                backgroundColor: 'var(--theme-card-subtle)',
                borderColor: 'var(--theme-card-border)',
              }}
            >
              {availableChallans.map((ch, idx) => {
                const selected = filters.selectedChallans.includes(ch);
                return (
                  <button
                    key={`ch-filter-${ch}-${idx}`}
                    type="button"
                    onClick={() => toggleChallan(ch)}
                    className="px-2 py-0.5 text-xs rounded transition-colors border"
                    style={{
                      backgroundColor: selected ? 'var(--theme-header-bg)' : 'var(--theme-card-bg)',
                      color: selected ? '#ffffff' : 'var(--theme-text-primary)',
                      borderColor: selected ? 'var(--theme-header-bg)' : 'var(--theme-card-border)',
                    }}
                  >
                    {ch}
                  </button>
                );
              })}
              {availableChallans.length === 0 && (
                <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>No Challans found</span>
              )}
            </div>
          </div>

          {/* Unit & Range Filters */}
          <div className="space-y-2.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--theme-text-muted)' }}>
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
                      className="px-2.5 py-0.5 text-xs rounded border transition-colors"
                      style={{
                        backgroundColor: selected ? 'var(--theme-primary)' : 'var(--theme-card-subtle)',
                        borderColor: selected ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                        color: selected ? '#ffffff' : 'var(--theme-text-primary)',
                      }}
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
                <label className="block text-[10px] uppercase font-bold mb-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Min Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={filters.minAmount}
                  onChange={e => onFilterChange({ ...filters, minAmount: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs border rounded focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-card-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold mb-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                  Max Amount ($)
                </label>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxAmount}
                  onChange={e => onFilterChange({ ...filters, maxAmount: e.target.value })}
                  className="w-full px-2.5 py-1 text-xs border rounded focus:outline-none"
                  style={{
                    backgroundColor: 'var(--theme-card-subtle)',
                    borderColor: 'var(--theme-card-border)',
                    color: 'var(--theme-text-primary)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Showing count indicator */}
      <div
        className="flex items-center justify-between text-xs pt-1 border-t"
        style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-text-secondary)' }}
      >
        <span>
          Showing <strong style={{ color: 'var(--theme-text-primary)' }}>{filteredCount}</strong> of{' '}
          {totalExtractedCount} extracted aggregated groups
        </span>
        {filteredCount < totalExtractedCount && (
          <span className="font-semibold text-xs" style={{ color: 'var(--theme-primary)' }}>
            Filter Active
          </span>
        )}
      </div>
    </div>
  );
};
