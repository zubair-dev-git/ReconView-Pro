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
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center text-white">
              <FileCheck className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Challan-Wise Verification (PO Segregated)
            </h2>
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
              {filteredGroups.length} Challans • {allUniquePOs.length} POs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit and verify line items segregated by unique PO numbers within each physical Challan delivery note
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* PO Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">PO:</span>
            <select
              value={selectedPOFilter}
              onChange={e => setSelectedPOFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-medium text-slate-900 focus:outline-none cursor-pointer pr-2"
            >
              <option value="ALL">All PO Numbers ({allUniquePOs.length})</option>
              {allUniquePOs.map(po => (
                <option key={po} value={po}>
                  {po}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search inside Challans */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search Challan, PO, Item..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all w-52 sm:w-60"
            />
          </div>

          <button
            type="button"
            onClick={expandAll}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Global verification status pill */}
      <div className="bg-slate-100/70 border border-slate-200 rounded-lg px-4 py-2 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">Verification Progress across displayed records:</span>
          <strong className="text-slate-900 font-semibold">
            {totalVerifiedLines} of {totalExtractedLines} lines verified
          </strong>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{
                width: `${totalExtractedLines > 0 ? Math.round((totalVerifiedLines / totalExtractedLines) * 100) : 0}%`,
              }}
            />
          </div>
          <span className="font-mono font-bold text-slate-900">
            {totalExtractedLines > 0 ? Math.round((totalVerifiedLines / totalExtractedLines) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Challan Cards Accordion */}
      <div className="space-y-4">
        {filteredGroups.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500">
            <PackageCheck className="w-8 h-8 mx-auto text-slate-400 mb-2" />
            <p className="text-sm font-medium">No Challans or POs match your filter criteria.</p>
            {selectedPOFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedPOFilter('ALL')}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
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
                className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all ${
                  group.isFullyChecked
                    ? 'border-blue-300 bg-slate-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* Challan Card Master Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div
                    onClick={() => toggleExpand(group.challan)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <button
                      type="button"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded">
                          Challan: {group.challan}
                        </span>

                        <span className="text-xs font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                          {poGroups.length} PO {poGroups.length === 1 ? 'Section' : 'Sections'}
                        </span>
                        
                        {/* PO List Tags */}
                        {group.poList.map(po => (
                          <span
                            key={po}
                            className="text-xs font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold"
                          >
                            PO: {po}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
                        <span>{group.extractedRowCount} Extracted Aggregates</span>
                        <span>•</span>
                        <span>
                          Challan Total Qty:{' '}
                          <strong className="text-slate-900 font-mono">
                            {group.totalQuantity}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Challan Total Amount:{' '}
                          <strong className="text-slate-900 font-mono font-bold">
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
                      <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          group.isFullyChecked
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {group.checkedRowCount}/{group.extractedRowCount} Verified ({percent}%)
                      </span>
                    </div>

                    {/* Quick Challan Strikethrough / Check Button */}
                    {group.isFullyChecked ? (
                      <button
                        type="button"
                        onClick={() => onBulkCheck(groupRowIds, false)}
                        className="px-2.5 py-1 text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 hover:bg-slate-200 rounded transition-colors"
                      >
                        Uncheck Challan
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onBulkCheck(groupRowIds, true)}
                        className="flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-xs"
                      >
                        <Strikethrough className="w-3.5 h-3.5" />
                        <span>Verify Whole Challan</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* PO-Segregated Sections inside Challan */}
                {isExpanded && (
                  <div className="p-4 space-y-4 bg-slate-50/40">
                    {poGroups.map((poGroup, poIdx) => {
                      const poRowIds = poGroup.rows.map(r => r.id);
                      const poPercent = Math.round((poGroup.checkedCount / poGroup.rows.length) * 100) || 0;

                      return (
                        <div
                          key={poGroup.po}
                          className={`bg-white border rounded-xl overflow-hidden shadow-xs transition-all ${
                            poGroup.isFullyChecked
                              ? 'border-blue-200 bg-slate-50/30'
                              : 'border-slate-200'
                          }`}
                        >
                          {/* Segregated PO Section Header */}
                          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1.5 font-mono font-bold text-xs bg-blue-600 text-white px-2.5 py-1 rounded">
                                <Tag className="w-3 h-3" />
                                <span>PO: {poGroup.po}</span>
                              </div>

                              <span className="text-xs text-slate-500 font-medium">
                                ({poGroup.rows.length} {poGroup.rows.length === 1 ? 'Line Item' : 'Line Items'})
                              </span>

                              <span className="text-xs text-slate-400">•</span>

                              <div className="text-xs text-slate-600">
                                PO Qty: <strong className="font-mono text-slate-900">{poGroup.totalQty}</strong> ({poGroup.units.join(', ')})
                              </div>

                              <span className="text-xs text-slate-400">•</span>

                              <div className="text-xs text-slate-600">
                                PO Subtotal: <strong className="font-mono font-bold text-slate-900">${poGroup.totalAmount.toFixed(2)}</strong>
                              </div>
                            </div>

                            {/* PO-level action button */}
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                  poGroup.isFullyChecked
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {poGroup.checkedCount}/{poGroup.rows.length} ({poPercent}%)
                              </span>

                              {poGroup.isFullyChecked ? (
                                <button
                                  type="button"
                                  onClick={() => onBulkCheck(poRowIds, false)}
                                  className="px-2 py-0.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded transition-colors"
                                >
                                  Unverify PO
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => onBulkCheck(poRowIds, true)}
                                  className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded transition-colors"
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
                              <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200">
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
                              <tbody className="text-xs divide-y divide-slate-100">
                                {poGroup.rows.map((row, rIdx) => (
                                  <tr
                                    key={row.id}
                                    className={`transition-colors ${
                                      row.isChecked
                                        ? 'bg-slate-50/60 text-slate-400 line-through italic'
                                        : 'hover:bg-slate-50 text-slate-900'
                                    }`}
                                  >
                                    <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-xs">
                                      {rIdx + 1}
                                    </td>

                                    <td className="py-2.5 px-4 text-center">
                                      <input
                                        type="checkbox"
                                        checked={row.isChecked}
                                        onChange={() => onToggleCheck(row.id)}
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      />
                                    </td>

                                    <td className="py-2.5 px-3">
                                      <span
                                        className={`inline-block px-1.5 py-0.5 text-xs font-semibold rounded ${
                                          row.isChecked ? 'text-slate-400 bg-slate-100' : 'bg-slate-100 text-slate-700'
                                        }`}
                                      >
                                        {row.unit}
                                      </span>
                                    </td>

                                    <td className="py-2.5 px-4">
                                      <span className={row.isChecked ? 'opacity-70' : 'text-slate-700 font-medium'}>
                                        {row.text}
                                      </span>
                                    </td>

                                    <td className="py-2.5 px-4 text-right font-mono text-xs">
                                      ${row.sumUnitPrice.toFixed(2)}
                                    </td>

                                    <td className="py-2.5 px-4 text-right font-mono font-medium text-xs">
                                      {row.sumQuantity} {row.unit}
                                    </td>

                                    <td
                                      className={`py-2.5 px-4 text-right font-mono font-semibold text-xs ${
                                        row.isChecked ? '' : 'text-slate-900'
                                      }`}
                                    >
                                      ${row.sumAmount.toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>

                              {/* PO Subtotal Footer */}
                              <tfoot className="bg-slate-50/80 border-t border-slate-200 text-xs font-semibold text-slate-700">
                                <tr>
                                  <td colSpan={4} className="py-2 px-4 text-right font-medium text-slate-500">
                                    Subtotal for PO ({poGroup.po}):
                                  </td>
                                  <td className="py-2 px-4 text-right font-mono text-slate-600">
                                    ${poGroup.rows.reduce((acc, r) => acc + r.sumUnitPrice, 0).toFixed(2)}
                                  </td>
                                  <td className="py-2 px-4 text-right font-mono text-slate-900">
                                    {poGroup.totalQty} {poGroup.units.join(', ')}
                                  </td>
                                  <td className="py-2 px-4 text-right font-mono text-slate-900 font-bold">
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

