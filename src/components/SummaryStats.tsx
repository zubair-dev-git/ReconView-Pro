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
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Extracted Groups</span>
          <div className="p-2 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalExtractedGroups}</span>
          <span className="text-xs text-slate-500">from {totalRawLines} raw lines</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
          <span className="inline-flex items-center gap-1 font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
            {uniquePOs} POs
          </span>
          <span className="inline-flex items-center gap-1 font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
            {uniqueChallans} Challans
          </span>
        </div>
      </div>

      {/* Card 2: Total Quantity */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Quantity</span>
          <div className="p-2 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
            <Package className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            {totalQuantity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 font-medium">Sum of Qty</span>
        </div>
        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>Active filter shows:</span>
          <span className="font-semibold text-slate-900">
            {filteredExtractedRows.reduce((sum, r) => sum + r.sumQuantity, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Card 3: Total Amount */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Amount</span>
          <div className="p-2 bg-slate-100 text-slate-700 rounded flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 tracking-tight">
            ${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-500 font-medium">Sum of Amount</span>
        </div>
        <div className="mt-3 text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
          <span>Reconciled value:</span>
          <span className="font-semibold text-blue-600">
            ${verifiedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Card 4: Verification Status & Strikethrough Tracker */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Reconciliation</span>
          <span className="text-xs font-bold text-blue-600">
            {verifiedPercent}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${verifiedPercent}%` }}
          />
        </div>

        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
          <button
            id="stat-btn-verified"
            onClick={() => onStatusFilterChange(verificationStatus === 'verified' ? 'all' : 'verified')}
            className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
              verificationStatus === 'verified'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{verifiedCount} Checked</span>
          </button>

          <button
            id="stat-btn-pending"
            onClick={() => onStatusFilterChange(verificationStatus === 'pending' ? 'all' : 'pending')}
            className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded text-xs font-medium transition-colors ${
              verificationStatus === 'pending'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingCount} Pending</span>
          </button>
        </div>
      </div>
    </div>
  );
};
