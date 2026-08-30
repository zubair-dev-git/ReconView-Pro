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
    <div
      className="border rounded-xl overflow-hidden shadow-sm space-y-4 p-4 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--theme-card-bg)',
        borderColor: 'var(--theme-card-border)',
      }}
    >
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              <Database className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
              Raw Source Dataset ({rawRows.length} Total Records)
            </h2>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'var(--theme-text-secondary)' }}>
            Original line items containing SL, PO, Item, Challan #, Text, Quantity, Unit, Unit Price, Amount
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--theme-text-muted)' }} />
            <input
              type="text"
              placeholder="Search raw lines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border rounded-full pl-9 pr-3 py-1.5 text-xs focus:outline-none transition-all"
              style={{
                backgroundColor: 'var(--theme-card-subtle)',
                borderColor: 'var(--theme-card-border)',
                color: 'var(--theme-text-primary)',
              }}
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded transition-colors shadow-xs"
            style={{ backgroundColor: 'var(--theme-primary)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Line</span>
          </button>

          <button
            type="button"
            onClick={() => exportRawRowsToExcel(rawRows)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold border rounded transition-colors"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-secondary)',
            }}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {rawRows.length > 0 && (
            <button
              id="btn-clear-raw-records"
              type="button"
              onClick={onClearAll}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 rounded transition-colors"
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
          className="p-4 border rounded-xl space-y-3"
          style={{
            backgroundColor: 'var(--theme-card-subtle)',
            borderColor: 'var(--theme-card-border)',
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>
              Add New Raw Record
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="hover:opacity-70"
              style={{ color: 'var(--theme-text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--theme-text-muted)' }}>SL</label>
              <input
                type="text"
                value={newRow.sl || ''}
                onChange={e => setNewRow({ ...newRow, sl: e.target.value })}
                className="w-full px-2 py-1 text-xs border rounded"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--theme-text-muted)' }}>PO</label>
              <input
                type="text"
                placeholder="PO-001"
                value={newRow.po || ''}
                onChange={e => setNewRow({ ...newRow, po: e.target.value })}
                className="w-full px-2 py-1 text-xs border rounded"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--theme-text-muted)' }}>Item Code</label>
              <input
                type="text"
                placeholder="ITEM-01"
                value={newRow.item || ''}
                onChange={e => setNewRow({ ...newRow, item: e.target.value })}
                className="w-full px-2 py-1 text-xs border rounded"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--theme-text-muted)' }}>Challan #</label>
              <input
                type="text"
                placeholder="CH-001"
                value={newRow.challan || ''}
                onChange={e => setNewRow({ ...newRow, challan: e.target.value })}
                className="w-full px-2 py-1 text-xs border rounded"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--theme-text-muted)' }}>Description Text</label>
              <input
                type="text"
                placeholder="Item specification"
                value={newRow.text || ''}
                onChange={e => setNewRow({ ...newRow, text: e.target.value })}
                className="w-full px-2 py-1 text-xs border rounded"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--theme-text-muted)' }}>Quantity</label>
              <input
                type="number"
                step="any"
                value={newRow.quantity || ''}
                onChange={e => {
                  const qty = Number(e.target.value);
                  const price = Number(newRow.unitPrice || 0);
                  setNewRow({ ...newRow, quantity: qty, amount: +(qty * price).toFixed(2) });
                }}
                className="w-full px-2 py-1 text-xs border rounded"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: 'var(--theme-text-muted)' }}>Unit</label>
              <input
                type="text"
                placeholder="PCS"
                value={newRow.unit || ''}
                onChange={e => setNewRow({ ...newRow, unit: e.target.value })}
                className="w-full px-2 py-1 text-xs border rounded"
                style={{
                  backgroundColor: 'var(--theme-card-bg)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1 text-xs border rounded"
              style={{
                backgroundColor: 'var(--theme-card-bg)',
                borderColor: 'var(--theme-card-border)',
                color: 'var(--theme-text-secondary)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 text-xs font-semibold text-white rounded"
              style={{ backgroundColor: 'var(--theme-primary)' }}
            >
              Save Record
            </button>
          </div>
        </form>
      )}

      {/* Raw Data Table */}
      <div
        className="overflow-x-auto border rounded-lg"
        style={{ borderColor: 'var(--theme-card-border)' }}
      >
        <table className="w-full text-left border-collapse">
          <thead
            className="text-xs font-semibold uppercase tracking-wider border-b"
            style={{
              backgroundColor: 'var(--theme-card-subtle)',
              borderColor: 'var(--theme-card-border)',
              color: 'var(--theme-text-muted)',
            }}
          >
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
          <tbody className="text-sm divide-y" style={{ borderColor: 'var(--theme-card-border)' }}>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center" style={{ color: 'var(--theme-text-muted)' }}>
                  No records match search criteria
                </td>
              </tr>
            ) : (
              filtered.map(row => {
                const isEditing = editingRow?.id === row.id;

                if (isEditing) {
                  return (
                    <tr key={row.id} style={{ backgroundColor: 'var(--theme-card-subtle)' }}>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.sl}
                          onChange={e => setEditingRow({ ...editingRow, sl: e.target.value })}
                          className="w-12 px-1 py-0.5 text-xs border rounded"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-primary)',
                          }}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.po}
                          onChange={e => setEditingRow({ ...editingRow, po: e.target.value })}
                          className="w-24 px-1 py-0.5 text-xs border rounded"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-primary)',
                          }}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.item}
                          onChange={e => setEditingRow({ ...editingRow, item: e.target.value })}
                          className="w-24 px-1 py-0.5 text-xs border rounded"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-primary)',
                          }}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.challan}
                          onChange={e => setEditingRow({ ...editingRow, challan: e.target.value })}
                          className="w-24 px-1 py-0.5 text-xs border rounded"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-primary)',
                          }}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.text}
                          onChange={e => setEditingRow({ ...editingRow, text: e.target.value })}
                          className="w-full px-1 py-0.5 text-xs border rounded"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-primary)',
                          }}
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
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-primary)',
                          }}
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={editingRow.unit}
                          onChange={e => setEditingRow({ ...editingRow, unit: e.target.value })}
                          className="w-14 px-1 py-0.5 text-xs border rounded"
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-primary)',
                          }}
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
                          style={{
                            backgroundColor: 'var(--theme-card-bg)',
                            borderColor: 'var(--theme-card-border)',
                            color: 'var(--theme-text-primary)',
                          }}
                        />
                      </td>
                      <td className="p-1 font-mono text-right font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                        ${editingRow.amount.toFixed(2)}
                      </td>
                      <td className="p-1 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="px-2 py-0.5 text-xs text-white rounded font-bold"
                            style={{ backgroundColor: 'var(--theme-primary)' }}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingRow(null)}
                            className="px-1 py-0.5 text-xs"
                            style={{ color: 'var(--theme-text-muted)' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={row.id} className="hover:bg-black/5 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-xs" style={{ color: 'var(--theme-text-muted)' }}>{row.sl}</td>
                    <td className="py-2.5 px-3 font-mono font-medium" style={{ color: 'var(--theme-text-primary)' }}>{row.po}</td>
                    <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--theme-text-secondary)' }}>{row.item}</td>
                    <td className="py-2.5 px-3 font-mono" style={{ color: 'var(--theme-text-secondary)' }}>{row.challan}</td>
                    <td className="py-2.5 px-4" style={{ color: 'var(--theme-text-primary)' }}>{row.text}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-medium" style={{ color: 'var(--theme-text-primary)' }}>{row.quantity}</td>
                    <td className="py-2.5 px-3 font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>{row.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono" style={{ color: 'var(--theme-text-secondary)' }}>${row.unitPrice.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold" style={{ color: 'var(--theme-primary)' }}>${row.amount.toFixed(2)}</td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingRow({ ...row })}
                          className="p-1 hover:opacity-80 rounded transition-colors"
                          style={{ color: 'var(--theme-text-muted)' }}
                          title="Edit Row"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteRow(row.id)}
                          className="p-1 hover:text-rose-600 rounded transition-colors"
                          style={{ color: 'var(--theme-text-muted)' }}
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
