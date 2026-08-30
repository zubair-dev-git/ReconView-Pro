import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileCheck,
  Layers,
  Sparkles,
  Strikethrough,
  Trash2,
  Upload,
} from 'lucide-react';
import { ChallanWiseView } from './components/ChallanWiseView';
import { ExtractedTableView } from './components/ExtractedTableView';
import { FilterBar } from './components/FilterBar';
import { Navbar } from './components/Navbar';
import { RawDataTableView } from './components/RawDataTableView';
import { SummaryStats } from './components/SummaryStats';
import { UploadModal } from './components/UploadModal';
import { FilterState, RawRow, TabType } from './types';
import {
  aggregateRawRows,
  filterExtractedRows,
  groupExtractedByChallan,
} from './utils/aggregator';
import { SAMPLE_RAW_DATA } from './utils/sampleData';

const STORAGE_KEY_RAW = 'challan_po_raw_data_v1';
const STORAGE_KEY_CHECKED = 'challan_po_checked_keys_v1';

export default function App() {
  // 1. Raw Data State
  const [rawRows, setRawRows] = useState<RawRow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_RAW);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse saved raw data', e);
      }
    }
    return SAMPLE_RAW_DATA;
  });

  // 2. Checked Rows / Strikethrough State
  const [checkedKeys, setCheckedKeys] = useState<Set<string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHECKED);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      } catch (e) {
        console.error('Failed to parse saved checked keys', e);
      }
    }
    return new Set<string>();
  });

  // 3. Filter State
  const [filters, setFilters] = useState<FilterState>({
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

  // 4. Active Tab
  const [activeTab, setActiveTab] = useState<TabType>('extracted');

  // 5. Upload Modal Visibility
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // 6. Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RAW, JSON.stringify(rawRows));
  }, [rawRows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHECKED, JSON.stringify(Array.from(checkedKeys)));
  }, [checkedKeys]);

  // Aggregate Raw Rows into Extracted Rows (Grouped by PO, Challan, Unit, Text)
  const extractedRows = useMemo(() => {
    return aggregateRawRows(rawRows, checkedKeys);
  }, [rawRows, checkedKeys]);

  // Filter Extracted Rows
  const filteredExtractedRows = useMemo(() => {
    return filterExtractedRows(extractedRows, filters);
  }, [extractedRows, filters]);

  // Group Extracted Rows by Challan for Challan-wise audit view
  const challanGroups = useMemo(() => {
    return groupExtractedByChallan(filteredExtractedRows);
  }, [filteredExtractedRows]);

  // Available options for filter dropdowns
  const availablePOs = useMemo(() => {
    const set = new Set<string>();
    rawRows.forEach(r => r.po && set.add(r.po));
    return Array.from(set).sort();
  }, [rawRows]);

  const availableChallans = useMemo(() => {
    const set = new Set<string>();
    rawRows.forEach(r => r.challan && set.add(r.challan));
    return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [rawRows]);

  const availableUnits = useMemo(() => {
    const set = new Set<string>();
    rawRows.forEach(r => r.unit && set.add(r.unit.toUpperCase()));
    return Array.from(set).sort();
  }, [rawRows]);

  // Toggle single row verification / strikethrough
  const handleToggleCheck = (rowId: string) => {
    setCheckedKeys(prev => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
        showToast('Line marked as unverified');
      } else {
        next.add(rowId);
        showToast('Line marked as verified (Strikethrough applied)');
      }
      return next;
    });
  };

  // Bulk check / uncheck rows
  const handleBulkCheck = (rowIds: string[], checked: boolean) => {
    setCheckedKeys(prev => {
      const next = new Set(prev);
      rowIds.forEach(id => {
        if (checked) next.add(id);
        else next.delete(id);
      });
      return next;
    });
    showToast(checked ? `Marked ${rowIds.length} line(s) as verified` : `Unchecked ${rowIds.length} line(s)`);
  };

  // Data import handler
  const handleImport = (newRows: RawRow[], mode: 'replace' | 'append') => {
    if (mode === 'replace') {
      setRawRows(newRows);
      setCheckedKeys(new Set());
      showToast(`Imported ${newRows.length} records successfully (replaced previous data)`);
    } else {
      setRawRows(prev => [...prev, ...newRows]);
      showToast(`Appended ${newRows.length} new records`);
    }
  };

  // Load sample dataset
  const handleLoadSample = () => {
    setRawRows(SAMPLE_RAW_DATA);
    setCheckedKeys(new Set());
    showToast('Loaded sample PO and Challan dataset');
  };

  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);

  // Clear dataset handler
  const handleClearData = () => {
    setIsClearConfirmOpen(true);
  };

  const confirmClearAll = () => {
    setRawRows([]);
    setCheckedKeys(new Set());
    setIsClearConfirmOpen(false);
    showToast('All dataset records cleared');
  };

  // Add a raw row
  const handleAddRawRow = (row: RawRow) => {
    setRawRows(prev => [...prev, row]);
    showToast('New raw line item added');
  };

  // Update a raw row
  const handleUpdateRawRow = (updated: RawRow) => {
    setRawRows(prev => prev.map(r => (r.id === updated.id ? updated : r)));
    showToast('Raw line item updated');
  };

  // Delete a raw row
  const handleDeleteRawRow = (id: string) => {
    setRawRows(prev => prev.filter(r => r.id !== id));
    showToast('Raw line item removed');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        rawRowCount={rawRows.length}
        extractedRows={extractedRows}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSample={handleLoadSample}
        onClearData={handleClearData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-blue-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {rawRows.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              No Challan or PO Data Uploaded
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Upload your spreadsheet containing columns (SL, PO, Item, Challan #, Text, Quantity, Unit, Unit Price, Amount) to extract and summarize totals.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="empty-upload-btn"
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded shadow-xs transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Excel / CSV</span>
              </button>
              <button
                id="empty-sample-btn"
                type="button"
                onClick={handleLoadSample}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Load Sample Data</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <SummaryStats
              rawRows={rawRows}
              extractedRows={extractedRows}
              filteredExtractedRows={filteredExtractedRows}
              verificationStatus={filters.verificationStatus}
              onStatusFilterChange={status => setFilters({ ...filters, verificationStatus: status })}
            />

            {/* View Tabs Navigation */}
            <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
              <button
                id="tab-extracted-view"
                type="button"
                onClick={() => setActiveTab('extracted')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'extracted'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Extracted Summary Table ({filteredExtractedRows.length})</span>
              </button>

              <button
                id="tab-challan-view"
                type="button"
                onClick={() => setActiveTab('challan_audit')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'challan_audit'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Challan-Wise Verification ({challanGroups.length} Delivery Notes)</span>
              </button>

              <button
                id="tab-raw-view"
                type="button"
                onClick={() => setActiveTab('raw_data')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'raw_data'
                    ? 'border-blue-600 text-blue-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Raw Source Data ({rawRows.length} Records)</span>
              </button>
            </div>

            {/* Filter Bar (Active on Extracted and Challan views) */}
            {activeTab !== 'raw_data' && (
              <FilterBar
                filters={filters}
                onFilterChange={setFilters}
                availablePOs={availablePOs}
                availableChallans={availableChallans}
                availableUnits={availableUnits}
                totalExtractedCount={extractedRows.length}
                filteredCount={filteredExtractedRows.length}
              />
            )}

            {/* Active Tab View Rendering */}
            {activeTab === 'extracted' && (
              <ExtractedTableView
                rows={filteredExtractedRows}
                onToggleCheck={handleToggleCheck}
                onBulkCheck={handleBulkCheck}
              />
            )}

            {activeTab === 'challan_audit' && (
              <ChallanWiseView
                challanGroups={challanGroups}
                onToggleCheck={handleToggleCheck}
                onBulkCheck={handleBulkCheck}
              />
            )}

            {activeTab === 'raw_data' && (
              <RawDataTableView
                rawRows={rawRows}
                onAddRow={handleAddRawRow}
                onUpdateRow={handleUpdateRawRow}
                onDeleteRow={handleDeleteRawRow}
                onClearAll={handleClearData}
              />
            )}
          </>
        )}
      </main>

      {/* Upload / Import Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImport={handleImport}
      />

      {/* Clear All Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Clear All Records?</h3>
                <p className="text-xs text-slate-500">This will remove all {rawRows.length} dataset rows and verification states.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to permanently clear the current dataset? You can re-upload your Excel/CSV or reload sample data at any time.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-clear-action"
                type="button"
                onClick={confirmClearAll}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors shadow-xs"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
