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
import { FilterState, RawRow, TabType, ThemeId } from './types';
import {
  aggregateRawRows,
  filterExtractedRows,
  groupExtractedByChallan,
} from './utils/aggregator';
import { SAMPLE_RAW_DATA } from './utils/sampleData';
import { getInitialTheme, saveTheme, THEMES } from './utils/theme';

const STORAGE_KEY_RAW = 'challan_po_raw_data_v1';
const STORAGE_KEY_CHECKED = 'challan_po_checked_keys_v1';

export default function App() {
  // 0. Theme State
  const [theme, setTheme] = useState<ThemeId>(() => getInitialTheme());

  const handleSelectTheme = (newTheme: ThemeId) => {
    setTheme(newTheme);
    saveTheme(newTheme);
    const themeDef = THEMES.find(t => t.id === newTheme);
    showToast(`Switched to ${themeDef?.name || newTheme} Theme`);
  };

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
    <div
      className={`min-h-screen theme-${theme} flex flex-col font-sans antialiased transition-colors duration-200`}
      style={{
        backgroundColor: 'var(--theme-app-bg)',
        color: 'var(--theme-text-primary)',
      }}
    >
      {/* Top Navbar */}
      <Navbar
        rawRowCount={rawRows.length}
        extractedRows={extractedRows}
        currentTheme={theme}
        onSelectTheme={handleSelectTheme}
        onOpenUpload={() => setIsUploadOpen(true)}
        onLoadSample={handleLoadSample}
        onClearData={handleClearData}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Toast Alert */}
        {toastMessage && (
          <div
            className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2 duration-150"
            style={{
              backgroundColor: 'var(--theme-header-bg)',
              color: '#ffffff',
              border: '1px solid var(--theme-header-border)',
            }}
          >
            <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
            <span>{toastMessage}</span>
          </div>
        )}

        {rawRows.length === 0 ? (
          /* Empty State */
          <div
            className="border rounded-xl p-12 text-center max-w-xl mx-auto shadow-sm space-y-4"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
            }}
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto"
              style={{
                backgroundColor: 'var(--theme-card-subtle)',
                color: 'var(--theme-text-secondary)',
              }}
            >
              <Upload className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--theme-text-primary)' }}>
              No Challan or PO Data Uploaded
            </h2>
            <p className="text-xs max-w-md mx-auto" style={{ color: 'var(--theme-text-secondary)' }}>
              Upload your spreadsheet containing columns (SL, PO, Item, Challan #, Text, Quantity, Unit, Unit Price, Amount) to extract and summarize totals.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="empty-upload-btn"
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 text-white font-semibold text-xs rounded shadow-xs transition-opacity flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Excel / CSV</span>
              </button>
              <button
                id="empty-sample-btn"
                type="button"
                onClick={handleLoadSample}
                className="px-4 py-2 font-semibold text-xs rounded transition-colors flex items-center gap-2 border"
                style={{
                  backgroundColor: 'var(--theme-card-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-primary)',
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: 'var(--theme-primary)' }} />
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
            <div
              className="flex border-b space-x-6 text-xs font-semibold"
              style={{ borderColor: 'var(--theme-card-border)' }}
            >
              <button
                id="tab-extracted-view"
                type="button"
                onClick={() => setActiveTab('extracted')}
                className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === 'extracted'
                    ? 'font-bold'
                    : 'border-transparent hover:opacity-80'
                }`}
                style={{
                  borderColor: activeTab === 'extracted' ? 'var(--theme-primary)' : 'transparent',
                  color: activeTab === 'extracted' ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
                }}
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
                    ? 'font-bold'
                    : 'border-transparent hover:opacity-80'
                }`}
                style={{
                  borderColor: activeTab === 'challan_audit' ? 'var(--theme-primary)' : 'transparent',
                  color: activeTab === 'challan_audit' ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
                }}
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
                    ? 'font-bold'
                    : 'border-transparent hover:opacity-80'
                }`}
                style={{
                  borderColor: activeTab === 'raw_data' ? 'var(--theme-primary)' : 'transparent',
                  color: activeTab === 'raw_data' ? 'var(--theme-primary)' : 'var(--theme-text-muted)',
                }}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="border rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4"
            style={{
              backgroundColor: 'var(--theme-card-bg)',
              borderColor: 'var(--theme-card-border)',
            }}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--theme-text-primary)' }}>Clear All Records?</h3>
                <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>This will remove all {rawRows.length} dataset rows and verification states.</p>
              </div>
            </div>

            <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
              Are you sure you want to permanently clear the current dataset? You can re-upload your Excel/CSV or reload sample data at any time.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold border rounded transition-colors"
                style={{
                  backgroundColor: 'var(--theme-card-subtle)',
                  borderColor: 'var(--theme-card-border)',
                  color: 'var(--theme-text-secondary)',
                }}
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
