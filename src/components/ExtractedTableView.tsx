import React, { useState } from 'react';
import {
  ArrowUpDown,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCopy,
  Layers,
  Sparkles,
  Strikethrough,
} from 'lucide-react';
import { ExtractedRow } from '../types';

interface ExtractedTableViewProps {
  rows: ExtractedRow[];
  onToggleCheck: (rowId: string) => void;
  onBulkCheck: (rowIds: string[], checked: boolean) => void;
}

type SortField = 'po' | 'unit' | 'challan' | 'text' | 'sumUnitPrice' | 'sumQuantity' | 'sumAmount' | 'isChecked';
type SortOrder = 'asc' | 'desc';

export const ExtractedTableView: React.FC<ExtractedTableViewProps> = ({
  rows,
  onToggleCheck,
  onBulkCheck,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>('challan');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    const next = new Set(expandedRows);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedRows(next);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRows = [...rows].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'po') comparison = a.po.localeCompare(b.po);
    else if (sortField === 'unit') comparison = a.unit.localeCompare(b.unit);
    else if (sortField === 'challan') comparison = a.challan.localeCompare(b.challan, undefined, { numeric: true });
    else if (sortField === 'text') comparison = a.text.localeCompare(b.text);
    else if (sortField === 'sumUnitPrice') comparison = a.sumUnitPrice - b.sumUnitPrice;
    else if (sortField === 'sumQuantity') comparison = a.sumQuantity - b.sumQuantity;
    else if (sortField === 'sumAmount') comparison = a.sumAmount - b.sumAmount;
    else if (sortField === 'isChecked') comparison = (a.isChecked === b.isChecked ? 0 : a.isChecked ? 1 : -1);

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const copyRowDetails = (row: ExtractedRow) => {
    const text = `PO: ${row.po}\nUnit: ${row.unit}\nChallan #: ${row.challan}\nText: ${row.text}\nSum of Unit Price: $${row.sumUnitPrice.toFixed(2)}\nSum of Quantity: ${row.sumQuantity} ${row.unit}\nSum of Amount: $${row.sumAmount.toFixed(2)}`;
    navigator.clipboard.writeText(text);
    setCopiedId(row.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Calculate Column Totals
  const totalUnitPriceSum = rows.reduce((acc, r) => acc + r.sumUnitPrice, 0);
  const totalQuantitySum = rows.reduce((acc, r) => acc + r.sumQuantity, 0);
  const totalAmountSum = rows.reduce((acc, r) => acc + r.sumAmount, 0);
  const verifiedCount = rows.filter(r => r.isChecked).length;

  return (
    <div
      className="rounded-xl shadow-sm border flex flex-col overflow-hidden transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        borderColor: 'var(--theme-card-border)',
      }}
    >
      {/* Table Header Controls */}
      <div
        className="px-6 py-3.5 border-b flex flex-wrap items-center justify-between gap-3"
        style={{
          backgroundColor: 'var(--theme-card-subtle)',
          borderColor: 'var(--theme-card-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-white"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
              Aggregated Extraction Master
            </h2>
            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Summarized by PO Number, Unit, Challan #, and Description Text
            </p>
          </div>
        </div>

        {/* Bulk Action Controls */}
        <div className="flex items-center gap-2">
          <button
            id="bulk-check-btn"
            type="button"
            onClick={() => onBulkCheck(rows.map(r => r.id), true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded border transition-colors"
            style={{
              backgroundColor: 'var(--theme-primary-light)',
              color: 'var(--theme-primary-text)',
              borderColor: 'var(--theme-primary)',
            }}
          >
            <Strikethrough className="w-3.5 h-3.5" />
            <span>Mark All Checked</span>
          </button>

          <button
            id="bulk-uncheck-btn"
            type="button"
            onClick={() => onBulkCheck(rows.map(r => r.id), false)}
            className="px-3 py-1.5 text-xs font-medium rounded transition-colors border"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-secondary)',
            }}
          >
            Uncheck All
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead
            className="sticky top-0 text-xs font-semibold uppercase tracking-wider border-b"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-muted)',
            }}
          >
            <tr>
              <th className="px-4 py-3.5 w-10 text-center">#</th>
              
              {/* Strikethrough Checkbox Header */}
              <th
                onClick={() => handleSort('isChecked')}
                className="px-4 py-3.5 w-32 cursor-pointer transition-colors text-center hover:opacity-80"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Reconciled</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {/* PO Column */}
              <th
                onClick={() => handleSort('po')}
                className="px-6 py-3.5 cursor-pointer transition-colors hover:opacity-80"
              >
                <div className="flex items-center gap-1">
                  <span>PO Number</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {/* Unit Column */}
              <th
                onClick={() => handleSort('unit')}
                className="px-4 py-3.5 cursor-pointer transition-colors hover:opacity-80"
              >
                <div className="flex items-center gap-1">
                  <span>Unit</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {/* Challan # Column */}
              <th
                onClick={() => handleSort('challan')}
                className="px-6 py-3.5 cursor-pointer transition-colors hover:opacity-80"
              >
                <div className="flex items-center gap-1">
                  <span>Challan #</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {/* Text Column */}
              <th
                onClick={() => handleSort('text')}
                className="px-6 py-3.5 min-w-[220px] cursor-pointer transition-colors hover:opacity-80"
              >
                <div className="flex items-center gap-1">
                  <span>Description Text</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {/* Sum of Unit Price Column */}
              <th
                onClick={() => handleSort('sumUnitPrice')}
                className="px-6 py-3.5 text-right cursor-pointer transition-colors hover:opacity-80"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Σ Unit Price</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {/* Sum of Quantity Column */}
              <th
                onClick={() => handleSort('sumQuantity')}
                className="px-6 py-3.5 text-right cursor-pointer transition-colors hover:opacity-80"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Σ Quantity</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {/* Sum of Amount Column */}
              <th
                onClick={() => handleSort('sumAmount')}
                className="px-6 py-3.5 text-right cursor-pointer transition-colors hover:opacity-80"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Σ Amount</span>
                  <ArrowUpDown className="w-3 h-3 opacity-60" />
                </div>
              </th>

              {/* Raw Items Breakdown Toggle */}
              <th className="px-4 py-3.5 w-16 text-center">Items</th>
            </tr>
          </thead>

          <tbody
            className="text-sm divide-y"
            style={{ borderColor: 'var(--theme-card-border)' }}
          >
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center" style={{ color: 'var(--theme-text-muted)' }}>
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                      No extracted data matches the current filters.
                    </p>
                    <p className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                      Try adjusting your search terms or clearing active filters.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedRows.map((row, idx) => {
                const isExpanded = expandedRows.has(row.id);
                return (
                  <React.Fragment key={row.id}>
                    <tr
                      className={`transition-colors group ${
                        row.isChecked
                          ? 'line-through italic opacity-50'
                          : 'hover:bg-black/5'
                      }`}
                      style={{
                        color: row.isChecked ? 'var(--theme-text-muted)' : 'var(--theme-text-primary)',
                      }}
                    >
                      {/* Index */}
                      <td className="px-4 py-3.5 text-center font-mono text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                        {idx + 1}
                      </td>

                      {/* Strikethrough Action Checkbox */}
                      <td className="px-4 py-3.5 text-center">
                        <input
                          id={`row-checkbox-${idx}`}
                          type="checkbox"
                          checked={row.isChecked}
                          onChange={() => onToggleCheck(row.id)}
                          className="w-4 h-4 rounded cursor-pointer transition-all"
                          style={{ accentColor: 'var(--theme-primary)' }}
                          title={row.isChecked ? 'Mark as pending' : 'Verify & apply strikethrough'}
                        />
                      </td>

                      {/* PO */}
                      <td
                        className="px-6 py-3.5 font-medium whitespace-nowrap"
                        style={{ color: row.isChecked ? 'var(--theme-text-muted)' : 'var(--theme-text-primary)' }}
                      >
                        {row.po}
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className="inline-block px-1.5 py-0.5 text-xs font-semibold rounded border"
                          style={{
                            backgroundColor: 'var(--theme-card-subtle)',
                            borderColor: 'var(--theme-card-border)',
                            color: row.isChecked ? 'var(--theme-text-muted)' : 'var(--theme-text-secondary)',
                          }}
                        >
                          {row.unit}
                        </span>
                      </td>

                      {/* Challan # */}
                      <td className="px-6 py-3.5 whitespace-nowrap font-mono text-xs" style={{ color: 'var(--theme-text-primary)' }}>
                        {row.challan}
                      </td>

                      {/* Text / Description Text */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className="text-xs leading-relaxed"
                            style={{
                              color: row.isChecked ? 'var(--theme-text-muted)' : 'var(--theme-text-primary)',
                            }}
                          >
                            {row.text}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyRowDetails(row)}
                            title="Copy row details"
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10"
                            style={{ color: 'var(--theme-text-muted)' }}
                          >
                            {copiedId === row.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <ClipboardCopy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Sum of Unit Price */}
                      <td className="px-6 py-3.5 text-right font-mono" style={{ color: 'var(--theme-text-secondary)' }}>
                        ${row.sumUnitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Sum of Quantity */}
                      <td className="px-6 py-3.5 text-right font-mono font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                        {row.sumQuantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>

                      {/* Sum of Amount */}
                      <td
                        className="px-6 py-3.5 text-right font-mono"
                        style={{
                          fontWeight: row.isChecked ? 'normal' : '600',
                          color: row.isChecked ? 'var(--theme-text-muted)' : 'var(--theme-primary)',
                        }}
                      >
                        ${row.sumAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Expand Button for Raw Row Items */}
                      <td className="px-4 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExpand(row.id)}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium border transition-colors"
                          style={{
                            backgroundColor: 'var(--theme-card-subtle)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-secondary)',
                          }}
                          title="View underlying raw line items"
                        >
                          <span>{row.rawRowCount}</span>
                          {isExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                          ) : (
                            <ChevronRight className="w-3 h-3" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Raw Breakdown Accordion */}
                    {isExpanded && (
                      <tr
                        className="border-y"
                        style={{
                          backgroundColor: 'var(--theme-card-subtle)',
                          borderColor: 'var(--theme-card-border)',
                        }}
                      >
                        <td colSpan={10} className="p-4 pl-14">
                          <div
                            className="border rounded-lg p-4 shadow-sm"
                            style={{
                              backgroundColor: 'var(--theme-card-bg)',
                              borderColor: 'var(--theme-card-border)',
                            }}
                          >
                            <div
                              className="flex items-center justify-between mb-2.5 pb-2 border-b"
                              style={{ borderColor: 'var(--theme-card-border)' }}
                            >
                              <span
                                className="text-xs font-bold flex items-center gap-1.5"
                                style={{ color: 'var(--theme-primary)' }}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Underlying Source Items ({row.rawRows.length})
                              </span>
                              <span className="text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                                Exact records mapped to this aggregated line
                              </span>
                            </div>

                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr
                                  className="font-bold uppercase tracking-wider text-[10px] border-b"
                                  style={{ borderColor: 'var(--theme-card-border)', color: 'var(--theme-text-muted)' }}
                                >
                                  <th className="pb-1.5 px-2">SL</th>
                                  <th className="pb-1.5 px-2">Item Code</th>
                                  <th className="pb-1.5 px-2">Description</th>
                                  <th className="pb-1.5 px-2 text-right">Quantity</th>
                                  <th className="pb-1.5 px-2 text-right">Unit Price</th>
                                  <th className="pb-1.5 px-2 text-right">Amount</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y" style={{ borderColor: 'var(--theme-card-border)' }}>
                                {row.rawRows.map(raw => (
                                  <tr key={raw.id} style={{ color: 'var(--theme-text-secondary)' }}>
                                    <td className="py-1.5 px-2 font-mono" style={{ color: 'var(--theme-text-muted)' }}>{raw.sl}</td>
                                    <td className="py-1.5 px-2 font-mono font-medium" style={{ color: 'var(--theme-text-primary)' }}>{raw.item}</td>
                                    <td className="py-1.5 px-2">{raw.text}</td>
                                    <td className="py-1.5 px-2 text-right font-mono">{raw.quantity} {raw.unit}</td>
                                    <td className="py-1.5 px-2 text-right font-mono">${raw.unitPrice.toFixed(2)}</td>
                                    <td className="py-1.5 px-2 text-right font-mono font-semibold" style={{ color: 'var(--theme-text-primary)' }}>${raw.amount.toFixed(2)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer / Reconciliation Summary Bar */}
      <footer
        className="mt-auto h-16 border-t flex flex-wrap items-center justify-between px-6 sm:px-8 text-xs font-medium gap-4"
        style={{
          backgroundColor: 'var(--theme-card-subtle)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-secondary)',
        }}
      >
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-primary)' }}></span>
            <span>Total Items: <strong style={{ color: 'var(--theme-text-primary)' }}>{rows.length} Groups ({rows.reduce((sum, r) => sum + r.rawRowCount, 0)} Lines)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--theme-card-border)' }}></span>
            <span>Pending Reconciliation: <strong style={{ color: 'var(--theme-text-primary)' }}>{rows.length - verifiedCount}</strong></span>
          </div>
          <div className="flex items-center gap-2 font-bold" style={{ color: 'var(--theme-text-primary)' }}>
            <span>Reconciled Amount:</span>
            <span className="font-mono text-sm" style={{ color: 'var(--theme-primary)' }}>
              ${rows.filter(r => r.isChecked).reduce((sum, r) => sum + r.sumAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6 font-mono">
          <span>Σ Qty: <strong style={{ color: 'var(--theme-text-primary)' }}>{totalQuantitySum.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></span>
          <span>Total: <strong className="font-bold" style={{ color: 'var(--theme-text-primary)' }}>${totalAmountSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
        </div>
      </footer>
    </div>
  );
};
