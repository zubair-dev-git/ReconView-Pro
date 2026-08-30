import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileCheck,
  FileText,
  Filter,
  PackageCheck,
  Search,
  Strikethrough,
  Tag,
} from 'lucide-react';
import { ChallanGroup, ExtractedRow } from '../types';

interface ChallanWiseViewProps {
  challanGroups: ChallanGroup[];
  onToggleCheck: (rowId: string) => void;
  onBulkCheck: (rowIds: string[], checked: boolean) => void;
}

interface POGroupInChallan {
  po: string;
  rows: ExtractedRow[];
  totalQty: number;
  totalAmount: number;
  checkedCount: number;
  isFullyChecked: boolean;
  units: string[];
}

export const ChallanWiseView: React.FC<ChallanWiseViewProps> = ({
  challanGroups,
  onToggleCheck,
  onBulkCheck,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPOFilter, setSelectedPOFilter] = useState<string>('ALL');
  const [expandedChallans, setExpandedChallans] = useState<Set<string>>(
    new Set(challanGroups.map(g => g.challan)) // default all open
  );

  // Extract list of all unique PO numbers across all challans
  const allUniquePOs = useMemo(() => {
    const set = new Set<string>();
    challanGroups.forEach(g => {
      g.poList.forEach(po => set.add(po));
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [challanGroups]);

  const toggleExpand = (challan: string) => {
    const next = new Set(expandedChallans);
    if (next.has(challan)) {
      next.delete(challan);
    } else {
      next.add(challan);
    }
    setExpandedChallans(next);
  };

  const expandAll = () => setExpandedChallans(new Set(challanGroups.map(g => g.challan)));
  const collapseAll = () => setExpandedChallans(new Set());

  // Filter Challan groups based on search and PO filter
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return challanGroups
      .map(group => {
        // Filter rows within each challan based on search & selected PO
        const matchingRows = group.extractedRows.filter(row => {
          if (selectedPOFilter !== 'ALL' && row.po !== selectedPOFilter) {
            return false;
          }
          if (q) {
            const match =
              group.challan.toLowerCase().includes(q) ||
              row.po.toLowerCase().includes(q) ||
              row.text.toLowerCase().includes(q) ||
              row.unit.toLowerCase().includes(q);
            if (!match) return false;
          }
          return true;
        });

        if (matchingRows.length === 0) return null;

        const poSet = new Set<string>();
        const unitSet = new Set<string>();
        let totalQty = 0;
        let totalAmt = 0;
        let checkedCount = 0;

        matchingRows.forEach(r => {
          poSet.add(r.po);
          unitSet.add(r.unit);
          totalQty += r.sumQuantity;
          totalAmt += r.sumAmount;
          if (r.isChecked) checkedCount++;
        });

        return {
          ...group,
          poList: Array.from(poSet),
          units: Array.from(unitSet),
          totalQuantity: Number(totalQty.toFixed(2)),
          totalAmount: Number(totalAmt.toFixed(2)),
          extractedRowCount: matchingRows.length,
          checkedRowCount: checkedCount,
          isFullyChecked: checkedCount === matchingRows.length && matchingRows.length > 0,
          extractedRows: matchingRows,
        };
      })
      .filter((g): g is ChallanGroup => g !== null);
  }, [challanGroups, searchQuery, selectedPOFilter]);

  // Total stats for header
  const totalExtractedLines = useMemo(
    () => filteredGroups.reduce((acc, g) => acc + g.extractedRowCount, 0),
    [filteredGroups]
  );
  const totalVerifiedLines = useMemo(
    () => filteredGroups.reduce((acc, g) => acc + g.checkedRowCount, 0),
    [filteredGroups]
  );

  return (
    <div className="space-y-4">
      {/* Challan-Wise View Controls Header */}
      <div
        className="border rounded-xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 transition-colors duration-200"
        style={{
          backgroundColor: 'var(--theme-card-bg)',
          borderColor: 'var(--theme-card-border)',
        }}
      >
        <div>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <FileCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
              Challan-Wise Verification (PO Segregated)
            </h2>
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full border"
              style={{
                backgroundColor: 'var(--theme-primary-light)',
                color: 'var(--theme-primary-text)',
                borderColor: 'var(--theme-primary)',
              }}
            >
              {filteredGroups.length} Challans • {allUniquePOs.length} POs
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--theme-text-secondary)' }}>
            Audit and verify line items segregated by unique PO numbers within each physical Challan delivery note
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* PO Dropdown Filter */}
          <div
            className="flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              borderColor: 'var(--theme-card-border)',
            }}
          >
            <Filter className="w-3.5 h-3.5" style={{ color: 'var(--theme-text-muted)' }} />
            <span className="font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>PO:</span>
            <select
              value={selectedPOFilter}
              onChange={e => setSelectedPOFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium focus:outline-none cursor-pointer pr-2"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <option value="ALL">All PO Numbers ({allUniquePOs.length})</option>
              {allUniquePOs.map((po, idx) => (
                <option key={`po-opt-${po}-${idx}`} value={po}>
                  {po}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search inside Challans */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--theme-text-muted)' }} />
            <input
              type="text"
              placeholder="Search Challan, PO, Item..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="border rounded-full pl-9 pr-3 py-1.5 text-xs focus:outline-none transition-all w-52 sm:w-60"
              style={{
                backgroundColor: 'var(--theme-card-subtle)',
                borderColor: 'var(--theme-card-border)',
                color: 'var(--theme-text-primary)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-semibold border rounded transition-colors"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-secondary)',
            }}
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-semibold border rounded transition-colors"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-secondary)',
            }}
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Global verification status pill */}
      <div
        className="border rounded-lg px-4 py-2 flex flex-wrap items-center justify-between text-xs gap-2 transition-colors duration-200"
        style={{
          backgroundColor: 'var(--theme-card-subtle)',
          borderColor: 'var(--theme-card-border)',
          color: 'var(--theme-text-secondary)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="font-medium">Verification Progress across displayed records:</span>
          <strong className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
            {totalVerifiedLines} of {totalExtractedLines} lines verified
          </strong>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 bg-black/10 h-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                backgroundColor: 'var(--theme-primary)',
                width: `${totalExtractedLines > 0 ? Math.round((totalVerifiedLines / totalExtractedLines) * 100) : 0}%`,
              }}
            />
          </div>
          <span className="font-mono font-bold" style={{ color: 'var(--theme-text-primary)' }}>
            {totalExtractedLines > 0 ? Math.round((totalVerifiedLines / totalExtractedLines) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Challan Cards Accordion */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div
            className="border rounded-xl p-8 text-center"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-muted)',
            }}
          >
            <PackageCheck className="w-8 h-8 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>
              No Challans or POs match your filter criteria.
            </p>
            {selectedPOFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedPOFilter('ALL')}
                className="mt-2 text-xs font-semibold hover:underline"
                style={{ color: 'var(--theme-primary)' }}
              >
                Clear PO filter
              </button>
            )}
          </div>
        ) : (
          filteredGroups.map(group => {
            const isExpanded = expandedChallans.has(group.challan);
            const percent = Math.round((group.checkedRowCount / group.extractedRowCount) * 100) || 0;
            const groupRowIds = group.extractedRows.map(r => r.id);

            // Group rows inside this Challan by unique PO number
            const poGroups: POGroupInChallan[] = [];
            const poMap = new Map<string, ExtractedRow[]>();

            group.extractedRows.forEach(row => {
              const list = poMap.get(row.po) || [];
              list.push(row);
              poMap.set(row.po, list);
            });

            poMap.forEach((rows, po) => {
              let qty = 0;
              let amt = 0;
              let checked = 0;
              const unitSet = new Set<string>();

              rows.forEach(r => {
                qty += r.sumQuantity;
                amt += r.sumAmount;
                if (r.isChecked) checked++;
                unitSet.add(r.unit);
              });

              poGroups.push({
                po,
                rows,
                totalQty: Number(qty.toFixed(2)),
                totalAmount: Number(amt.toFixed(2)),
                checkedCount: checked,
                isFullyChecked: checked === rows.length && rows.length > 0,
                units: Array.from(unitSet),
              });
            });

            // Sort PO groups
            poGroups.sort((a, b) => a.po.localeCompare(b.po, undefined, { numeric: true }));

            return (
              <div
                key={group.challan}
                className="border rounded-xl overflow-hidden shadow-sm transition-all"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: group.isFullyChecked ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                }}
              >
                {/* Challan Card Master Header */}
                <div
                  className="p-4 border-b flex flex-wrap items-center justify-between gap-3"
                  style={{
                    backgroundColor: 'var(--theme-card-subtle)',
                    borderColor: 'var(--theme-card-border)',
                  }}
                >
                  <div
                    onClick={() => toggleExpand(group.challan)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-black/10"
                      style={{ color: 'var(--theme-text-muted)' }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="text-xs font-mono font-bold text-white px-2.5 py-0.5 rounded"
                          style={{ backgroundColor: 'var(--theme-primary)' }}
                        >
                          Challan: {group.challan}
                        </span>

                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded border"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-secondary)',
                          }}
                        >
                          {poGroups.length} PO {poGroups.length === 1 ? 'Section' : 'Sections'}
                        </span>
                        
                        {/* PO List Tags */}
                        {group.poList.map((po, idx) => (
                          <span
                            key={`po-tag-${po}-${idx}`}
                            className="text-xs font-mono px-2 py-0.5 rounded font-semibold border"
                            style={{
                              backgroundColor: 'var(--theme-primary-light)',
                              color: 'var(--theme-primary-text)',
                              borderColor: 'var(--theme-primary)',
                            }}
                          >
                            PO: {po}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs mt-1.5" style={{ color: 'var(--theme-text-secondary)' }}>
                        <span>{group.extractedRowCount} Extracted Aggregates</span>
                        <span>•</span>
                        <span>
                          Challan Total Qty:{' '}
                          <strong className="font-mono" style={{ color: 'var(--theme-text-primary)' }}>
                            {group.totalQuantity}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Challan Total Amount:{' '}
                          <strong className="font-mono font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                            ${group.totalAmount.toFixed(2)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status and Action */}
                  <div className="flex items-center gap-3">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-black/10 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            backgroundColor: 'var(--theme-primary)',
                            width: `${percent}%`,
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: group.isFullyChecked ? 'var(--theme-primary-light)' : 'var(--theme-card-bg)',
                          color: group.isFullyChecked ? 'var(--theme-primary-text)' : 'var(--theme-text-secondary)',
                          borderColor: group.isFullyChecked ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                        }}
                      >
                        {group.checkedRowCount}/{group.extractedRowCount} Verified ({percent}%)
                      </span>
                    </div>

                    {/* Quick Challan Strikethrough / Check Button */}
                    {group.isFullyChecked ? (
                      <button
                        type="button"
                        onClick={() => onBulkCheck(groupRowIds, false)}
                        className="px-2.5 py-1 text-xs font-medium border rounded transition-colors"
                        style={{
                          backgroundColor: 'var(--theme-card-bg)',
                          borderColor: 'var(--theme-card-border)',
                          color: 'var(--theme-text-secondary)',
                        }}
                      >
                        Uncheck Challan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onBulkCheck(groupRowIds, true)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white rounded transition-colors shadow-xs"
                        style={{ backgroundColor: 'var(--theme-primary)' }}
                      >
                        <Strikethrough className="w-3.5 h-3.5" />
                        <span>Verify Whole Challan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* PO-Segregated Sections inside Challan */}
                {isExpanded && (
                  <div className="p-4 space-y-4" style={{ backgroundColor: 'var(--theme-card-subtle)' }}>
                    {poGroups.map((poGroup, poIdx) => {
                      const poRowIds = poGroup.rows.map(r => r.id);
                      const poPercent = Math.round((poGroup.checkedCount / poGroup.rows.length) * 100) || 0;

                      return (
                        <div
                          key={`pogroup-${poGroup.po}-${poIdx}`}
                          className="border rounded-xl overflow-hidden shadow-xs transition-all"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: poGroup.isFullyChecked ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                          }}
                        >
                          {/* Segregated PO Section Header */}
                          <div
                            className="px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2"
                            style={{
                              backgroundColor: 'var(--theme-card-subtle)',
                              borderColor: 'var(--theme-card-border)',
                            }}
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <div
                                className="flex items-center gap-1.5 font-mono font-bold text-xs text-white px-2.5 py-1 rounded"
                                style={{ backgroundColor: 'var(--theme-primary)' }}
                              >
                                <Tag className="w-3 h-3" />
                                <span>PO: {poGroup.po}</span>
                              </div>

                              <span className="text-xs font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                                ({poGroup.rows.length} {poGroup.rows.length === 1 ? 'Line Item' : 'Line Items'})
                              </span>

                              <span style={{ color: 'var(--theme-text-muted)' }}>•</span>

                              <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                                PO Qty: <strong className="font-mono" style={{ color: 'var(--theme-text-primary)' }}>{poGroup.totalQty}</strong> ({poGroup.units.join(', ')})
                              </div>

                              <span style={{ color: 'var(--theme-text-muted)' }}>•</span>

                              <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                                PO Subtotal: <strong className="font-mono font-bold" style={{ color: 'var(--theme-text-primary)' }}>${poGroup.totalAmount.toFixed(2)}</strong>
                              </div>
                            </div>

                            {/* PO-level action button */}
                            <div className="flex items-center gap-2">
                              <span
                                className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"
                                style={{
                                  backgroundColor: poGroup.isFullyChecked ? 'var(--theme-primary-light)' : 'var(--theme-card-subtle)',
                                  color: poGroup.isFullyChecked ? 'var(--theme-primary-text)' : 'var(--theme-text-secondary)',
                                  borderColor: poGroup.isFullyChecked ? 'var(--theme-primary)' : 'var(--theme-card-border)',
                                }}
                              >
                                {poGroup.checkedCount}/{poGroup.rows.length} ({poPercent}%)
                              </span>

                              {poGroup.isFullyChecked ? (
                                <button
                                  type="button"
                                  onClick={() => onBulkCheck(poRowIds, false)}
                                  className="px-2 py-0.5 text-xs font-medium border rounded transition-colors"
                                  style={{
                                    backgroundColor: 'var(--theme-card-bg)',
                                    borderColor: 'var(--theme-card-border)',
                                    color: 'var(--theme-text-secondary)',
                                  }}
                                >
                                  Unverify PO
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onBulkCheck(poRowIds, true)}
                                  className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded border transition-colors"
                                  style={{
                                    backgroundColor: 'var(--theme-primary-light)',
                                    color: 'var(--theme-primary-text)',
                                    borderColor: 'var(--theme-primary)',
                                  }}
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Verify PO ({poGroup.po})</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* PO Items Table */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead
                                className="text-[11px] font-semibold uppercase tracking-wider border-b"
                                style={{
                                  backgroundColor: 'var(--theme-card-subtle)',
                                  borderColor: 'var(--theme-card-border)',
                                  color: 'var(--theme-text-muted)',
                                }}
                              >
                                <tr>
                                  <th className="py-2 px-3 w-10 text-center">#</th>
                                  <th className="py-2 px-4 w-24 text-center">Reconcile</th>
                                  <th className="py-2 px-3">Unit</th>
                                  <th className="py-2 px-4 min-w-[220px]">Description Text</th>
                                  <th className="py-2 px-4 text-right">Sum Unit Price</th>
                                  <th className="py-2 px-4 text-right">Sum Quantity</th>
                                  <th className="py-2 px-4 text-right">Sum Amount</th>
                                </tr>
                              </thead>
                              <tbody className="text-xs divide-y" style={{ borderColor: 'var(--theme-card-border)' }}>
                                {poGroup.rows.map((row, rIdx) => (
                                  <tr
                                    key={row.id}
                                    className={`transition-colors ${
                                      row.isChecked
                                        ? 'line-through italic opacity-50'
                                        : 'hover:bg-black/5'
                                    }`}
                                    style={{
                                      color: row.isChecked ? 'var(--theme-text-muted)' : 'var(--theme-text-primary)',
                                    }}
                                  >
                                    <td className="py-2.5 px-3 text-center font-mono text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                                      {rIdx + 1}
                                    </td>

                                    <td className="py-2.5 px-4 text-center">
                                      <input
                                        type="checkbox"
                                        checked={row.isChecked}
                                        onChange={() => onToggleCheck(row.id)}
                                        className="w-4 h-4 rounded cursor-pointer"
                                        style={{ accentColor: 'var(--theme-primary)' }}
                                      />
                                    </td>

                                    <td className="py-2.5 px-3">
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

                                    <td className="py-2.5 px-4">
                                      <span style={{ color: row.isChecked ? 'var(--theme-text-muted)' : 'var(--theme-text-primary)' }}>
                                        {row.text}
                                      </span>
                                    </td>

                                    <td className="py-2.5 px-4 text-right font-mono text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                                      ${row.sumUnitPrice.toFixed(2)}
                                    </td>

                                    <td className="py-2.5 px-4 text-right font-mono font-medium text-xs" style={{ color: 'var(--theme-text-primary)' }}>
                                      {row.sumQuantity} {row.unit}
                                    </td>

                                    <td
                                      className="py-2.5 px-4 text-right font-mono font-semibold text-xs"
                                      style={{
                                        color: row.isChecked ? 'var(--theme-text-muted)' : 'var(--theme-primary)',
                                      }}
                                    >
                                      ${row.sumAmount.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>

                              {/* PO Subtotal Footer */}
                              <tfoot
                                className="border-t text-xs font-semibold"
                                style={{
                                  backgroundColor: 'var(--theme-card-subtle)',
                                  borderColor: 'var(--theme-card-border)',
                                  color: 'var(--theme-text-primary)',
                                }}
                              >
                                <tr>
                                  <td colSpan={4} className="py-2 px-4 text-right font-medium" style={{ color: 'var(--theme-text-muted)' }}>
                                    Subtotal for PO ({poGroup.po}):
                                  </td>
                                  <td className="py-2 px-4 text-right font-mono" style={{ color: 'var(--theme-text-secondary)' }}>
                                    ${poGroup.rows.reduce((acc, r) => acc + r.sumUnitPrice, 0).toFixed(2)}
                                  </td>
                                  <td className="py-2 px-4 text-right font-mono" style={{ color: 'var(--theme-text-primary)' }}>
                                    {poGroup.totalQty} {poGroup.units.join(', ')}
                                  </td>
                                  <td className="py-2 px-4 text-right font-mono font-bold" style={{ color: 'var(--theme-primary)' }}>
                                    ${poGroup.totalAmount.toFixed(2)}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

