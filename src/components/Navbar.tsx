import React, { useState } from 'react';
import {
  CheckSquare,
  ChevronDown,
  Download,
  FileSpreadsheet,
  Layers,
  Printer,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { ExtractedRow, RawRow } from '../types';
import { groupExtractedByChallan } from '../utils/aggregator';
import {
  exportChallanAuditToExcel,
  exportExtractedToExcel,
  exportToCSV,
} from '../utils/exporter';

interface NavbarProps {
  rawRowCount: number;
  extractedRows: ExtractedRow[];
  onOpenUpload: () => void;
  onLoadSample: () => void;
  onClearData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  rawRowCount,
  extractedRows,
  onOpenUpload,
  onLoadSample,
  onClearData,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExportExcel = () => {
    exportExtractedToExcel(extractedRows);
    setShowExportMenu(false);
  };

  const handleExportCSV = () => {
    exportToCSV(extractedRows);
    setShowExportMenu(false);
  };

  const handleExportChallanAudit = () => {
    const groups = groupExtractedByChallan(extractedRows);
    exportChallanAuditToExcel(groups);
    setShowExportMenu(false);
  };

  const handlePrint = () => {
    window.print();
    setShowExportMenu(false);
  };

  const verifiedCount = extractedRows.filter(r => r.isChecked).length;

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-slate-900 text-white flex-shrink-0 sticky top-0 z-30 shadow-sm border-b border-slate-800">
      {/* App Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white shadow-sm flex-shrink-0">
          <Layers className="w-5 h-5" />
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-white flex items-center gap-2">
            ReconView Pro
            <span className="text-slate-400 font-normal text-xs sm:text-sm">v2.4.0</span>
          </h1>
          <span className="hidden lg:inline text-xs text-slate-400 border-l border-slate-700 pl-3">
            Challan &amp; PO Extractor
          </span>
        </div>
      </div>

      {/* Action Controls & Data Status */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium">
        {rawRowCount > 0 ? (
          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs">
            <span>Data Source:</span>
            <span className="text-white font-medium bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {rawRowCount} Line Records ({verifiedCount}/{extractedRows.length} Reconciled)
            </span>
          </div>
        ) : (
          <span className="hidden md:inline text-slate-400 text-xs">No dataset loaded</span>
        )}

        {/* Load Sample Data button */}
        <button
          id="btn-load-sample"
          type="button"
          onClick={onLoadSample}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors"
          title="Load realistic sample data"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Sample Dataset</span>
        </button>

        {/* Upload Data Button */}
        <button
          id="btn-open-upload"
          type="button"
          onClick={onOpenUpload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs sm:text-sm font-medium transition-colors shadow-sm"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Dataset</span>
        </button>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            id="btn-export-menu"
            type="button"
            onClick={() => setShowExportMenu(!showExportMenu)}
            disabled={extractedRows.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium border rounded transition-colors ${
              extractedRows.length === 0
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-500'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Export</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-60 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 text-xs">
              <button
                type="button"
                onClick={handleExportExcel}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold text-slate-900">Extracted Table (.xlsx)</div>
                  <div className="text-[10px] text-slate-400">Aggregated with computed sums</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportChallanAudit}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors"
              >
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900">Challan Audit Report (.xlsx)</div>
                  <div className="text-[10px] text-slate-400">Organized by delivery notes</div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="font-medium text-slate-800">Export CSV Data</span>
              </button>

              <div className="border-t border-slate-100 my-1"></div>

              <button
                type="button"
                onClick={handlePrint}
                className="w-full text-left px-3.5 py-1.5 hover:bg-slate-50 flex items-center gap-2 text-slate-600"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print Table</span>
              </button>
            </div>
          )}
        </div>

        {rawRowCount > 0 && (
          <button
            id="btn-clear-all-data"
            type="button"
            onClick={onClearData}
            title="Clear all dataset records"
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/80 border border-rose-800/60 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear All</span>
          </button>
        )}
      </div>
    </header>
  );
};

