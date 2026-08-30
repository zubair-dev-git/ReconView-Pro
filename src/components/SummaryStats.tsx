import React from 'react';
import { CheckCircle2, Clock, FileSpreadsheet, Layers, Package, TrendingUp } from 'lucide-react';
import { ExtractedRow, RawRow } from '../types';

interface SummaryStatsProps {
  rawRows: RawRow[];
  extractedRows: ExtractedRow[];
  filteredExtractedRows: ExtractedRow[];
  verificationStatus: 'all' | 'pending' | 'verified';
  onStatusFilterChange: (status: 'all' | 'pending' | 'verified') => void;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({
  rawRows,
  extractedRows,
  filteredExtractedRows,
  verificationStatus,
  onStatusFilterChange,
}) => {
  const totalRawLines = rawRows.length;
  const totalExtractedGroups = extractedRows.length;

  const totalQuantity = extractedRows.reduce((sum, r) => sum + r.sumQuantity, 0);
  const totalAmount = extractedRows.reduce((sum, r) => sum + r.sumAmount, 0);
  
  const verifiedCount = extractedRows.filter(r => r.isChecked).length;
  const pendingCount = totalExtractedGroups - verifiedCount;
  const verifiedPercent = totalExtractedGroups > 0 ? Math.round((verifiedCount / totalExtractedGroups) * 100) : 0;
  
  const verifiedAmount = extractedRows.filter(r => r.isChecked).reduce((sum, r) => sum + r.sumAmount, 0);
  const pendingAmount = totalAmount - verifiedAmount;

  const uniqueChallans = new Set(rawRows.map(r => r.challan)).size;
  const uniquePOs = new Set(rawRows.map(r => r.po)).size;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Data Overview */}
      <div
        className="border rounded-xl p-4 shadow-sm flex flex-col justify-between transition-colors duration-200"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
            Extracted Groups
          </span>
          <div
            className="p-2 rounded flex items-center justify-center"
            style={{
              backgroundColor: 'var(--theme-primary-light)',
              color: 'var(--theme-primary-text)',
            }}
          >
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
            {totalExtractedGroups}
          </span>
          <span className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
            from {totalRawLines} raw lines
          </span>
        </div>
        <div
          className="mt-3 flex items-center gap-2 text-xs pt-2 border-t"
          style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-text-secondary)' }}
        >
          <span
            className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px]"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              color: 'var(--theme-text-primary)',
            }}
          >
            {uniquePOs} POs
          </span>
          <span
            className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px]"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              color: 'var(--theme-text-primary)',
            }}
          >
            {uniqueChallans} Challans
          </span>
        </div>
      </div>

      {/* Card 2: Total Quantity */}
      <div
        className="border rounded-xl p-4 shadow-sm flex flex-col justify-between transition-colors duration-200"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
            Total Quantity
          </span>
          <div
            className="p-2 rounded flex items-center justify-center"
            style={{
              backgroundColor: 'var(--theme-primary-light)',
              color: 'var(--theme-primary-text)',
            }}
          >
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
            {totalQuantity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
            Sum of Qty
          </span>
        </div>
        <div
          className="mt-3 text-xs flex items-center justify-between pt-2 border-t"
          style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-text-secondary)' }}
        >
          <span>Active filter shows:</span>
          <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
            {filteredExtractedRows.reduce((sum, r) => sum + r.sumQuantity, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Card 3: Total Amount */}
      <div
        className="border rounded-xl p-4 shadow-sm flex flex-col justify-between transition-colors duration-200"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
            Total Amount
          </span>
          <div
            className="p-2 rounded flex items-center justify-center"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              color: 'var(--theme-text-secondary)',
            }}
          >
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
            Sum of Amount
          </span>
        </div>
        <div
          className="mt-3 text-xs flex items-center justify-between pt-2 border-t"
          style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-text-secondary)' }}
        >
          <span>Reconciled value:</span>
          <span className="font-semibold" style={{ color: 'var(--theme-primary)' }}>
            ${verifiedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Card 4: Verification Status & Strikethrough Tracker */}
      <div
        className="border rounded-xl p-4 shadow-sm flex flex-col justify-between transition-colors duration-200"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-muted)' }}>
            Reconciliation
          </span>
          <span className="text-xs font-bold" style={{ color: 'var(--theme-primary)' }}>
            {verifiedPercent}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div
          className="mt-2 w-full h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--theme-card-subtle)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${verifiedPercent}%`,
              backgroundColor: 'var(--theme-primary)',
            }}
          />
        </div>

        <div
          className="mt-3 flex items-center gap-2 pt-2 border-t"
          style={{ borderColor: 'var(--theme-card-border)' }}
        >
          <button
            id="stat-btn-verified"
            onClick={() => onStatusFilterChange(verificationStatus === 'verified' ? 'all' : 'verified')}
            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-medium transition-all"
            style={{
              backgroundColor: verificationStatus === 'verified' ? 'var(--theme-primary)' : 'var(--theme-card-subtle)',
              color: verificationStatus === 'verified' ? '#ffffff' : 'var(--theme-text-secondary)',
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{verifiedCount} Checked</span>
          </button>

          <button
            id="stat-btn-pending"
            onClick={() => onStatusFilterChange(verificationStatus === 'pending' ? 'all' : 'pending')}
            className="flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-medium transition-all"
            style={{
              backgroundColor: verificationStatus === 'pending' ? 'var(--theme-header-bg)' : 'var(--theme-card-subtle)',
              color: verificationStatus === 'pending' ? '#ffffff' : 'var(--theme-text-secondary)',
            }}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending</span>
          </button>
        </div>
      </div>
    </div>
  );
};
