import React, { useState } from 'react';
import { Database, Download, Edit2, Plus, Search, Trash2, X } from 'lucide-react';
import { RawRow } from '../types';
import { exportRawRowsToExcel } from '../utils/exporter';

interface RawDataTableViewProps {
  rawRows: RawRow[];
  onAddRow: (row: RawRow) => void;
  onUpdateRow: (row: RawRow) => void;
  onDeleteRow: (id: string) => void;
  onClearAll: () => void;
}

export const RawDataTableView: React.FC<RawDataTableViewProps> = ({
  rawRows,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  onClearAll,
}) => {
  const [search, setSearch] = useState('');
  const [editingRow, setEditingRow] = useState<RawRow | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newRow, setNewRow] = useState<Partial<RawRow>>({
    sl: rawRows.length + 1,
    po: '',
    item: '',
    challan: '',
    text: '',
    quantity: 1,
    unit: 'PCS',
    unitPrice: 0,
    amount: 0,
  });

  const filtered = rawRows.filter(r => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      String(r.sl).toLowerCase().includes(q) ||
      r.po.toLowerCase().includes(q) ||
      r.item.toLowerCase().includes(q) ||
      r.challan.toLowerCase().includes(q) ||
      r.text.toLowerCase().includes(q) ||
      r.unit.toLowerCase().includes(q) ||
      String(r.quantity).includes(q) ||
      String(r.amount).includes(q)
    );
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    onUpdateRow(editingRow);
    setEditingRow(null);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(newRow.quantity || 0);
    const price = Number(newRow.unitPrice || 0);
    const amt = Number(newRow.amount || (qty * price));

    const rowToAdd: RawRow = {
      id: `raw-${Date.now()}`,
      sl: newRow.sl || rawRows.length + 1,
      po: (newRow.po || 'PO-001').trim(),
      item: (newRow.item || 'ITEM-01').trim(),
      challan: (newRow.challan || 'CH-001').trim(),
      text: (newRow.text || 'Item Description').trim(),
      quantity: qty,
      unit: (newRow.unit || 'PCS').trim().toUpperCase(),
      unitPrice: price,
      amount: Number(amt.toFixed(2)),
      isChecked: false,
    };

    onAddRow(rowToAdd);
    setIsAdding(false);
    setNewRow({
      sl: rawRows.length + 2,
      po: '',
      item: '',
      challan: '',
      text: '',
      quantity: 1,
      unit: 'PCS',
      unitPrice: 0,
      amount: 0,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm space-y-4 p-4">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded flex items-center justify-center text-white">
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Raw Source Dataset ({rawRows.length} Total Records)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Original line items containing SL, PO, Item, Challan #, Text, Quantity, Unit, Unit Price, Amount
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search raw lines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-full pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line</span>
          </button>

          <button
            type="button"
            onClick={() => exportRawRowsToExcel(rawRows)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {rawRows.length > 0 && (
            <button
              id="btn-clear-raw-records"
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded transition-colors"
              title="Clear all records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Line Form */}
      {isAdding && (
        <form
          onSubmit={handleSaveAdd}
          className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Add New Raw Record
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">SL</label>
              <input
                type="text"
                value={newRow.sl || ''}
                onChange={e => setNewRow({ ...newRow, sl: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">PO</label>
              <input
                type="text"
                placeholder="PO-001"
                value={newRow.po || ''}
                onChange={e => setNewRow({ ...newRow, po: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Item Code</label>
              <input
                type="text"
                placeholder="ITEM-01"
                value={newRow.item || ''}
                onChange={e => setNewRow({ ...newRow, item: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Challan #</label>
              <input
                type="text"
                placeholder="CH-001"
                value={newRow.challan || ''}
                onChange={e => setNewRow({ ...newRow, challan: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Description Text</label>
              <input
                type="text"
                placeholder="Item specification"
                value={newRow.text || ''}
                onChange={e => setNewRow({ ...newRow, text: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Quantity</label>
              <input
                type="number"
                step="any"
                value={newRow.quantity || ''}
                onChange={e => {
                  const qty = Number(e.target.value);
                  const price = Number(newRow.unitPrice || 0);
                  setNewRow({ ...newRow, quantity: qty, amount: +(qty * price).toFixed(2) });
                }}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Unit</label>
              <input
                type="text"
                placeholder="PCS"
                value={newRow.unit || ''}
                onChange={e => setNewRow({ ...newRow, unit: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-slate-200 rounded bg-white"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Raw Data Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3">SL</th>
              <th className="py-3 px-3">PO</th>
              <th className="py-3 px-3">Item</th>
              <th className="py-3 px-3">Challan #</th>
              <th className="py-3 px-4 min-w-[200px]">Description Text</th>
              <th className="py-3 px-3 text-right">Quantity</th>
              <th className="py-3 px-3">Unit</th>
              <th className="py-3 px-3 text-right">Unit Price</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-3 text-center w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400">
                  No records match search criteria
                </td>
              </tr>
            ) : (
              filtered.map(row => {
                const isEditing = editingRow?.id === row.id;

                if (isEditing) {
                  return (
                    <tr key={row.id} className="bg-blue-50/40">
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.sl}
                          onChange={e => setEditingRow({ ...editingRow, sl: e.target.value })}
                          className="w-12 px-1 py-0.5 text-xs border rounded"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.po}
                          onChange={e => setEditingRow({ ...editingRow, po: e.target.value })}
                          className="w-24 px-1 py-0.5 text-xs border rounded"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.item}
                          onChange={e => setEditingRow({ ...editingRow, item: e.target.value })}
                          className="w-24 px-1 py-0.5 text-xs border rounded"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.challan}
                          onChange={e => setEditingRow({ ...editingRow, challan: e.target.value })}
                          className="w-24 px-1 py-0.5 text-xs border rounded"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.text}
                          onChange={e => setEditingRow({ ...editingRow, text: e.target.value })}
                          className="w-full px-1 py-0.5 text-xs border rounded"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={editingRow.quantity}
                          onChange={e => {
                            const qty = Number(e.target.value);
                            setEditingRow({
                              ...editingRow,
                              quantity: qty,
                              amount: +(qty * editingRow.unitPrice).toFixed(2),
                            });
                          }}
                          className="w-20 px-1 py-0.5 text-xs border rounded text-right"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.unit}
                          onChange={e => setEditingRow({ ...editingRow, unit: e.target.value })}
                          className="w-14 px-1 py-0.5 text-xs border rounded"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={editingRow.unitPrice}
                          onChange={e => {
                            const price = Number(e.target.value);
                            setEditingRow({
                              ...editingRow,
                              unitPrice: price,
                              amount: +(editingRow.quantity * price).toFixed(2),
                            });
                          }}
                          className="w-20 px-1 py-0.5 text-xs border rounded text-right"
                        />
                      </td>
                      <td className="p-1 font-mono text-right font-semibold text-slate-900">
                        ${editingRow.amount.toFixed(2)}
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="px-2 py-0.5 text-xs bg-blue-600 text-white rounded font-bold"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRow(null)}
                            className="px-1 py-0.5 text-xs text-slate-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-xs">{row.sl}</td>
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{row.po}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{row.item}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">{row.challan}</td>
                    <td className="py-2.5 px-4 text-slate-600">{row.text}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium">{row.quantity}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{row.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono">${row.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">${row.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingRow({ ...row })}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                          title="Edit Row"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRow(row.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
